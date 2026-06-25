export type UserType = 'passenger' | 'driver' | 'vendor' | 'marshal'
export type AgeGroup = '18-25' | '26-35' | '36-50' | '50+'

export const USER_TYPES: {
  id: UserType
  label: string
  tagline: string
  icon: string
}[] = [
  {
    id: 'passenger',
    label: 'Passenger',
    tagline: 'Commuters travelling through the rank',
    icon: 'Users',
  },
  {
    id: 'driver',
    label: 'Taxi Driver',
    tagline: 'Operators and drivers on the road',
    icon: 'Car',
  },
  {
    id: 'vendor',
    label: 'Vendor',
    tagline: 'Traders and stall owners at the rank',
    icon: 'Store',
  },
  {
    id: 'marshal',
    label: 'Rank Marshal',
    tagline: 'Staff managing rank operations',
    icon: 'ShieldCheck',
  },
]

export const AGE_GROUPS: {
  id: AgeGroup
  label: string
  blurb: string
}[] = [
  { id: '18-25', label: '18 - 25', blurb: 'Studies, jobs & first steps' },
  { id: '26-35', label: '26 - 35', blurb: 'Careers, finance & growth' },
  { id: '36-50', label: '36 - 50', blurb: 'Family, home & wellness' },
  { id: '50+', label: '50+', blurb: 'Health, grants & community' },
]

export const RANK_NAME = 'Wanderers Taxi Rank'

export function userTypeLabel(t: string) {
  return USER_TYPES.find((u) => u.id === t)?.label ?? t
}
