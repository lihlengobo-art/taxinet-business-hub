'use client'

import { Button } from '@/components/ui/button'
import type { DateRange } from '@/app/actions/admin-analytics'
import { cn } from '@/lib/utils'

const PRESETS: { label: string; days: number }[] = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

function rangeForDays(days: number): DateRange {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - (days - 1))
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

function daysInRange(range: DateRange): number {
  const from = new Date(range.from)
  const to = new Date(range.to)
  return Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1
}

export function RangePicker({
  range,
  onChange,
  disabled,
}: {
  range: DateRange
  onChange: (r: DateRange) => void
  disabled?: boolean
}) {
  const activeDays = daysInRange(range)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-lg border border-border bg-background p-0.5">
        {PRESETS.map((p) => {
          const isActive = activeDays === p.days
          return (
            <button
              key={p.label}
              type="button"
              disabled={disabled}
              onClick={() => onChange(rangeForDays(p.days))}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.label}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={range.from}
          max={range.to}
          disabled={disabled}
          onChange={(e) => onChange({ ...range, from: e.target.value })}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground disabled:opacity-50"
          aria-label="From date"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <input
          type="date"
          value={range.to}
          min={range.from}
          max={new Date().toISOString().slice(0, 10)}
          disabled={disabled}
          onChange={(e) => onChange({ ...range, to: e.target.value })}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground disabled:opacity-50"
          aria-label="To date"
        />
      </div>
    </div>
  )
}
