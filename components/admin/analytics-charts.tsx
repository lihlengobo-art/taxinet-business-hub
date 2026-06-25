'use client'

import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { userTypeLabel } from '@/lib/user-types'
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

const trafficConfig = {
  count: { label: 'Connections', color: 'var(--chart-1)' },
} satisfies ChartConfig

const typeConfig = {
  count: { label: 'Connections', color: 'var(--chart-1)' },
} satisfies ChartConfig

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

export function TrafficChart({
  data,
}: {
  data: { day: string; count: number }[]
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.day).toLocaleDateString('en-ZA', {
      day: 'numeric',
      month: 'short',
    }),
  }))

  return (
    <Card className="p-5">
      <h2 className="font-semibold">Daily connections</h2>
      <p className="text-sm text-muted-foreground">Wi-Fi sessions over the last 14 days</p>
      <ChartContainer config={trafficConfig} className="mt-4 h-[240px] w-full">
        <AreaChart data={formatted} margin={{ left: 0, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="fillTraffic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-count)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            className="text-xs"
          />
          <YAxis tickLine={false} axisLine={false} width={28} className="text-xs" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            dataKey="count"
            type="monotone"
            stroke="var(--color-count)"
            strokeWidth={2}
            fill="url(#fillTraffic)"
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}

export function UserTypeChart({
  data,
}: {
  data: { userType: string; count: number }[]
}) {
  const formatted = data.map((d) => ({
    ...d,
    label: userTypeLabel(d.userType),
  }))

  return (
    <Card className="p-5">
      <h2 className="font-semibold">Audience mix</h2>
      <p className="text-sm text-muted-foreground">Connections by user type</p>
      <ChartContainer config={typeConfig} className="mt-4 h-[240px] w-full">
        <BarChart data={formatted} layout="vertical" margin={{ left: 8, right: 16 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            width={72}
            className="text-xs"
          />
          <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
          <Bar dataKey="count" radius={6}>
            {formatted.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </Card>
  )
}

export function AgeChart({
  data,
}: {
  data: { ageGroup: string | null; count: number }[]
}) {
  const formatted = data
    .filter((d) => d.ageGroup)
    .map((d, i) => ({
      name: d.ageGroup as string,
      value: d.count,
      fill: PIE_COLORS[i % PIE_COLORS.length],
    }))

  const config: ChartConfig = Object.fromEntries(
    formatted.map((d, i) => [
      d.name,
      { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] },
    ]),
  )

  return (
    <Card className="p-5">
      <h2 className="font-semibold">Passenger age groups</h2>
      <p className="text-sm text-muted-foreground">Who is connecting at the rank</p>
      <ChartContainer config={config} className="mt-2 h-[240px] w-full">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie data={formatted} dataKey="value" nameKey="name" innerRadius={52} strokeWidth={3}>
            {formatted.map((d) => (
              <Cell key={d.name} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {formatted.map((d) => (
          <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: d.fill }}
              aria-hidden="true"
            />
            {d.name}
          </span>
        ))}
      </div>
    </Card>
  )
}
