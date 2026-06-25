'use client'

import { recordAdImpressions } from '@/app/actions/content'
import { Button } from '@/components/ui/button'
import type { Ad } from '@/lib/db/schema'
import type { AgeGroup, UserType } from '@/lib/user-types'
import { useTracking } from '@/lib/use-tracking'
import { cn } from '@/lib/utils'
import { Megaphone, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function AdBanner({
  ads,
  userType,
  ageGroup,
}: {
  ads: Ad[]
  userType: UserType
  ageGroup?: AgeGroup | null
}) {
  const track = useTracking(userType, ageGroup)
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const recorded = useRef(false)

  useEffect(() => {
    if (ads.length === 0 || recorded.current) return
    recorded.current = true
    void recordAdImpressions(ads.map((a) => a.id)).catch(() => {})
  }, [ads])

  useEffect(() => {
    if (ads.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % ads.length), 6000)
    return () => clearInterval(t)
  }, [ads.length])

  if (ads.length === 0 || dismissed) return null
  const ad = ads[index]
  const isAccent = ad.accent === 'accent'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5 shadow-sm',
        isAccent
          ? 'bg-accent text-accent-foreground'
          : 'bg-primary text-primary-foreground',
      )}
    >
      <button
        type="button"
        aria-label="Dismiss ad"
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide opacity-80">
        <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
        Sponsored · {ad.advertiser}
      </div>
      <h3 className="mt-2 text-pretty text-lg font-semibold leading-tight">{ad.title}</h3>
      <p className="mt-1 max-w-prose text-pretty text-sm leading-relaxed opacity-90">
        {ad.body}
      </p>
      <div className="mt-4 flex items-center gap-3">
        {ad.ctaUrl ? (
          <Button
            nativeButton={false}
            render={
              <a
                href={ad.ctaUrl}
                target={ad.ctaUrl.startsWith('http') ? '_blank' : undefined}
                rel={ad.ctaUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {ad.ctaLabel ?? 'Learn more'}
              </a>
            }
            variant="secondary"
            size="sm"
            onClick={() => track('ad_click', ad.advertiser, ad.id, ad.advertiser)}
            className="bg-background text-foreground hover:bg-background/90"
          />
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => track('ad_click', ad.advertiser, ad.id, ad.advertiser)}
            className="bg-background text-foreground hover:bg-background/90"
          >
            {ad.ctaLabel ?? 'Learn more'}
          </Button>
        )}
        {ads.length > 1 && (
          <div className="flex gap-1.5" aria-hidden="true">
            {ads.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 w-1.5 rounded-full transition-all',
                  i === index ? 'w-4 bg-background' : 'bg-background/40',
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
