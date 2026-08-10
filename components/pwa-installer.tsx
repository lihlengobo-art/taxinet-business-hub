'use client'

import { Button } from '@/components/ui/button'
import { Download, Share, SquarePlus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'android' | 'ios' | 'other'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'other'
  const ua = navigator.userAgent.toLowerCase()
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/android/.test(ua)) return 'android'
  return 'other'
}

export function PwaInstaller() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [platform, setPlatform] = useState<Platform>('other')
  const [installed, setInstalled] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    // Register the service worker for offline caching.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    setPlatform(detectPlatform())

    // If already running as an installed app, don't show anything.
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      // iOS Safari exposes this non-standard flag when launched from home screen.
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) setInstalled(true)

    // Capture the native install prompt so our own button can trigger it.
    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setInstallEvent(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    function onInstalled() {
      setInstalled(true)
      setInstallEvent(null)
    }
    window.addEventListener('appinstalled', onInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  async function handleInstall() {
    // Best case: Chrome/Android gave us the native prompt.
    if (installEvent) {
      await installEvent.prompt()
      await installEvent.userChoice
      setInstallEvent(null)
      return
    }
    // Otherwise (iOS, or browsers that hide the prompt) guide the user.
    setShowInstructions(true)
  }

  // Nothing to do if the app is already installed or the user dismissed it.
  if (installed || dismissed) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[env(safe-area-inset-bottom)]">
        <div className="mb-4 flex w-full max-w-sm items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Download className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">Install Taxinet Connect</p>
            <p className="truncate text-xs text-muted-foreground">
              Add to your home screen for one-tap access.
            </p>
          </div>
          <Button size="sm" onClick={handleInstall}>
            Install
          </Button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss install prompt"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showInstructions && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 px-4 pb-[env(safe-area-inset-bottom)] sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="How to install Taxinet Connect"
          onClick={() => setShowInstructions(false)}
        >
          <div
            className="mb-4 w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl sm:mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Install the app</h2>
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                aria-label="Close"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {platform === 'ios' ? (
              <ol className="flex flex-col gap-3 text-sm text-foreground">
                <li className="flex items-center gap-3">
                  <Share className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    {'Tap the '}
                    <span className="font-semibold">Share</span>
                    {' button in the Safari toolbar.'}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <SquarePlus className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    {'Choose '}
                    <span className="font-semibold">Add to Home Screen</span>
                    {'.'}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Download className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    {'Tap '}
                    <span className="font-semibold">Add</span>
                    {' — Taxinet Connect will appear on your home screen.'}
                  </span>
                </li>
              </ol>
            ) : (
              <ol className="flex flex-col gap-3 text-sm text-foreground">
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    1
                  </span>
                  <span>
                    {'Open the browser menu ('}
                    <span className="font-semibold">⋮</span>
                    {') in the top corner.'}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    2
                  </span>
                  <span>
                    {'Choose '}
                    <span className="font-semibold">Install app</span>
                    {' or '}
                    <span className="font-semibold">Add to Home screen</span>
                    {'.'}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    3
                  </span>
                  <span>{'Confirm to add Taxinet Connect to your device.'}</span>
                </li>
              </ol>
            )}

            <Button className="mt-5 w-full" onClick={() => setShowInstructions(false)}>
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
