import { CategorizationFlow } from '@/components/categorization-flow'
import { hasSiteAccess } from '@/lib/site-access'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // The passenger site is hidden behind a secret link. Visitors who haven't
  // come through /enter/<code> see nothing useful.
  const allowed = await hasSiteAccess()
  if (!allowed) {
    notFound()
  }

  return (
    <main className="min-h-svh bg-background">
      <CategorizationFlow />
    </main>
  )
}
