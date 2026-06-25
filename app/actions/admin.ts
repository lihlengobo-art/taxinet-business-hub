'use server'

import { db } from '@/lib/db'
import {
  ads,
  connectionSessions,
  engagementEvents,
  incidentReports,
  notifications,
  vendorApplications,
} from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function getAdminOverview() {
  const [totals] = await db
    .select({
      sessions: sql<number>`count(*)::int`,
    })
    .from(connectionSessions)

  const [today] = await db
    .select({ sessions: sql<number>`count(*)::int` })
    .from(connectionSessions)
    .where(sql`${connectionSessions.createdAt} >= current_date`)

  const [events] = await db
    .select({
      total: sql<number>`count(*)::int`,
      clicks: sql<number>`count(*) filter (where ${engagementEvents.eventType} in ('content_click','ad_click'))::int`,
    })
    .from(engagementEvents)

  const [openIncidents] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(incidentReports)
    .where(sql`${incidentReports.status} <> 'resolved'`)

  const engagementRate =
    events.total > 0 ? Math.round((events.clicks / events.total) * 100) : 0

  return {
    totalSessions: totals.sessions ?? 0,
    todaySessions: today.sessions ?? 0,
    totalEvents: events.total ?? 0,
    engagementRate,
    openIncidents: openIncidents.count ?? 0,
  }
}

export async function getSessionsByDay() {
  const rows = await db
    .select({
      day: sql<string>`to_char(${connectionSessions.createdAt}, 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(connectionSessions)
    .where(sql`${connectionSessions.createdAt} >= current_date - interval '13 days'`)
    .groupBy(sql`to_char(${connectionSessions.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${connectionSessions.createdAt}, 'YYYY-MM-DD')`)
  return rows
}

export async function getSessionsByUserType() {
  return db
    .select({
      userType: connectionSessions.userType,
      count: sql<number>`count(*)::int`,
    })
    .from(connectionSessions)
    .groupBy(connectionSessions.userType)
    .orderBy(desc(sql`count(*)`))
}

export async function getPassengerAgeBreakdown() {
  return db
    .select({
      ageGroup: connectionSessions.ageGroup,
      count: sql<number>`count(*)::int`,
    })
    .from(connectionSessions)
    .where(eq(connectionSessions.userType, 'passenger'))
    .groupBy(connectionSessions.ageGroup)
    .orderBy(sql`${connectionSessions.ageGroup}`)
}

export async function getTopContent() {
  return db
    .select({
      target: engagementEvents.target,
      clicks: sql<number>`count(*)::int`,
    })
    .from(engagementEvents)
    .where(eq(engagementEvents.eventType, 'content_click'))
    .groupBy(engagementEvents.target)
    .orderBy(desc(sql`count(*)`))
    .limit(6)
}

export async function getAllAds() {
  return db.select().from(ads).orderBy(desc(ads.createdAt))
}

export async function getAllIncidents() {
  return db.select().from(incidentReports).orderBy(desc(incidentReports.createdAt))
}

export async function getAllNotifications() {
  return db.select().from(notifications).orderBy(desc(notifications.createdAt))
}

export async function getVendorApplications() {
  return db.select().from(vendorApplications).orderBy(desc(vendorApplications.createdAt))
}

export async function updateIncidentStatus(id: number, status: string) {
  await db.update(incidentReports).set({ status }).where(eq(incidentReports.id, id))
  revalidatePath('/rank-management')
}

export async function toggleAd(id: number, active: boolean) {
  await db.update(ads).set({ active }).where(eq(ads.id, id))
  revalidatePath('/rank-management')
}

export async function createAd(input: {
  title: string
  advertiser: string
  body: string
  ctaLabel?: string
  userType?: string | null
  accent?: string
}) {
  if (!input.title.trim() || !input.advertiser.trim()) {
    return { ok: false, error: 'Title and advertiser are required.' }
  }
  await db.insert(ads).values({
    title: input.title.trim(),
    advertiser: input.advertiser.trim(),
    body: input.body.trim(),
    ctaLabel: input.ctaLabel?.trim() || 'Learn more',
    userType: input.userType || null,
    accent: input.accent || 'primary',
  })
  revalidatePath('/rank-management')
  return { ok: true }
}

export async function createNotification(input: {
  audience: string
  title: string
  body: string
  level: string
}) {
  if (!input.title.trim() || !input.body.trim()) {
    return { ok: false, error: 'Title and body are required.' }
  }
  await db.insert(notifications).values({
    audience: input.audience,
    title: input.title.trim(),
    body: input.body.trim(),
    level: input.level,
  })
  revalidatePath('/rank-management')
  return { ok: true }
}
