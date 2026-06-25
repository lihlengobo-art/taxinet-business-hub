import { cookies } from 'next/headers'

// The site is hidden behind a secret link. A QR code / shared link points to
// /enter/<ACCESS_CODE>, which grants a cookie that unlocks the passenger flow.
// Change the code by setting SITE_ACCESS_CODE in the project environment.
export const ACCESS_COOKIE = 'site_access'

export function getAccessCode(): string {
  return process.env.SITE_ACCESS_CODE?.trim() || 'taxinet-wanderers-7h2k'
}

export async function hasSiteAccess(): Promise<boolean> {
  const store = await cookies()
  return store.get(ACCESS_COOKIE)?.value === getAccessCode()
}
