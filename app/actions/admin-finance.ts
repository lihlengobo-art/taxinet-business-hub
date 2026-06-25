'use server'

import { getAdminUser, logAudit, requireSection } from '@/lib/admin/auth'
import { db } from '@/lib/db'
import { auditLogs, expenses, leads, partners, sales, user as userTable } from '@/lib/db/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'
import { revalidatePath } from 'next/cache'
import type { DateRange } from './admin-analytics'

function within(col: AnyPgColumn, range?: DateRange) {
  if (!range) return undefined
  return and(gte(col, sql`${range.from}::date`), lte(col, sql`${range.to}::date`))
}

// ---------- Finance summary ----------

export async function getFinanceSummary(range?: DateRange) {
  await requireSection('finance')

  const [rev] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${sales.amount}), 0)::float`,
      commission: sql<number>`coalesce(sum(${sales.commissionAmount}), 0)::float`,
      count: sql<number>`count(*)::int`,
    })
    .from(sales)
    .where(within(sales.saleDate, range))

  const [exp] = await db
    .select({ total: sql<number>`coalesce(sum(${expenses.amount}), 0)::float` })
    .from(expenses)
    .where(range ? and(gte(expenses.expenseDate, sql`${range.from}::date`), lte(expenses.expenseDate, sql`${range.to}::date`)) : undefined)

  const revenue = rev.revenue ?? 0
  const commission = rev.commission ?? 0
  const expense = exp.total ?? 0
  // Net profit = commission earned by the platform minus operating expenses.
  const netProfit = commission - expense

  return {
    revenue,
    commission,
    expenses: expense,
    netProfit,
    salesCount: rev.count ?? 0,
    avgSale: rev.count > 0 ? Math.round((revenue / rev.count) * 100) / 100 : 0,
  }
}

export async function getRevenueByDay(range?: DateRange) {
  await requireSection('finance')
  return db
    .select({
      day: sql<string>`to_char(${sales.saleDate}, 'YYYY-MM-DD')`,
      revenue: sql<number>`coalesce(sum(${sales.amount}), 0)::float`,
      commission: sql<number>`coalesce(sum(${sales.commissionAmount}), 0)::float`,
    })
    .from(sales)
    .where(within(sales.saleDate, range))
    .groupBy(sql`to_char(${sales.saleDate}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${sales.saleDate}, 'YYYY-MM-DD')`)
}

export async function getRevenueByPartner(range?: DateRange) {
  await requireSection('finance')
  return db
    .select({
      partner: sales.partnerName,
      revenue: sql<number>`coalesce(sum(${sales.amount}), 0)::float`,
      commission: sql<number>`coalesce(sum(${sales.commissionAmount}), 0)::float`,
    })
    .from(sales)
    .where(within(sales.saleDate, range))
    .groupBy(sales.partnerName)
    .orderBy(desc(sql`sum(${sales.amount})`))
    .limit(10)
}

export async function getExpensesByCategory(range?: DateRange) {
  await requireSection('finance')
  return db
    .select({
      category: expenses.category,
      total: sql<number>`coalesce(sum(${expenses.amount}), 0)::float`,
    })
    .from(expenses)
    .where(range ? and(gte(expenses.expenseDate, sql`${range.from}::date`), lte(expenses.expenseDate, sql`${range.to}::date`)) : undefined)
    .groupBy(expenses.category)
    .orderBy(desc(sql`sum(${expenses.amount})`))
}

export async function listSales(range?: DateRange) {
  await requireSection('finance')
  return db
    .select()
    .from(sales)
    .where(within(sales.saleDate, range))
    .orderBy(desc(sales.saleDate), desc(sales.id))
    .limit(200)
}

export async function listExpenses(range?: DateRange) {
  await requireSection('finance')
  return db
    .select()
    .from(expenses)
    .where(range ? and(gte(expenses.expenseDate, sql`${range.from}::date`), lte(expenses.expenseDate, sql`${range.to}::date`)) : undefined)
    .orderBy(desc(expenses.expenseDate), desc(expenses.id))
    .limit(200)
}

// ---------- Mutations ----------

export async function recordSale(input: {
  partnerName: string
  description?: string
  amount: number
  commissionRate: number
  category?: string
  saleDate?: string
}) {
  const admin = await requireSection('finance')
  if (!input.partnerName?.trim() || !(input.amount > 0)) {
    return { ok: false, error: 'Partner and a positive amount are required.' }
  }
  const commissionAmount =
    Math.round(input.amount * (input.commissionRate / 100) * 100) / 100
  await db.insert(sales).values({
    partnerName: input.partnerName.trim(),
    description: input.description?.trim() || null,
    amount: String(input.amount),
    commissionRate: String(input.commissionRate),
    commissionAmount: String(commissionAmount),
    category: input.category?.trim() || null,
    saleDate: input.saleDate || new Date().toISOString().slice(0, 10),
    recordedBy: admin.email,
  })
  await logAudit(admin, 'record_sale', `${input.partnerName}: R${input.amount}`)
  revalidatePath('/admin')
  return { ok: true }
}

export async function recordExpense(input: {
  category: string
  description?: string
  amount: number
  expenseDate?: string
}) {
  const admin = await requireSection('finance')
  if (!input.category?.trim() || !(input.amount > 0)) {
    return { ok: false, error: 'Category and a positive amount are required.' }
  }
  await db.insert(expenses).values({
    category: input.category.trim(),
    description: input.description?.trim() || null,
    amount: String(input.amount),
    expenseDate: input.expenseDate || new Date().toISOString().slice(0, 10),
    recordedBy: admin.email,
  })
  await logAudit(admin, 'record_expense', `${input.category}: R${input.amount}`)
  revalidatePath('/admin')
  return { ok: true }
}

// ---------- Partners ----------

export async function listPartners() {
  await requireSection('partners')
  return db.select().from(partners).orderBy(desc(partners.createdAt))
}

export async function createPartner(input: {
  name: string
  category?: string
  contactEmail?: string
  contactPhone?: string
  commissionRate: number
}) {
  const admin = await requireSection('partners')
  if (!input.name?.trim()) return { ok: false, error: 'Partner name is required.' }
  await db.insert(partners).values({
    name: input.name.trim(),
    category: input.category?.trim() || null,
    contactEmail: input.contactEmail?.trim() || null,
    contactPhone: input.contactPhone?.trim() || null,
    commissionRate: String(input.commissionRate ?? 0),
  })
  await logAudit(admin, 'create_partner', input.name)
  revalidatePath('/admin')
  return { ok: true }
}

export async function togglePartner(id: number, active: boolean) {
  const admin = await requireSection('partners')
  await db.update(partners).set({ active }).where(eq(partners.id, id))
  await logAudit(admin, 'toggle_partner', `#${id} -> ${active ? 'active' : 'inactive'}`)
  revalidatePath('/admin')
}

