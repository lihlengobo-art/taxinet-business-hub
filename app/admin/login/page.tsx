import { getAdminUser } from '@/lib/admin/auth'
import { AdminAuthForm } from '@/components/admin/admin-auth-form'
import { Brand } from '@/components/brand'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminLoginPage() {
  const user = await getAdminUser()
  if (user) redirect('/admin')

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(userTable)
  const allowBootstrap = count === 0

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <Brand showName={false} />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Admin Console</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to manage Wanderers Taxi Rank
            </p>
          </div>
        </div>
        <AdminAuthForm allowBootstrap={allowBootstrap} />
      </div>
    </main>
  )
}
