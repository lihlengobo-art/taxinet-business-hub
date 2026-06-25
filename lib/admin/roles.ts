export type AdminRole = 'super_admin' | 'finance' | 'marketing' | 'operations'

export const ADMIN_ROLES: { value: AdminRole; label: string; description: string }[] = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Full access to every section, plus user management.',
  },
  {
    value: 'finance',
    label: 'Finance',
    description: 'Revenue, commissions, expenses and financial reports.',
  },
  {
    value: 'marketing',
    label: 'Marketing',
    description: 'Audience analytics, partners, ads and lead performance.',
  },
  {
    value: 'operations',
    label: 'Operations',
    description: 'Live engagement, funnel and rank operations dashboards.',
  },
]

export type AdminSection = 'overview' | 'analytics' | 'partners' | 'finance' | 'users'

// Which roles may access each admin section.
const SECTION_ACCESS: Record<AdminSection, AdminRole[]> = {
  overview: ['super_admin', 'finance', 'marketing', 'operations'],
  analytics: ['super_admin', 'marketing', 'operations'],
  partners: ['super_admin', 'marketing'],
  finance: ['super_admin', 'finance'],
  users: ['super_admin'],
}

export function canAccess(role: string | undefined, section: AdminSection): boolean {
  if (!role) return false
  return SECTION_ACCESS[section].includes(role as AdminRole)
}

export function roleLabel(role: string | undefined): string {
  return ADMIN_ROLES.find((r) => r.value === role)?.label ?? 'Operations'
}

// Sections visible in the nav for a given role, in display order.
export function visibleSections(role: string | undefined): AdminSection[] {
  const all: AdminSection[] = ['overview', 'analytics', 'partners', 'finance', 'users']
  return all.filter((s) => canAccess(role, s))
}
