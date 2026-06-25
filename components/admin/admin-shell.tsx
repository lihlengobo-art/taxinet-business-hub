'use client'

import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { signOutAdmin } from '@/app/actions/admin-signout'
import { loadDashboard, type DashboardData } from '@/app/actions/admin-dashboard'
import type { DateRange } from '@/app/actions/admin-analytics'
import type { AdminUser } from '@/lib/admin/auth'
import {
  roleLabel,
  visibleSections,
  type AdminSection,
} from '@/lib/admin/roles'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Handshake,
  LayoutDashboard,
  LogOut,
  Users,
  Wallet,
} from 'lucide-react'
import { useState, useTransition } from 'react'
import { AnalyticsSection } from './sections/analytics-section'
import { FinanceSection } from './sections/finance-section'
import { OverviewSection } from './sections/overview-section'
import { PartnersSection } from './sections/partners-section'
import { UsersSection } from './sections/users-section'
import { RangePicker } from './range-picker'

const SECTION_META: Record<
  AdminSection,
  { label: string; icon: typeof LayoutDashboard }
> = {
  overview: { label: 'Overview', icon: LayoutDashboard },
  analytics: { label: 'Analytics', icon: BarChart3 },
  partners: { label: 'Partners', icon: Handshake },
  finance: { label: 'Finance', icon: Wallet },
  users: { label: 'Users', icon: Users },
}

type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

type AuditRow = {
  id: number
  actorEmail: string | null
  action: string
  detail: string | null
  createdAt: Date
}

export function AdminShell({
  user,
  initialRange,
  initialData,
  users,
  auditLog,
}: {
  user: AdminUser
  initialRange: DateRange
  initialData: DashboardData
  users: AdminUserRow[] | null
  auditLog: AuditRow[] | null
}) {
  const sections = visibleSections(user.role)
  const [active, setActive] = useState<AdminSection>(sections[0] ?? 'overview')
  const [range, setRange] = useState<DateRange>(initialRange)
  const [data, setData] = useState<DashboardData>(initialData)
  const [pending, startTransition] = useTransition()

  function applyRange(next: DateRange) {
    setRange(next)
    startTransition(async () => {
      const fresh = await loadDashboard(next)
      setData(fresh)
    })
  }

  function reload() {
    startTransition(async () => {
      const fresh = await loadDashboard(range)
      setData(fresh)
    })
  }

  return (
    <div className="min-h-svh bg-muted/30">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <Brand showName={false} />
            <div className="hidden sm:block">
              <p className="text-sm font-semibold leading-none">Admin Console</p>
              <p className="text-xs text-muted-foreground">Wanderers Taxi Rank</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs text-muted-foreground">{roleLabel(user.role)}</p>
            </div>
            <form action={signOutAdmin}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Range picker */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {SECTION_META[active].label}
            </h1>
            <p className="text-xs text-muted-foreground">
              {pending ? 'Updating…' : `${range.from} to ${range.to}`}
            </p>
          </div>
          <RangePicker range={range} onChange={applyRange} disabled={pending} />
        </div>

        {/* Content */}
        <main className={cn('pb-24 transition-opacity', pending && 'opacity-60')}>
          {active === 'overview' && (
            <OverviewSection user={user} data={data} range={range} />
          )}
          {active === 'analytics' && data.analytics && (
            <AnalyticsSection data={data.analytics} range={range} />
          )}
          {active === 'partners' && data.partners && (
            <PartnersSection data={data.partners} range={range} onChange={reload} />
          )}
          {active === 'finance' && data.finance && (
            <FinanceSection data={data.finance} range={range} onChange={reload} />
          )}
          {active === 'users' && users && (
            <UsersSection
              users={users}
              auditLog={auditLog ?? []}
              currentUserId={user.id}
              onChange={reload}
            />
          )}
        </main>
      </div>

      {/* Bottom nav (mobile-first) */}
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-stretch justify-around px-2">
          {sections.map((s) => {
            const Icon = SECTION_META[s].icon
            const isActive = active === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setActive(s)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-5 w-5" />
                {SECTION_META[s].label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
