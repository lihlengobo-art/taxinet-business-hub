'use server'

import { db } from '@/lib/db'
import { incidentReports, vendorApplications } from '@/lib/db/schema'
import { RANK_NAME } from '@/lib/user-types'
import { revalidatePath } from 'next/cache'

export async function submitIncident(input: {
  reporterType: string
  category: string
  description: string
  severity: string
}) {
  if (!input.description.trim()) {
    return { ok: false, error: 'Please describe the incident.' }
  }
  await db.insert(incidentReports).values({
    reporterType: input.reporterType,
    rankName: RANK_NAME,
    category: input.category,
    description: input.description.trim(),
    severity: input.severity,
  })
  revalidatePath('/rank-management')
  return { ok: true }
}

export async function submitVendorApplication(input: {
  businessName: string
  ownerName: string
  category: string
  phone?: string
  notes?: string
}) {
  if (!input.businessName.trim() || !input.ownerName.trim()) {
    return { ok: false, error: 'Business and owner name are required.' }
  }
  await db.insert(vendorApplications).values({
    businessName: input.businessName.trim(),
    ownerName: input.ownerName.trim(),
    category: input.category,
    phone: input.phone?.trim() || null,
    notes: input.notes?.trim() || null,
  })
  revalidatePath('/rank-management')
  return { ok: true }
}
