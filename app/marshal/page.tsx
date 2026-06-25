import { DashboardView } from '@/components/dashboard/dashboard-view'
import { IncidentForm } from '@/components/dashboard/incident-form'

export const dynamic = 'force-dynamic'

export default function MarshalPage() {
  return (
    <DashboardView
      userType="marshal"
      title="Marshal Hub"
      subtitle="Operational briefs, schedules and live tools to run the rank safely."
      badge="Rank operations"
      heroImage="/images/marshal-hero.png"
      heroAlt="Rank marshal in a reflective vest directing taxis and managing queues"
      extra={<IncidentForm reporterType="marshal" />}
    />
  )
}
