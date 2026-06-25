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
          getRevenueByPartner(range),
          getExpensesByCategory(range),
          listSales(range),
          listExpenses(range),
        ]).then(([summary, revenueByDay, revenueByPartner, expenseCats, sales, expenses]) => ({
          summary,
          revenueByDay,
          revenueByPartner,
          expenseCats,
          sales,
          expenses,
        }))
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
