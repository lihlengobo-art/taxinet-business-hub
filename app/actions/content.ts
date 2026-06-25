'use server'

import { db } from '@/lib/db'
import {
  ads,
  connectionSessions,
  contentItems,
  engagementEvents,
  leads,
  notifications,
} from '@/lib/db/schema'
import type { AgeGroup, UserType } from '@/lib/user-types'
import { RANK_NAME } from '@/lib/user-types'
import { and, desc, eq, isNull, or, sql } from 'drizzle-orm'

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
  const conditions = [eq(contentItems.active, true), eq(contentItems.userType, userType)]

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
  return db
    .select()
    .from(notifications)
    .where(or(eq(notifications.audience, 'all'), eq(notifications.audience, userType)))
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
