import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable, auditLogs } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password || String(password).length < 8) {
      return NextResponse.json(
        { error: 'Name, email and a password of at least 8 characters are required.' },
        { status: 400 },
      )
    }

    // Only allowed when there are zero existing admin accounts.
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTable)
    if (count > 0) {
      return NextResponse.json(
        { error: 'An admin account already exists. Ask a Super Admin to invite you.' },
        { status: 403 },
      )
    }

    // Create the account through Better Auth so the password is hashed correctly.
    const result = await auth.api.signUpEmail({
      body: { name, email, password },
    })
    if (!result?.user?.id) {
      return NextResponse.json({ error: 'Could not create account.' }, { status: 500 })
    }

    // Promote this first user to Super Admin.
    await db
      .update(userTable)
      .set({ role: 'super_admin' })
      .where(eq(userTable.id, result.user.id))

    await db.insert(auditLogs).values({
      actorId: result.user.id,
      actorEmail: email,
      action: 'bootstrap_super_admin',
      detail: 'First admin account created',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
