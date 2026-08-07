'use server'

import { db } from '@/lib/db'
import {
  ads,
  connections,
  connectionSessions,
  contentItems,
  engagementEvents,
  leads,
  notifications,
} from '@/lib/db/schema'
import { CONNECTION_PRICE, DEVICE_COOKIE } from '@/lib/pricing'
import { currentRotationBucket } from '@/lib/rotation'
import type { AgeGroup, UserType } from '@/lib/user-types'
import { RANK_NAME } from '@/lib/user-types'
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'
import { cookies } from 'next/headers'

const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

/**
 * Records one paid R7 Wi-Fi connection for the day, as soon as a visitor
 * reaches the site — before they pick vendor/passenger/etc. A persistent
 * device cookie identifies the phone, and the unique (device_id,
 * connection_date) constraint means the same phone is only counted once per
 * day, no matter how many times it re-opens the site. The next day counts
 * again as a fresh R7. This is what drives Wi-Fi revenue in the admin.
 */
export async function recordConnection() {
  const store = await cookies()
  let deviceId = store.get(DEVICE_COOKIE)?.value
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    store.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: DEVICE_COOKIE_MAX_AGE,
    })
  }

  try {
    await db
      .insert(connections)
      .values({ deviceId, amount: String(CONNECTION_PRICE), rankName: RANK_NAME })
      .onConflictDoNothing({
        target: [connections.deviceId, connections.connectionDate],
      })
  } catch {
    // Never break the passenger flow if the connection log fails.
  }
}

/**
 * Records a Wi-Fi connection session for analytics, then returns the content
 * tailored to the chosen user type (and age group for passengers).
 */
export async function startSession(input: {
  sessionId: string
  userType: UserType
  ageGroup?: AgeGroup | null
  device?: string
}) {
  await db.insert(connectionSessions).values({
    sessionId: input.sessionId,
    userType: input.userType,
    ageGroup: input.ageGroup ?? null,
    rankName: RANK_NAME,
    device: input.device ?? 'Unknown',
  })

  await db.insert(engagementEvents).values({
    sessionId: input.sessionId,
    userType: input.userType,
    ageGroup: input.ageGroup ?? null,
    eventType: 'view',
    target: 'dashboard',
  })
}

export async function getContentFor(userType: UserType, ageGroup?: AgeGroup | null) {
  const bucket = currentRotationBucket()
  const conditions = [
    eq(contentItems.active, true),
    eq(contentItems.userType, userType),
    // Evergreen items (NULL) always show; rotating items only on their week.
    or(isNull(contentItems.rotationGroup), eq(contentItems.rotationGroup, bucket)),
  ]

  // Passengers get age-targeted content; other roles ignore age group.
  if (userType === 'passenger' && ageGroup) {
    conditions.push(eq(contentItems.ageGroup, ageGroup))
  }

  return db
    .select()
    .from(contentItems)
    .where(and(...conditions))
    .orderBy(desc(contentItems.priority))
}

export async function getAdsFor(userType: UserType, ageGroup?: AgeGroup | null) {
  const audienceMatch = or(
    isNull(ads.userType),
    eq(ads.userType, userType),
  )

  const rows = await db
    .select()
    .from(ads)
    .where(and(eq(ads.active, true), audienceMatch))
    .orderBy(desc(ads.createdAt))

  // Prefer age-specific ads for passengers, then fall back to general ones.
  if (userType === 'passenger' && ageGroup) {
    const targeted = rows.filter((a) => a.ageGroup === ageGroup)
    const general = rows.filter((a) => !a.ageGroup)
    return [...targeted, ...general]
  }
  return rows.filter((a) => !a.ageGroup || a.userType === userType)
}

export async function getNotificationsFor(userType: UserType) {
  const bucket = currentRotationBucket()
  return db
    .select()
    .from(notifications)
    .where(
      and(
        or(eq(notifications.audience, 'all'), eq(notifications.audience, userType)),
        // Evergreen messages (NULL) always show; rotating ones only on their week.
        or(isNull(notifications.rotationGroup), eq(notifications.rotationGroup, bucket)),
      ),
    )
    .orderBy(desc(notifications.createdAt))
    .limit(6)
}

export async function trackEvent(input: {
  sessionId: string
  userType: UserType
  ageGroup?: AgeGroup | null
  eventType: 'content_click' | 'ad_click' | 'view'
  target?: string
  adId?: number
  advertiser?: string
}) {
  await db.insert(engagementEvents).values({
    sessionId: input.sessionId,
    userType: input.userType,
    ageGroup: input.ageGroup ?? null,
    eventType: input.eventType,
    target: input.target ?? null,
  })

  if (input.eventType === 'ad_click' && input.adId) {
    await db
      .update(ads)
      .set({ clicks: sql`${ads.clicks} + 1` })
      .where(eq(ads.id, input.adId))
  }

  // A click on a sponsored ad or a partner offer is a qualified lead.
  // This is recorded invisibly for the admin pipeline — no UI change.
  if (input.eventType === 'ad_click' || input.eventType === 'content_click') {
    await db.insert(leads).values({
      source: input.eventType === 'ad_click' ? 'ad' : 'offer',
      advertiser: input.advertiser ?? null,
      adId: input.adId ?? null,
      userType: input.userType,
      ageGroup: input.ageGroup ?? null,
      category: input.target ?? null,
      rankName: RANK_NAME,
    })
  }
}

export async function recordAdImpressions(adIds: number[]) {
  if (adIds.length === 0) return
  await db
    .update(ads)
    .set({ impressions: sql`${ads.impressions} + 1` })
    .where(
      sql`${ads.id} in (${sql.join(
        adIds.map((id) => sql`${id}`),
        sql`, `,
      )})`,
    )
}
