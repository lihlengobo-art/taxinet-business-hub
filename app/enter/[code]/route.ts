import { ACCESS_COOKIE, getAccessCode } from '@/lib/site-access'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Secret entry point: /enter/<code>. Put this behind a QR code at the rank.
// A correct code sets a long-lived access cookie and sends the visitor to the
// passenger Wi-Fi flow. Anything else 404s so the path can't be probed.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params

  if (code !== getAccessCode()) {
    return new NextResponse(null, { status: 404 })
  }

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set(ACCESS_COOKIE, getAccessCode(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  })
  return response
}
