'use client'

import { AgeChart, TrafficChart, UserTypeChart } from '@/components/admin/analytics-charts'
import {
  AdsManager,
  IncidentsManager,
  NotificationsManager,
  VendorApplicationsManager,
} from '@/components/admin/management-panels'
import { StatCards } from '@/components/admin/stat-cards'
import { TopContent } from '@/components/admin/top-content'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Ad, IncidentReport, Notification, VendorApplication } from '@/lib/db/schema'

type Props = {
  stats: {
    totalSessions: number
    todaySessions: number
    totalEvents: number
    engagementRate: number
    openIncidents: number
  }
  sessionsByDay: { day: string; count: number }[]
  byUserType: { userType: string; count: number }[]
  ageBreakdown: { ageGroup: string | null; count: number }[]
  topContent: { target: string | null; clicks: number }[]
  ads: Ad[]
  incidents: IncidentReport[]
  notifications: Notification[]
  vendorApps: VendorApplication[]
}

export function AdminTabs(props: Props) {
  return (
    <Tabs defaultValue="overview" className="gap-6">
      <TabsList className="flex w-full flex-wrap justify-start">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="incidents">
          Incidents{props.stats.openIncidents > 0 ? ` (${props.stats.openIncidents})` : ''}
        </TabsTrigger>
        <TabsTrigger value="ads">Ads</TabsTrigger>
        <TabsTrigger value="notifications">Broadcast</TabsTrigger>
        <TabsTrigger value="vendors">Vendors</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="flex flex-col gap-4">
        <StatCards stats={props.stats} />
        <div className="grid gap-4 lg:grid-cols-2">
          <TrafficChart data={props.sessionsByDay} />
          <UserTypeChart data={props.byUserType} />
          <AgeChart data={props.ageBreakdown} />
          <TopContent items={props.topContent} />
        </div>
      </TabsContent>

      <TabsContent value="incidents">
        <IncidentsManager incidents={props.incidents} />
      </TabsContent>

      <TabsContent value="ads">
        <AdsManager ads={props.ads} />
      </TabsContent>

      <TabsContent value="notifications">
        <NotificationsManager notifications={props.notifications} />
      </TabsContent>

      <TabsContent value="vendors">
        <VendorApplicationsManager apps={props.vendorApps} />
      </TabsContent>
    </Tabs>
  )
}
