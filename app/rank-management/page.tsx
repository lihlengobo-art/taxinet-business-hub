import {
  getAdminOverview,
  getAllAds,
  getAllIncidents,
  getAllNotifications,
  getPassengerAgeBreakdown,
  getSessionsByDay,
  getSessionsByUserType,
  getTopContent,
  getVendorApplications,
} from '@/app/actions/admin'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { requireAdmin } from '@/lib/admin/auth'
import { RANK_NAME } from '@/lib/user-types'
import { ArrowLeft, MapPin } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RankManagementPage() {
  // Internal analytics — only signed-in admins may view this page.
  await requireAdmin()

  const [
    stats,
    sessionsByDay,
    byUserType,
    ageBreakdown,
    topContent,
    ads,
    incidents,
    notifications,
    vendorApps,
  ] = await Promise.all([
    getAdminOverview(),
    getSessionsByDay(),
    getSessionsByUserType(),
    getPassengerAgeBreakdown(),
    getTopContent(),
    getAllAds(),
    getAllIncidents(),
    getAllNotifications(),
    getVendorApplications(),
  ])

  return (
    <main className="min-h-svh pb-16">
      <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" aria-label="Back to home">
            <Brand />
          </Link>
          <span className="hidden items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground sm:flex">
            <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {RANK_NAME}
          </span>
          <Button
            nativeButton={false}
            render={
              <Link href="/">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Exit
              </Link>
            }
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
          />
        </div>
        <div className="mx-auto w-full max-w-6xl px-4 pb-5 pt-1">
          <h1 className="text-2xl font-semibold tracking-tight">Rank Management</h1>
          <p className="mt-1 text-muted-foreground">
            Live analytics, content engagement, ads and incidents for {RANK_NAME}.
          </p>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 pt-6">
        <AdminTabs
          stats={stats}
          sessionsByDay={sessionsByDay}
          byUserType={byUserType}
          ageBreakdown={ageBreakdown}
          topContent={topContent}
          ads={ads}
          incidents={incidents}
          notifications={notifications}
          vendorApps={vendorApps}
        />
      </div>
    </main>
  )
}
