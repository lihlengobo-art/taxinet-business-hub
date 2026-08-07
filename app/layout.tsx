import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import { PwaInstaller } from '@/components/pwa-installer'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Taxinet Connect — Smart Rank Wi-Fi',
  description:
    'Community Wi-Fi access at the taxi rank with services, opportunities and updates tailored to passengers, drivers, vendors and rank marshals.',
  applicationName: 'Taxinet Connect',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'Taxinet Connect',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#013b8c',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <PwaInstaller />
        <Toaster position="top-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
