import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Activity, AlertTriangle, MousePointerClick, Users, Wifi } from 'lucide-react'

const icons = { Wifi, Users, Activity, MousePointerClick, AlertTriangle }

export function StatCards({
  stats,
}: {
  stats: {
    totalSessions: number
    todaySessions: number
    totalEvents: number
    engagementRate: number
    openIncidents: number
  }
}) {
  const cards: {
    label: string
    value: string
    sub: string
    icon: keyof typeof icons
    danger?: boolean
  }[] = [
    {
      label: 'Total connections',
      value: stats.totalSessions.toLocaleString(),
      sub: 'All-time Wi-Fi sessions',
      icon: 'Wifi',
    },
    {
      label: 'Connections today',
      value: stats.todaySessions.toLocaleString(),
      sub: 'Since midnight',
      icon: 'Users',
    },
    {
      label: 'Engagement rate',
      value: `${stats.engagementRate}%`,
      sub: 'Clicks per interaction',
      icon: 'MousePointerClick',
    },
    {
      label: 'Total interactions',
      value: stats.totalEvents.toLocaleString(),
      sub: 'Views & clicks tracked',
      icon: 'Activity',
    },
    {
      label: 'Open incidents',
      value: stats.openIncidents.toLocaleString(),
      sub: 'Needing attention',
      icon: 'AlertTriangle',
      danger: stats.openIncidents > 0,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      {cards.map((c) => {
        const Icon = icons[c.icon]
        return (
          <Card key={c.label} className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-lg',
                  c.danger ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.sub}</p>
          </Card>
        )
      })}
    </div>
  )
}
