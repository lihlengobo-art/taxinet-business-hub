import { getAdsFor, getContentFor, getNotificationsFor } from '@/app/actions/content'
import { AdBanner } from '@/components/dashboard/ad-banner'
import { ContentGrid } from '@/components/dashboard/content-grid'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { NotificationsPanel } from '@/components/dashboard/notifications-panel'
import type { AgeGroup, UserType } from '@/lib/user-types'
import Image from 'next/image'

export async function DashboardView({
  userType,
  ageGroup,
  title,
  subtitle,
  badge,
  heroImage,
  heroAlt,
  extra,
}: {
  userType: UserType
  ageGroup?: AgeGroup | null
  title: string
  subtitle: string
  badge?: string
  heroImage: string
  heroAlt: string
  extra?: React.ReactNode
}) {
  const [content, ads, notifications] = await Promise.all([
    getContentFor(userType, ageGroup),
    getAdsFor(userType, ageGroup),
    getNotificationsFor(userType),
  ])

  return (
    <main className="min-h-svh pb-16">
      <DashboardHeader title={title} subtitle={subtitle} badge={badge} />
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 pt-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <div className="relative aspect-[16/7] w-full overflow-hidden rounded-2xl">
            <Image
              src={heroImage || "/placeholder.svg"}
              alt={heroAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 640px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <p className="max-w-md text-pretty text-sm font-medium leading-relaxed text-background sm:text-base">
                {subtitle}
              </p>
            </div>
          </div>
          <AdBanner ads={ads} userType={userType} ageGroup={ageGroup} />
          {extra}
          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              For you
            </h2>
            <ContentGrid items={content} userType={userType} ageGroup={ageGroup} />
          </section>
        </div>
        <aside className="flex flex-col gap-6">
          <NotificationsPanel items={notifications} />
        </aside>
      </div>
    </main>
  )
}
