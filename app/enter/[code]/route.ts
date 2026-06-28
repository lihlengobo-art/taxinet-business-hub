import { db } from '@/lib/db'
import { connections } from '@/lib/db/schema'
import { CONNECTION_PRICE, DEVICE_COOKIE } from '@/lib/pricing'
import { ACCESS_COOKIE, getAccessCode } from '@/lib/site-access'
import { type NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const YEAR = 60 * 60 * 24 * 365

// Secret entry point: /enter/<code>. Put this behind a QR code at the rank.
// A correct code sets a long-lived access cookie and sends the visitor to the
// passenger Wi-Fi flow. Anything else 404s so the path can't be probed.
//
// Each valid entry also records a paid R7 connection for the financials,
// deduplicated per device per day: the device is identified by a persistent
// cookie, and a unique (device_id, connection_date) constraint means a client
// returning the same day is never counted twice — but the next day counts again.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params

  if (code !== getAccessCode()) {
    return new NextResponse(null, { status: 404 })
  }

  // Identify the device, generating a stable id on first contact.
  let deviceId = request.cookies.get(DEVICE_COOKIE)?.value
  const isNewDevice = !deviceId
  if (!deviceId) deviceId = crypto.randomUUID()

  // Record today's connection. The unique constraint silently drops duplicates
  // for the same device on the same day, so financials never double-count.
  try {
    await db
      .insert(connections)
      .values({ deviceId, amount: String(CONNECTION_PRICE) })
      .onConflictDoNothing({
        target: [connections.deviceId, connections.connectionDate],
      })
  } catch {
    // Never block site access if the connection log fails.
  }

  const response = NextResponse.redirect(new URL('/', request.url))
  response.cookies.set(ACCESS_COOKIE, getAccessCode(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: YEAR,
  })
  if (isNewDevice) {
    response.cookies.set(DEVICE_COOKIE, deviceId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: YEAR,
    })
  }
  return response
}
