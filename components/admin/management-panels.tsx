'use client'

import {
  createAd,
  createNotification,
  toggleAd,
  updateIncidentStatus,
} from '@/app/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { Ad, IncidentReport, Notification, VendorApplication } from '@/lib/db/schema'
import { cn } from '@/lib/utils'
import { userTypeLabel } from '@/lib/user-types'
import { Check, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const severityStyles: Record<string, string> = {
  low: 'bg-secondary text-secondary-foreground',
  medium: 'bg-accent/30 text-accent-foreground',
  high: 'bg-destructive/10 text-destructive',
}

const statusOptions = ['open', 'investigating', 'resolved']

export function IncidentsManager({ incidents }: { incidents: IncidentReport[] }) {
  const [pending, startTransition] = useTransition()

  function setStatus(id: number, status: string) {
    startTransition(async () => {
      await updateIncidentStatus(id, status)
      toast.success('Incident updated.')
    })
  }

  return (
    <div className="flex flex-col gap-3">
      {incidents.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No incidents reported.
        </Card>
      )}
      {incidents.map((inc) => (
        <Card key={inc.id} className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{inc.category}</span>
                <Badge className={cn('border-transparent capitalize', severityStyles[inc.severity])}>
                  {inc.severity}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  by {userTypeLabel(inc.reporterType)} ·{' '}
                  {new Date(inc.createdAt).toLocaleDateString('en-ZA')}
                </span>
              </div>
              <p className="mt-1 text-pretty text-sm text-muted-foreground">{inc.description}</p>
            </div>
            <Select
              defaultValue={inc.status}
              onValueChange={(v) => setStatus(inc.id, v)}
              disabled={pending}
            >
              <SelectTrigger className="w-36 capitalize">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function AdsManager({ ads }: { ads: Ad[] }) {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [advertiser, setAdvertiser] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')
  const [accent, setAccent] = useState('primary')

  function toggle(id: number, active: boolean) {
    startTransition(async () => {
      await toggleAd(id, active)
    })
  }

  function add() {
    startTransition(async () => {
      const res = await createAd({
        title,
        advertiser,
        body,
        userType: audience === 'all' ? null : audience,
        accent,
      })
      if (res.ok) {
        toast.success('Ad created and live.')
        setTitle('')
        setAdvertiser('')
        setBody('')
        setOpen(false)
      } else {
        toast.error(res.error ?? 'Could not create ad.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {ads.filter((a) => a.active).length} active · {ads.length} total
        </p>
        <Button size="sm" variant={open ? 'secondary' : 'default'} onClick={() => setOpen(!open)}>
          <Plus className="mr-1 h-4 w-4" />
          New ad
        </Button>
      </div>

      {open && (
        <Card className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ad-title">Title</Label>
              <Input id="ad-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ad-adv">Advertiser</Label>
              <Input
                id="ad-adv"
                value={advertiser}
                onChange={(e) => setAdvertiser(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            <Label htmlFor="ad-body">Message</Label>
            <Textarea id="ad-body" value={body} onChange={(e) => setBody(e.target.value)} rows={2} />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Audience</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="passenger">Passengers</SelectItem>
                  <SelectItem value="driver">Drivers</SelectItem>
                  <SelectItem value="vendor">Vendors</SelectItem>
                  <SelectItem value="marshal">Marshals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Style</Label>
              <Select value={accent} onValueChange={setAccent}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Teal</SelectItem>
                  <SelectItem value="accent">Amber</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={add} disabled={pending} className="mt-4">
            Publish ad
          </Button>
        </Card>
      )}

      {ads.map((ad) => {
        const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0'
        return (
          <Card key={ad.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{ad.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {ad.userType ? userTypeLabel(ad.userType) : 'Everyone'}
                  </Badge>
                  {!ad.active && (
                    <Badge variant="secondary" className="text-xs">
                      Paused
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{ad.advertiser}</p>
              </div>
              <Button
                size="sm"
                variant={ad.active ? 'secondary' : 'default'}
                onClick={() => toggle(ad.id, !ad.active)}
                disabled={pending}
              >
                {ad.active ? 'Pause' : 'Activate'}
              </Button>
            </div>
            <div className="mt-3 flex gap-5 text-xs text-muted-foreground">
              <span>
                <strong className="text-foreground">{ad.impressions.toLocaleString()}</strong> impressions
              </span>
              <span>
                <strong className="text-foreground">{ad.clicks.toLocaleString()}</strong> clicks
              </span>
              <span>
                <strong className="text-foreground">{ctr}%</strong> CTR
              </span>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export function NotificationsManager({ notifications }: { notifications: Notification[] }) {
  const [pending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState('all')
  const [level, setLevel] = useState('info')

  function broadcast() {
    startTransition(async () => {
      const res = await createNotification({ audience, title, body, level })
      if (res.ok) {
        toast.success('Notification broadcast.')
        setTitle('')
        setBody('')
      } else {
        toast.error(res.error ?? 'Could not broadcast.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <Card className="p-4">
        <h3 className="font-semibold">Broadcast a notification</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="n-title">Title</Label>
            <Input id="n-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Audience</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Everyone</SelectItem>
                <SelectItem value="passenger">Passengers</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
                <SelectItem value="vendor">Vendors</SelectItem>
                <SelectItem value="marshal">Marshals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-1.5">
          <Label htmlFor="n-body">Message</Label>
          <Textarea id="n-body" value={body} onChange={(e) => setBody(e.target.value)} rows={2} />
        </div>
        <div className="mt-3 flex flex-col gap-1.5 sm:max-w-48">
          <Label>Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="danger">Danger</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={broadcast} disabled={pending} className="mt-4">
          Broadcast
        </Button>
      </Card>

      {notifications.map((n) => (
        <Card key={n.id} className="flex items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{n.title}</span>
              <Badge variant="outline" className="text-xs capitalize">
                {n.level}
              </Badge>
            </div>
            <p className="text-pretty text-sm text-muted-foreground">{n.body}</p>
          </div>
          <Badge variant="secondary" className="shrink-0 text-xs capitalize">
            {n.audience}
          </Badge>
        </Card>
      ))}
    </div>
  )
}

export function VendorApplicationsManager({ apps }: { apps: VendorApplication[] }) {
  return (
    <div className="flex flex-col gap-3">
      {apps.length === 0 && (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          No vendor applications yet. Submissions from the Vendor Hub appear here.
        </Card>
      )}
      {apps.map((a) => (
        <Card key={a.id} className="flex flex-wrap items-start justify-between gap-3 p-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{a.businessName}</span>
              <Badge variant="outline" className="text-xs">
                {a.category}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {a.ownerName}
              {a.phone ? ` · ${a.phone}` : ''}
            </p>
            {a.notes && <p className="mt-1 text-pretty text-sm text-muted-foreground">{a.notes}</p>}
          </div>
          <Badge className="shrink-0 border-transparent bg-accent/30 capitalize text-accent-foreground">
            <Check className="mr-1 h-3 w-3" />
            {a.status}
          </Badge>
        </Card>
      ))}
    </div>
  )
}
