import { Card } from '@/components/ui/card'
import type { Notification } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { AlertTriangle, Bell, Info, OctagonAlert } from 'lucide-react'

const levelStyles: Record<
  string,
  { icon: typeof Info; cls: string; label: string }
> = {
  info: { icon: Info, cls: 'text-primary bg-primary/10', label: 'Update' },
  warning: {
    icon: AlertTriangle,
    cls: 'text-accent-foreground bg-accent/30',
    label: 'Notice',
  },
  danger: {
    icon: OctagonAlert,
    cls: 'text-destructive bg-destructive/10',
    label: 'Alert',
  },
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.round(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.round(hrs / 24)}d ago`
}

export function NotificationsPanel({ items }: { items: Notification[] }) {
  if (items.length === 0) return null
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">Notifications</h2>
      </div>
      <ul className="mt-4 flex flex-col gap-3">
        {items.map((n) => {
          const style = levelStyles[n.level] ?? levelStyles.info
          const Icon = style.icon
          return (
            <li key={n.id} className="flex gap-3">
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                  style.cls,
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-pretty text-sm font-semibold leading-tight">
                    {n.title}
                  </p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-pretty text-sm leading-relaxed text-muted-foreground">
                  {n.body}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
