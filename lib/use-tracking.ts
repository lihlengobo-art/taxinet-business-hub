'use client'

import { trackEvent } from '@/app/actions/content'
import type { AgeGroup, UserType } from '@/lib/user-types'
import { useCallback } from 'react'

export function useTracking(userType: UserType, ageGroup?: AgeGroup | null) {
  const getSessionId = useCallback(() => {
    if (typeof window === 'undefined') return ''
    return sessionStorage.getItem('tnc_session') ?? 'anon'
  }, [])

  const track = useCallback(
    (
      eventType: 'content_click' | 'ad_click' | 'view',
      target?: string,
      adId?: number,
      advertiser?: string,
    ) => {
      void trackEvent({
        sessionId: getSessionId(),
        userType,
        ageGroup: ageGroup ?? null,
        eventType,
        target,
        adId,
        advertiser,
      }).catch(() => {})
    },
    [userType, ageGroup, getSessionId],
  )

  return track
}
