'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import type { ContentItem } from '@/lib/db/schema'
import { getIcon } from '@/lib/icon-map'
import type { AgeGroup, UserType } from '@/lib/user-types'
import { useTracking } from '@/lib/use-tracking'
import { ArrowUpRight } from 'lucide-react'

export function ContentGrid({
  items,
  userType,
  ageGroup,
}: {
  items: ContentItem[]
  userType: UserType
  ageGroup?: AgeGroup | null
}) {
  const track = useTracking(userType, ageGroup)

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No services available right now. Please check back soon.
      </Card>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const Icon = getIcon(item.icon)
        return (
          <Card
            key={item.id}
            className="group flex flex-col p-5 transition-all hover:border-primary hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <Badge
                  variant="outline"
                  className="mb-1.5 border-transparent bg-secondary text-[11px] font-medium text-secondary-foreground"
                >
                  {item.category}
                </Badge>
                <h3 className="text-pretty font-semibold leading-tight">{item.title}</h3>
              </div>
            </div>
            <p className="mt-3 flex-1 text-pretty text-sm leading-relaxed text-muted-foreground">
              {item.description}
            </p>
            {item.ctaUrl ? (
              <a
                href={item.ctaUrl}
                target={item.ctaUrl.startsWith('http') ? '_blank' : undefined}
                rel={item.ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                onClick={() => track('content_click', item.category)}
                className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
              >
                {item.ctaLabel ?? 'Learn more'}
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            ) : (
              <button
                type="button"
                onClick={() => track('content_click', item.category)}
                className="mt-4 inline-flex w-fit items-center gap-1 text-sm font-semibold text-muted-foreground"
                title="Link coming soon"
              >
                {item.ctaLabel ?? 'Learn more'}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            )}
          </Card>
        )
      })}
    </div>
  )
}
