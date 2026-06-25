'use client'

import { submitIncident } from '@/app/actions/submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ClipboardList } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

const CATEGORIES = ['Overcrowding', 'Safety', 'Medical', 'Infrastructure', 'Dispute', 'Other']
const SEVERITIES = ['low', 'medium', 'high']

export function IncidentForm({ reporterType }: { reporterType: string }) {
  const [category, setCategory] = useState('Safety')
  const [severity, setSeverity] = useState('medium')
  const [description, setDescription] = useState('')
  const [pending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      const res = await submitIncident({ reporterType, category, description, severity })
      if (res.ok) {
        toast.success('Incident reported to rank management.')
        setDescription('')
        setSeverity('medium')
      } else {
        toast.error(res.error ?? 'Could not submit report.')
      }
    })
  }

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-primary" aria-hidden="true" />
        <h2 className="font-semibold">Report an incident</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Log issues so rank management can respond. Reports appear live on the admin dashboard.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inc-category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="inc-category">
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
          <Label htmlFor="inc-severity">Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger id="inc-severity" className="capitalize">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s} className="capitalize">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-1.5">
        <Label htmlFor="inc-desc">Description</Label>
        <Textarea
          id="inc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What happened, and where at the rank?"
          rows={3}
        />
      </div>
      <Button onClick={submit} disabled={pending} className="mt-4">
        {pending ? 'Submitting…' : 'Submit report'}
      </Button>
    </Card>
  )
}
