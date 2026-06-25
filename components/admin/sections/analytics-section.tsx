'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import type { DashboardData } from '@/app/actions/admin-dashboard'
import type { DateRange } from '@/app/actions/admin-analytics'
import { downloadCsv, formatDay, formatNumber } from '@/lib/admin/format'
import { userTypeLabel } from '@/lib/user-types'
import { Download, Gauge, MousePointerClick, Target, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from 'recharts'
import { KpiCard } from '../kpi-card'

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

type Analytics = NonNullable<DashboardData['analytics']>

export function AnalyticsSection({
  data,
  range,
}: {
  data: Analytics
  range: DateRange
}) {
  const traffic = data.traffic.map((d) => ({ ...d, label: formatDay(d.day) }))
  const audience = data.audience.map((d) => ({
    label: userTypeLabel(d.userType),
    count: d.count,
  }))
  const ages = data.ages
    .filter((d) => d.ageGroup && d.ageGroup !== 'n/a')
    .map((d, i) => ({ name: d.ageGroup, value: d.count, fill: PIE_COLORS[i % PIE_COLORS.length] }))

  const maxFunnel = Math.max(1, ...data.funnel.map((f) => f.value))

  function exportCsv() {
    downloadCsv(
      `analytics-${range.from}-to-${range.to}`,
      ['Date', 'Sessions'],
      traffic.map((d) => [d.day, d.sessions]),
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Sessions" value={formatNumber(data.overview.totalSessions)} icon={Users} />
        <KpiCard
          label="Offer clicks"
          value={formatNumber(data.overview.totalClicks)}
          icon={MousePointerClick}
        />
        <KpiCard
          label="Engagement"
          value={`${data.overview.engagementRate}%`}
          icon={Gauge}
          accent="accent"
        />
        <KpiCard
          label="Conversion"
          value={`${data.overview.conversionRate}%`}
          hint={`${formatNumber(data.overview.totalLeads)} leads`}
          icon={Target}
          accent="accent"
        />
      </div>

      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Daily Wi-Fi sessions</h2>
            <p className="text-sm text-muted-foreground">Connections over the selected period</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
        </div>
        <ChartContainer
          config={{ sessions: { label: 'Sessions', color: 'var(--chart-1)' } }}
          className="mt-4 h-[240px] w-full"
        >
          <AreaChart data={traffic} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} className="text-xs" />
            <YAxis tickLine={false} axisLine={false} width={28} className="text-xs" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area dataKey="sessions" type="monotone" stroke="var(--color-sessions)" strokeWidth={2} fill="url(#fillSessions)" />
          </AreaChart>
        </ChartContainer>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-semibold">Audience mix</h2>
          <p className="text-sm text-muted-foreground">Sessions by user type</p>
          <ChartContainer
            config={{ count: { label: 'Sessions', color: 'var(--chart-1)' } }}
            className="mt-4 h-[220px] w-full"
          >
            <BarChart data={audience} layout="vertical" margin={{ left: 8, right: 16 }}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={72} className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
              <Bar dataKey="count" radius={6}>
                {audience.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>

        <Card className="p-5">
          <h2 className="font-semibold">Passenger age groups</h2>
          <p className="text-sm text-muted-foreground">Who is connecting at the rank</p>
          {ages.length > 0 ? (
            <ChartContainer
              config={Object.fromEntries(ages.map((d, i) => [d.name, { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }])) as ChartConfig}
              className="mt-2 h-[220px] w-full"
            >
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie data={ages} dataKey="value" nameKey="name" innerRadius={50} strokeWidth={3}>
                  {ages.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          ) : (
            <p className="mt-8 text-center text-sm text-muted-foreground">No age data yet.</p>
          )}
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-semibold">Conversion funnel</h2>
        <p className="text-sm text-muted-foreground">From Wi-Fi connection to qualified lead</p>
        <div className="mt-4 flex flex-col gap-3">
          {data.funnel.map((step, i) => {
            const pct = Math.round((step.value / maxFunnel) * 100)
            const conv =
              i === 0 || data.funnel[0].value === 0
                ? 100
                : Math.round((step.value / data.funnel[0].value) * 100)
            return (
              <div key={step.step}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium">{step.step}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(step.value)} · {conv}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Top categories</h2>
        <p className="text-sm text-muted-foreground">Most-clicked content & offers</p>
        <div className="mt-3 flex flex-col divide-y divide-border">
          {data.categories.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No clicks recorded yet.</p>
          )}
          {data.categories.map((c) => (
            <div key={c.target} className="flex items-center justify-between py-2.5 text-sm">
              <span className="truncate">{c.target}</span>
              <span className="font-semibold">{formatNumber(c.clicks)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
