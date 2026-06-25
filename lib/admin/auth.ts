import 'server-only'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { auditLogs } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { AdminSection } from '@/lib/admin/roles'
import { canAccess } from '@/lib/admin/roles'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: string
}

/** Returns the signed-in admin user, or null if not authenticated. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    // role is an additional field on the Better Auth user
    role: (session.user as { role?: string }).role ?? 'operations',
  }
}

/** Requires an authenticated admin; redirects to /admin/login otherwise. */
export async function requireAdmin(): Promise<AdminUser> {
  const user = await getAdminUser()
  if (!user) redirect('/admin/login')
  return user
}

/** Requires access to a section; redirects to the admin home if denied. */
export async function requireSection(section: AdminSection): Promise<AdminUser> {
  const user = await requireAdmin()
  if (!canAccess(user.role, section)) redirect('/admin')
  return user
}

/** Writes an entry to the audit log. */
export async function logAudit(user: AdminUser, action: string, detail?: string) {
  await db.insert(auditLogs).values({
    actorId: user.id,
    actorEmail: user.email,
    action,
    detail: detail ?? null,
  })
}
