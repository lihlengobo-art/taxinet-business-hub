import { DashboardView } from '@/components/dashboard/dashboard-view'
import { AGE_GROUPS, type AgeGroup } from '@/lib/user-types'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function PassengerPage({
  searchParams,
}: {
  searchParams: Promise<{ age?: string }>
}) {
  const { age } = await searchParams
  const valid = AGE_GROUPS.some((a) => a.id === age)
  if (!valid) redirect('/')

  const ageGroup = age as AgeGroup
  const label = AGE_GROUPS.find((a) => a.id === ageGroup)?.label

  return (
    <DashboardView
      userType="passenger"
      ageGroup={ageGroup}
      title="Passenger Hub"
      subtitle="Opportunities, services and deals picked for your stage of life."
      badge={`Age ${label}`}
      heroImage="/images/passenger-hero.png"
      heroAlt="Commuters checking their phones while waiting at a busy taxi rank"
    />
  )
}
