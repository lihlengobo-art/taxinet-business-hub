import { DashboardView } from '@/components/dashboard/dashboard-view'

export const dynamic = 'force-dynamic'

export default function DriverPage() {
  return (
    <DashboardView
      userType="driver"
      title="Driver Hub"
      subtitle="Parts, insurance, live traffic and the tools to keep you on the road."
      badge="Operators & drivers"
      heroImage="/images/driver-hero.png"
      heroAlt="Minibus taxi driver standing beside his taxi at the rank"
    />
  )
}
