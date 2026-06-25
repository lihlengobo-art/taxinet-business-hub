import { DashboardView } from '@/components/dashboard/dashboard-view'
import { VendorApplicationForm } from '@/components/dashboard/vendor-application-form'

export const dynamic = 'force-dynamic'

export default function VendorPage() {
  return (
    <DashboardView
      userType="vendor"
      title="Vendor Hub"
      subtitle="Wholesale deals, payment tools and funding to grow your rank business."
      badge="Traders & stall owners"
      heroImage="/images/vendor-hero.png"
      heroAlt="Street vendor selling fresh produce and snacks at a taxi rank stall"
      extra={<VendorApplicationForm />}
    />
  )
}
