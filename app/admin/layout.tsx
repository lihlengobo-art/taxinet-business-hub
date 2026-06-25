import type { ReactNode } from 'react'

// Auth is enforced per-page (login is public; the dashboard calls requireAdmin).
export default function AdminLayout({ children }: { children: ReactNode }) {
  return children
}
