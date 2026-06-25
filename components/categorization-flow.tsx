'use client'

import { Brand } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { startSession } from '@/app/actions/content'
import { getIcon } from '@/lib/icon-map'
import {
  AGE_GROUPS,
  RANK_NAME,
  USER_TYPES,
  type AgeGroup,
  type UserType,
} from '@/lib/user-types'
import { cn } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Loader2, MapPin, Wifi } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

function getSessionId() {
  if (typeof window === 'undefined') return ''
  let id = sessionStorage.getItem('tnc_session')
  if (!id) {
    id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    sessionStorage.setItem('tnc_session', id)
  }
  return id
}

export function CategorizationFlow() {
  const router = useRouter()
  const [step, setStep] = useState<'type' | 'age'>('type')
  const [userType, setUserType] = useState<UserType | null>(null)
  const [pending, setPending] = useState(false)

  async function go(type: UserType, age?: AgeGroup) {
    setPending(true)
    const sessionId = getSessionId()
    const device =
      typeof navigator !== 'undefined' && /iPhone|iPad/i.test(navigator.userAgent)
        ? 'iOS'
        : 'Android'
    if (age) sessionStorage.setItem('tnc_age', age)
    sessionStorage.setItem('tnc_type', type)
    try {
      await startSession({ sessionId, userType: type, ageGroup: age ?? null, device })
    } catch {
      // analytics best-effort, continue regardless
    }
    const query = age ? `?age=${encodeURIComponent(age)}` : ''
    router.push(`/${type}${query}`)
  }

  function handleTypeSelect(type: UserType) {
    setUserType(type)
    if (type === 'passenger') {
      setStep('age')
    } else {
      void go(type)
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-2xl flex-col px-4 py-8">
      <header className="flex items-center justify-between">
        <Brand />
        <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
          {RANK_NAME}
        </span>
      </header>

      <div className="mt-10 flex flex-1 flex-col">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Wifi className="h-4 w-4" aria-hidden="true" />
          Wi-Fi access active
        </div>
        <h1 className="mt-3 text-pretty text-3xl font-semibold tracking-tight sm:text-4xl">
          {step === 'type' ? 'Welcome. Who are you today?' : 'Tell us your age group'}
        </h1>
        <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
          {step === 'type'
            ? 'Choose your profile so we can show you the most useful services, opportunities and updates for the rank.'
            : 'We use this to surface the right opportunities — studies and jobs, finance, family or community services.'}
        </p>

        {step === 'type' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {USER_TYPES.map((t) => {
              const Icon = getIcon(t.icon)
              return (
                <Card
                  key={t.id}
                  role="button"
                  tabIndex={0}
                  aria-disabled={pending}
                  onClick={() => !pending && handleTypeSelect(t.id)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !pending) {
                      e.preventDefault()
                      handleTypeSelect(t.id)
                    }
                  }}
                  className={cn(
                    'group cursor-pointer p-5 transition-all hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    pending && userType === t.id && 'border-primary',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {pending && userType === t.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold">{t.label}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                        {t.tagline}
                      </p>
                    </div>
                    <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {step === 'age' && (
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {AGE_GROUPS.map((a) => (
              <Card
                key={a.id}
                role="button"
                tabIndex={0}
                aria-disabled={pending}
                onClick={() => !pending && go('passenger', a.id)}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !pending) {
                    e.preventDefault()
                    void go('passenger', a.id)
                  }
                }}
                className="group cursor-pointer p-5 transition-all hover:border-primary hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold tracking-tight">{a.label}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{a.blurb}</p>
              </Card>
            ))}
          </div>
        )}

        {step === 'age' && (
          <Button
            variant="ghost"
            className="mt-6 w-fit text-muted-foreground"
            onClick={() => {
              setStep('type')
              setUserType(null)
            }}
            disabled={pending}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        )}
      </div>

      <footer className="mt-10 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
        <span>Community Wi-Fi access powered by Taxinet Connect</span>
        <a href="/admin/login" className="font-medium text-primary hover:underline">
          Staff sign in
        </a>
      </footer>
    </div>
  )
}
