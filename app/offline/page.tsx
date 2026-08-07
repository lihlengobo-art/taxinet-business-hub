import Image from 'next/image'
import { WifiOff } from 'lucide-react'

export const metadata = {
  title: 'Offline — Taxinet Connect',
}

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <Image
        src="/images/taxinet-logo.png"
        alt="Taxinet Connect"
        width={180}
        height={72}
        className="h-16 w-auto object-contain mix-blend-multiply"
        priority
      />
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
        <WifiOff className="h-8 w-8 text-primary" aria-hidden="true" />
      </div>
      <div className="max-w-xs space-y-2">
        <h1 className="text-balance text-xl font-semibold text-foreground">
          {"You're offline"}
        </h1>
        <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
          Connect to the Taxinet Wi-Fi at the rank to browse services, offers and updates. Once
          connected, everything loads instantly.
        </p>
      </div>
    </main>
  )
}
