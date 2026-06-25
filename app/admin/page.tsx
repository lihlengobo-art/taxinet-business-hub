import { requireAdmin } from '@/lib/admin/auth'
import { loadDashboard } from '@/app/actions/admin-dashboard'
import { listAdminUsers, listAuditLogs } from '@/app/actions/admin-finance'
import { canAccess } from '@/lib/admin/roles'
import { AdminShell } from '@/components/admin/admin-shell'

export const dynamic = 'force-dynamic'

function defaultRange() {
  const to = new Date()
  const from = new Date()
  from.setDate(from.getDate() - 29)
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) }
}

export default async function AdminPage() {
  const user = await requireAdmin()
  const range = defaultRange()

  const data = await loadDashboard(range)

  // Super-admin-only data loaded up front.
  const users = canAccess(user.role, 'users') ? await listAdminUsers() : null
  const auditLog = canAccess(user.role, 'users') ? await listAuditLogs() : null

  return (
    <AdminShell
      user={user}
      initialRange={range}
      initialData={data}
      users={users}
      auditLog={auditLog}
    />
  )
}
