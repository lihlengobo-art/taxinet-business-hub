'use server'

import { requireSection } from '@/lib/admin/auth'
import { db } from '@/lib/db'
import {
  connectionSessions,
  engagementEvents,
  leads,
} from '@/lib/db/schema'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { and, desc, gte, lte, sql } from 'drizzle-orm'

export type DateRange = { from: string; to: string }

function rangeDays(range?: DateRange): number {
  if (!range) return 30
  const from = new Date(range.from)
  const to = new Date(range.to)
  const diff = Math.round((to.getTime() - from.getTime()) / 86_400_000)
  return Math.max(1, diff + 1)
}

// SQL helpers that clamp a timestamp column to the selected range (inclusive).
function within(col: AnyPgColumn, range?: DateRange) {
  if (!range) return undefined
  return and(
    gte(col, sql`${range.from}::timestamp`),
    lte(col, sql`(${range.to}::date + interval '1 day')`),
  )
}

export async function getAnalyticsOverview(range?: DateRange) {
  await requireSection('analytics')

  const [sessions] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(connectionSessions)
    .where(within(connectionSessions.createdAt, range))

  const [uniqueVisitors] = await db
    .select({ count: sql<number>`count(distinct ${connectionSessions.userType} || ${connectionSessions.id})::int` })
    .from(connectionSessions)
    .where(within(connectionSessions.createdAt, range))

  const [events] = await db
    .select({
      total: sql<number>`count(*)::int`,
      clicks: sql<number>`count(*) filter (where ${engagementEvents.eventType} in ('content_click','ad_click'))::int`,
    })
    .from(engagementEvents)
    .where(within(engagementEvents.createdAt, range))

  const [leadCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(leads)
    .where(within(leads.createdAt, range))

  const totalSessions = sessions.count ?? 0
  const totalClicks = events.clicks ?? 0
  const totalLeads = leadCount.count ?? 0
  const engagementRate =
    events.total > 0 ? Math.round((totalClicks / events.total) * 100) : 0
  const conversionRate =
    totalSessions > 0 ? Math.round((totalLeads / totalSessions) * 1000) / 10 : 0

  return {
    totalSessions,
    avgDailySessions: Math.round(totalSessions / rangeDays(range)),
    totalClicks,
    totalLeads,
    engagementRate,
    conversionRate,
  }
}

export async function getTrafficByDay(range?: DateRange) {
  await requireSection('analytics')
  return db
    .select({
      day: sql<string>`to_char(${connectionSessions.createdAt}, 'YYYY-MM-DD')`,
      sessions: sql<number>`count(*)::int`,
    })
    .from(connectionSessions)
    .where(within(connectionSessions.createdAt, range))
    .groupBy(sql`to_char(${connectionSessions.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${connectionSessions.createdAt}, 'YYYY-MM-DD')`)
}

export async function getAudienceByUserType(range?: DateRange) {
  await requireSection('analytics')
  return db
    .select({
      userType: connectionSessions.userType,
      count: sql<number>`count(*)::int`,
    })
    .from(connectionSessions)
    .where(within(connectionSessions.createdAt, range))
    .groupBy(connectionSessions.userType)
    .orderBy(desc(sql`count(*)`))
}

export async function getAgeBreakdown(range?: DateRange) {
  await requireSection('analytics')
  return db
    .select({
      ageGroup: sql<string>`coalesce(${connectionSessions.ageGroup}, 'n/a')`,
      count: sql<number>`count(*)::int`,
    })
    .from(connectionSessions)
    .where(within(connectionSessions.createdAt, range))
    .groupBy(connectionSessions.ageGroup)
    .orderBy(sql`${connectionSessions.ageGroup}`)
}

// Conversion funnel: connected -> engaged (any event) -> clicked -> lead.
export async function getFunnel(range?: DateRange) {
  await requireSection('analytics')

  const [{ connected }] = await db
    .select({ connected: sql<number>`count(*)::int` })
    .from(connectionSessions)
    .where(within(connectionSessions.createdAt, range))

  const [{ engaged }] = await db
    .select({ engaged: sql<number>`count(distinct ${engagementEvents.sessionId})::int` })
    .from(engagementEvents)
    .where(within(engagementEvents.createdAt, range))

  const [{ clicked }] = await db
    .select({
      clicked: sql<number>`count(distinct ${engagementEvents.sessionId}) filter (where ${engagementEvents.eventType} in ('content_click','ad_click'))::int`,
    })
    .from(engagementEvents)
    .where(within(engagementEvents.createdAt, range))

  const [{ converted }] = await db
    .select({ converted: sql<number>`count(*)::int` })
    .from(leads)
    .where(within(leads.createdAt, range))

  return [
    { step: 'Connected to Wi-Fi', value: connected ?? 0 },
    { step: 'Engaged with content', value: engaged ?? 0 },
    { step: 'Clicked an offer', value: clicked ?? 0 },
    { step: 'Qualified lead', value: converted ?? 0 },
  ]
}

export async function getTopCategories(range?: DateRange) {
  await requireSection('analytics')
  return db
    .select({
      target: sql<string>`coalesce(${engagementEvents.target}, 'Unknown')`,
      clicks: sql<number>`count(*)::int`,
    })
    .from(engagementEvents)
    .where(
      and(
        within(engagementEvents.createdAt, range),
        sql`${engagementEvents.eventType} in ('content_click','ad_click')`,
      ),
    )
    .groupBy(engagementEvents.target)
    .orderBy(desc(sql`count(*)`))
    .limit(8)
}
