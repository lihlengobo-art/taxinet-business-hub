'use server'

import { getAdminUser } from '@/lib/admin/auth'
import { canAccess } from '@/lib/admin/roles'
import type { DateRange } from './admin-analytics'
import {
  getAgeBreakdown,
  getAnalyticsOverview,
  getAudienceByUserType,
  getFunnel,
  getTopCategories,
  getTrafficByDay,
} from './admin-analytics'
import {
  getConnectionsByDay,
  getExpensesByCategory,
  getFinanceSummary,
  getLeadSummary,
  getRevenueByDay,
  getRevenueByPartner,
  listExpenses,
  listPartners,
  listSales,
} from './admin-finance'

// Loads exactly the data the current admin's role is allowed to see for a range.
export async function loadDashboard(range: DateRange) {
  const user = await getAdminUser()
  if (!user) throw new Error('Unauthorized')
  const role = user.role

  const [analytics, finance, partners] = await Promise.all([
    canAccess(role, 'analytics')
      ? Promise.all([
          getAnalyticsOverview(range),
          getTrafficByDay(range),
          getAudienceByUserType(range),
          getAgeBreakdown(range),
          getFunnel(range),
          getTopCategories(range),
        ]).then(([overview, traffic, audience, ages, funnel, categories]) => ({
          overview,
          traffic,
          audience,
          ages,
          funnel,
          categories,
        }))
      : null,
    canAccess(role, 'finance')
      ? Promise.all([
          getFinanceSummary(range),
          getRevenueByDay(range),
          getConnectionsByDay(range),
          getRevenueByPartner(range),
          getExpensesByCategory(range),
          listSales(range),
          listExpenses(range),
        ]).then(
          ([summary, revenueByDay, connectionsByDay, revenueByPartner, expenseCats, sales, expenses]) => {
            // Merge partner revenue and Wi-Fi connection revenue into one daily series.
            const byDay = new Map<
              string,
              { day: string; revenue: number; commission: number; wifi: number }
            >()
            for (const d of revenueByDay) {
              byDay.set(d.day, { day: d.day, revenue: d.revenue, commission: d.commission, wifi: 0 })
            }
            for (const c of connectionsByDay) {
              const existing = byDay.get(c.day) ?? {
                day: c.day,
                revenue: 0,
                commission: 0,
                wifi: 0,
              }
              existing.wifi = c.revenue
              byDay.set(c.day, existing)
            }
            const merged = [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day))
            return {
              summary,
              revenueByDay: merged,
              revenueByPartner,
              expenseCats,
              sales,
              expenses,
            }
          },
        )
      : null,
    canAccess(role, 'partners')
      ? Promise.all([listPartners(), getLeadSummary(range)]).then(([list, leads]) => ({
          list,
          leads,
        }))
      : null,
  ])

  return { analytics, finance, partners }
}

export type DashboardData = Awaited<ReturnType<typeof loadDashboard>>
