'use client'

import { Card } from '@/components/ui/card'
import type { DashboardData } from '@/app/actions/admin-dashboard'
import type { DateRange } from '@/app/actions/admin-analytics'
import type { AdminUser } from '@/lib/admin/auth'
import { roleLabel } from '@/lib/admin/roles'
import { formatNumber, formatZAR } from '@/lib/admin/format'
import { KpiCard } from '../kpi-card'
import { MousePointerClick, TrendingUp, Users, Wallet } from 'lucide-react'

export function OverviewSection({
  user,
  data,
}: {
  user: AdminUser
  data: DashboardData
  range: DateRange
}) {
  const a = data.analytics
  const f = data.finance
  const p = data.partners

  return (
    <div className="flex flex-col gap-5">
      <Card className="bg-primary p-5 text-primary-foreground">
        <p className="text-sm opacity-90">Welcome back, {user.name.split(' ')[0]}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {roleLabel(user.role)} dashboard
        </p>
        <p className="mt-1 text-sm opacity-90">
          Here is your snapshot for the selected period.
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {a && (
          <>
            <KpiCard
              label="Wi-Fi sessions"
              value={formatNumber(a.overview.totalSessions)}
              hint={`${formatNumber(a.overview.avgDailySessions)}/day avg`}
              icon={Users}
            />
            <KpiCard
              label="Offer clicks"
              value={formatNumber(a.overview.totalClicks)}
              hint={`${a.overview.engagementRate}% engagement`}
              icon={MousePointerClick}
            />
          </>
        )}
        {p && (
          <KpiCard
            label="Leads generated"
            value={formatNumber(p.leads.total)}
            hint="From ads & offers"
            icon={TrendingUp}
            accent="accent"
          />
        )}
        {f && (
          <KpiCard
            label="Net profit"
            value={formatZAR(f.summary.netProfit)}
            hint={`${formatZAR(f.summary.commission)} commission`}
            icon={Wallet}
            accent={f.summary.netProfit >= 0 ? 'positive' : 'destructive'}
          />
        )}
      </div>

      <Card className="p-5">
        <h2 className="text-sm font-semibold">Your access</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          As {roleLabel(user.role)}, you can view the sections shown in the bottom
          navigation. Use the date range at the top to adjust every figure on screen.
        </p>
      </Card>
    </div>
  )
}
