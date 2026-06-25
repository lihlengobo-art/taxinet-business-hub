'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { DashboardData } from '@/app/actions/admin-dashboard'
import type { DateRange } from '@/app/actions/admin-analytics'
import { createPartner, togglePartner } from '@/app/actions/admin-finance'
import { downloadCsv, formatNumber } from '@/lib/admin/format'
import { Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { KpiCard } from '../kpi-card'
import { Handshake, Target } from 'lucide-react'

type Partners = NonNullable<DashboardData['partners']>

export function PartnersSection({
  data,
  range,
  onChange,
}: {
  data: Partners
  range: DateRange
  onChange: () => void
}) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const activeCount = data.list.filter((p) => p.active).length
  const maxLeads = Math.max(1, ...data.leads.byAdvertiser.map((l) => l.leads))

  function exportLeads() {
    downloadCsv(
      `leads-${range.from}-to-${range.to}`,
      ['Advertiser / Category', 'Leads'],
      data.leads.byAdvertiser.map((l) => [l.advertiser, l.leads]),
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Active partners" value={formatNumber(activeCount)} icon={Handshake} />
        <KpiCard
          label="Total leads"
          value={formatNumber(data.leads.total)}
          hint="Ads & offers"
          icon={Target}
          accent="accent"
        />
      </div>

      {/* Lead attribution */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Leads by advertiser</h2>
            <p className="text-sm text-muted-foreground">Auto-tracked from offer clicks</p>
          </div>
          <Button variant="outline" size="sm" onClick={exportLeads}>
            <Download className="mr-1.5 h-4 w-4" />
            CSV
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {data.leads.byAdvertiser.length === 0 && (
            <p className="text-sm text-muted-foreground">No leads recorded for this period.</p>
          )}
          {data.leads.byAdvertiser.map((l) => (
            <div key={l.advertiser}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="truncate font-medium">{l.advertiser}</span>
                <span className="text-muted-foreground">{formatNumber(l.leads)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${Math.round((l.leads / maxLeads) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Partner directory */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Partner directory</h2>
            <p className="text-sm text-muted-foreground">Manage commission partners</p>
          </div>
          <NewPartnerDialog onSaved={onChange} />
        </div>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Partner</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.list.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No partners yet. Add your first partner.
                  </TableCell>
                </TableRow>
              )}
              {data.list.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.category ?? '—'}</TableCell>
                  <TableCell className="text-right">{Number(p.commissionRate)}%</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant={p.active ? 'secondary' : 'outline'}
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        start(async () => {
                          await togglePartner(p.id, !p.active)
                          onChange()
                          router.refresh()
                        })
                      }
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}

function NewPartnerDialog({ onSaved }: { onSaved?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
    commissionRate: '10',
  })

  function submit() {
    setError(null)
    start(async () => {
      const res = await createPartner({
        name: form.name,
        category: form.category,
        contactEmail: form.contactEmail,
        contactPhone: form.contactPhone,
        commissionRate: Number(form.commissionRate),
      })
      if (!res.ok) {
        setError(res.error ?? 'Could not save')
        return
      }
      setOpen(false)
      setForm({ name: '', category: '', contactEmail: '', contactPhone: '', commissionRate: '10' })
      onSaved?.()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Add partner</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a partner</DialogTitle>
          <DialogDescription>Create a commission partner for tracking.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Category</Label>
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Commission %</Label>
              <Input
                type="number"
                inputMode="decimal"
                value={form.commissionRate}
                onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs">Phone</Label>
              <Input
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="Optional"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Saving…' : 'Add partner'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