// ---------- Leads ----------

export async function getLeadSummary(range?: DateRange) {
  await requireSection('partners')
  const w = range
    ? and(gte(leads.createdAt, sql`${range.from}::timestamp`), lte(leads.createdAt, sql`(${range.to}::date + interval '1 day')`))
    : undefined

  const byAdvertiser = await db
    .select({
      advertiser: sql<string>`coalesce(${leads.advertiser}, ${leads.category}, 'Unattributed')`,
      leads: sql<number>`count(*)::int`,
    })
    .from(leads)
    .where(w)
    .groupBy(sql`coalesce(${leads.advertiser}, ${leads.category}, 'Unattributed')`)
    .orderBy(desc(sql`count(*)`))
    .limit(10)

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(leads)
    .where(w)

  return { total: total ?? 0, byAdvertiser }
}

// ---------- Users (super admin) ----------

export async function listAdminUsers() {
  await requireSection('users')
  return db
    .select({
      id: userTable.id,
      name: userTable.name,
      email: userTable.email,
      role: userTable.role,
      createdAt: userTable.createdAt,
    })
    .from(userTable)
    .orderBy(desc(userTable.createdAt))
}

export async function updateUserRole(id: string, role: string) {
  const admin = await requireSection('users')
  const valid = ['super_admin', 'finance', 'marketing', 'operations']
  if (!valid.includes(role)) return { ok: false, error: 'Invalid role.' }
  if (id === admin.id) return { ok: false, error: 'You cannot change your own role.' }
  await db.update(userTable).set({ role }).where(eq(userTable.id, id))
  await logAudit(admin, 'update_user_role', `${id} -> ${role}`)
  revalidatePath('/admin')
  return { ok: true }
}

export async function inviteAdminUser(input: {
  name: string
  email: string
  password: string
  role: string
}) {
  const admin = await requireSection('users')
  const valid = ['super_admin', 'finance', 'marketing', 'operations']
  if (!input.name?.trim() || !input.email?.trim() || (input.password?.length ?? 0) < 8) {
    return { ok: false, error: 'Name, email and an 8+ character password are required.' }
  }
  if (!valid.includes(input.role)) return { ok: false, error: 'Invalid role.' }

  const { auth } = await import('@/lib/auth')
  try {
    const result = await auth.api.signUpEmail({
      body: { name: input.name.trim(), email: input.email.trim(), password: input.password },
    })
    if (!result?.user?.id) return { ok: false, error: 'Could not create the account.' }
    await db.update(userTable).set({ role: input.role }).where(eq(userTable.id, result.user.id))
    await logAudit(admin, 'invite_admin', `${input.email} as ${input.role}`)
    revalidatePath('/admin')
    return { ok: true }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed to create user.' }
  }
}

export async function listAuditLogs() {
  await requireSection('users')
  return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100)
}
