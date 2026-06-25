'use client'

import { Button } from '@/components/ui/button'
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
import { recordExpense, recordSale } from '@/app/actions/admin-finance'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

export function RecordSaleDialog({ onSaved }: { onSaved?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    partnerName: '',
    description: '',
    amount: '',
    commissionRate: '10',
    category: '',
    saleDate: new Date().toISOString().slice(0, 10),
  })

  function submit() {
    setError(null)
    start(async () => {
      const res = await recordSale({
        partnerName: form.partnerName,
        description: form.description,
        amount: Number(form.amount),
        commissionRate: Number(form.commissionRate),
        category: form.category,
        saleDate: form.saleDate,
      })
      if (!res.ok) {
        setError(res.error ?? 'Could not save')
        return
      }
      setOpen(false)
      setForm({ ...form, partnerName: '', description: '', amount: '', category: '' })
      onSaved?.()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Record sale</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record a sale</DialogTitle>
          <DialogDescription>
            Log partner revenue. Commission is calculated automatically.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Field label="Partner / advertiser">
            <Input
              value={form.partnerName}
              onChange={(e) => setForm({ ...form, partnerName: e.target.value })}
              placeholder="e.g. MTN"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (ZAR)">
              <Input
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </Field>
            <Field label="Commission %">
              <Input
                type="number"
                inputMode="decimal"
                value={form.commissionRate}
                onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Optional"
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={form.saleDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, saleDate: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Description">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note"
            />
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Saving…' : 'Save sale'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function RecordExpenseDialog({ onSaved }: { onSaved?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    category: '',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().slice(0, 10),
  })

  function submit() {
    setError(null)
    start(async () => {
      const res = await recordExpense({
        category: form.category,
        description: form.description,
        amount: Number(form.amount),
        expenseDate: form.expenseDate,
      })
      if (!res.ok) {
        setError(res.error ?? 'Could not save')
        return
      }
      setOpen(false)
      setForm({ ...form, category: '', description: '', amount: '' })
      onSaved?.()
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline">
            Record expense
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record an expense</DialogTitle>
          <DialogDescription>Log an operating cost for the period.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Field label="Category">
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="e.g. Connectivity, Salaries"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (ZAR)">
              <Input
                type="number"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </Field>
            <Field label="Date">
              <Input
                type="date"
                value={form.expenseDate}
                max={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Description">
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional note"
            />
          </Field>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Saving…' : 'Save expense'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  )
}
