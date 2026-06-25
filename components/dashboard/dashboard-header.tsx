import { Brand } from '@/components/brand'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RANK_NAME } from '@/lib/user-types'
import { ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'

export function DashboardHeader({
  title,
  subtitle,
  badge,
}: {
  title: string
  subtitle: string
  badge?: string
}) {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" aria-label="Back to home">
          <Brand showName={false} />
        </Link>
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {RANK_NAME}
        </span>
        <Button
          nativeButton={false}
          render={
            <Link href="/">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Switch
            </Link>
          }
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        />
      </div>
      <div className="mx-auto w-full max-w-5xl px-4 pb-5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {badge && (
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {badge}
            </Badge>
          )}
        </div>
        <p className="mt-1 text-pretty text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  )
}
