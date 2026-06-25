'use client'

import { submitVendorApplication } from '@/app/actions/submissions'
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
import { Store } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const CATEGORIES = ['Food & Drink', 'Airtime & Data', 'Clothing', 'Fruit & Veg', 'General Goods', 'Services']

export function VendorApplicationForm() {
  const [businessName, setBusinessName] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [category, setCategory] = useState('Food & Drink')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      const res = await submitVendorApplication({
        businessName,
        ownerName,
        category,
        phone,
        notes,
      })
      if (res.ok) {
        toast.success('Application sent to rank management.')
        setBusinessName('')
        setOwnerName('')
        setPhone('')
        setNotes('')
      } else {
        toast.error(res.error ?? 'Could not submit application.')
      }
    })
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <Store className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">Apply for a stall</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Register your business to trade at the rank. Management will review your application.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="v-biz">Business name</Label>
          <Input
            id="v-biz"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Mama's Kotas"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="v-owner">Owner name</Label>
          <Input
            id="v-owner"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Full name"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="v-cat">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="v-cat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="v-phone">Phone</Label>
          <Input
            id="v-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07x xxx xxxx"
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <Label htmlFor="v-notes">Notes (optional)</Label>
        <Textarea
          id="v-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything management should know"
          rows={2}
        />
      </div>
      <Button onClick={submit} disabled={pending} className="mt-4">
        {pending ? 'Submitting…' : 'Submit application'}
      </Button>
    </Card>
  )
}
