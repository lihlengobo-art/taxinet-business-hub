import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

export function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'primary',
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  accent?: 'primary' | 'accent' | 'positive' | 'destructive'
}) {
  const accentClass = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent/10 text-accent',
    positive: 'bg-primary/10 text-primary',
    destructive: 'bg-destructive/10 text-destructive',
  }[accent]

  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', accentClass)}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold leading-tight">{value}</p>
        {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </Card>
  )
}
