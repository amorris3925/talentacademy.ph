'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'

// ─── Environment Variables ─────────────────────────────────────────────────
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || ''
const HOTJAR_ID = process.env.NEXT_PUBLIC_HOTJAR_ID || ''
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || ''
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'

// ─── PostHog Init ──────────────────────────────────────────────────────────
let posthogInitialized = false

function initPostHog() {
  if (posthogInitialized || !POSTHOG_KEY || typeof window === 'undefined') return
  posthogInitialized = true

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // We handle manually below
    capture_pageleave: true,
    autocapture: true, // Tracks clicks, form submits, etc.
    session_recording: {
      maskAllInputs: false, // Show quiz reasoning text in recordings
      maskInputOptions: {
        password: true, // Still mask passwords
      },
    },
  })
}

// ─── Page View Tracker ─────────────────────────────────────────────────────
function useTrackPageViews() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pathname) return
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname

    // GA4 page view
    if (GA_MEASUREMENT_ID && typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, { page_path: url })
    }

    // PostHog page view
    if (POSTHOG_KEY && posthogInitialized) {
      posthog.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams])
}

// ─── PostHog User Identification ───────────────────────────────────────────
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!POSTHOG_KEY || !posthogInitialized) return
  posthog.identify(userId, properties)
}

export function resetUser() {
  if (!POSTHOG_KEY || !posthogInitialized) return
  posthog.reset()
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function ExternalAnalytics() {
  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog()
  }, [])

  // Track page views on route changes
  useTrackPageViews()

  return (
    <>
      {/* ── Google Analytics 4 ──────────────────────────────────────────── */}
      {GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}', {
                page_path: window.location.pathname,
                send_page_view: false
              });
            `}
          </Script>
        </>
      )}

      {/* ── Microsoft Clarity ───────────────────────────────────────────── */}
      {CLARITY_PROJECT_ID && (
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window,document,"clarity","script","${CLARITY_PROJECT_ID}");
          `}
        </Script>
      )}

      {/* ── Hotjar ─────────────────────────────────────────────────────────── */}
      {HOTJAR_ID && (
        <Script id="hotjar-init" strategy="afterInteractive">
          {`
            (function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:${HOTJAR_ID},hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
          `}
        </Script>
      )}
    </>
  )
}
