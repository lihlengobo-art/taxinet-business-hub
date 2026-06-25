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
import { inviteAdminUser, updateUserRole } from '@/app/actions/admin-finance'
import { ADMIN_ROLES, roleLabel } from '@/lib/admin/roles'
import { formatDay } from '@/lib/admin/format'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'

type AdminUserRow = {
  id: string
  name: string
  email: string
  role: string
  createdAt: Date
}

type AuditRow = {
  id: number
  actorEmail: string | null
  action: string
  detail: string | null
  createdAt: Date
}

export function UsersSection({
  users,
  auditLog,
  currentUserId,
  onChange,
}: {
  users: AdminUserRow[]
  auditLog: AuditRow[]
  currentUserId: string
  onChange?: () => void
}) {
  const router = useRouter()
  const [pending, start] = useTransition()

  return (
    <div className="flex flex-col gap-5">
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Admin users</h2>
            <p className="text-sm text-muted-foreground">Manage roles and access</p>
          </div>
          <InviteUserDialog />
        </div>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">
                    {u.name}
                    {u.id === currentUserId && (
                      <span className="ml-1.5 text-xs text-muted-foreground">(you)</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    {u.id === currentUserId ? (
                      <span className="text-sm">{roleLabel(u.role)}</span>
                    ) : (
                      <select
                        value={u.role}
                        disabled={pending}
                        onChange={(e) =>
                          start(async () => {
                            await updateUserRole(u.id, e.target.value)
                            onChange?.()
                            router.refresh()
                          })
                        }
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      >
                        {ADMIN_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-semibold">Audit log</h2>
        <p className="text-sm text-muted-foreground">Recent administrative actions</p>
        <div className="mt-3 flex flex-col divide-y divide-border">
          {auditLog.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">No activity logged yet.</p>
          )}
          {auditLog.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="font-medium">{a.action.replace(/_/g, ' ')}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {a.actorEmail ?? 'system'}
                  {a.detail ? ` · ${a.detail}` : ''}
                </p>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDay(a.createdAt as unknown as string)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function InviteUserDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operations',
  })

  function submit() {
    setError(null)
    start(async () => {
      const res = await inviteAdminUser(form)
      if (!res.ok) {
        setError(res.error ?? 'Could not create user')
        return
      }
      setOpen(false)
      setForm({ name: '', email: '', password: '', role: 'operations' })
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm">Invite user</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite an admin user</DialogTitle>
          <DialogDescription>
            Create an account with a temporary password and assign a role.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Full name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Temporary password (8+ chars)</Label>
            <Input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs">Role</Label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-md border border-border bg-background px-2 py-2 text-sm"
            >
              {ADMIN_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} — {r.description}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Creating…' : 'Create user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
