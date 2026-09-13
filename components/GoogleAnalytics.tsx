import Script from 'next/script'

interface GoogleAnalyticsProps {
  enabled: boolean
}

export function GoogleAnalytics({ enabled }: GoogleAnalyticsProps) {
  const measurementId = process.env.NEXT_PUBLIC_GA_ID

  if (!enabled || !measurementId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}