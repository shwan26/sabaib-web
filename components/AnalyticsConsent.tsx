'use client'

import { useEffect, useState } from 'react'
import { GoogleAnalytics } from './GoogleAnalytics'

const CONSENT_KEY = 'sabaib-analytics-consent-v1'

export function AnalyticsConsent() {
  const [consent, setConsent] = useState<'accepted' | 'declined' | null>(null)

  useEffect(() => {
    const storedConsent = window.localStorage.getItem(CONSENT_KEY)
    if (storedConsent === 'accepted' || storedConsent === 'declined') {
      queueMicrotask(() => setConsent(storedConsent))
    }
  }, [])

  const chooseConsent = (choice: 'accepted' | 'declined') => {
    window.localStorage.setItem(CONSENT_KEY, choice)
    setConsent(choice)
  }

  return (
    <>
      <GoogleAnalytics enabled={consent === 'accepted'} />
      {consent === null && (
        <aside className="analytics-consent" aria-label="Analytics consent">
          <div>
            <strong>Help improve SabaiB</strong>
            <p>Allow anonymous usage analytics to help us improve the app.</p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" className="analytics-consent-decline" onClick={() => chooseConsent('declined')}>
              Decline
            </button>
            <button type="button" className="analytics-consent-accept" onClick={() => chooseConsent('accepted')}>
              Allow analytics
            </button>
          </div>
        </aside>
      )}
    </>
  )
}