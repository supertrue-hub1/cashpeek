"use client"

import Script from "next/script"

/**
 * Google Analytics 4 Component
 * Measurement ID: G-ED5WFL7PCW
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-ED5WFL7PCW"

  // Не рендерить в development
  if (process.env.NODE_ENV === "development") {
    return null
  }

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}

/**
 * Отправка события в GA4
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", eventName, params)
  }
}

/**
 * События для MFO агрегатора
 */
export const GA4_EVENTS = {
  // Клик по кнопке МФО
  clickMfoButton: (offerId: string, offerName: string) => 
    trackEvent("click_mfo_button", { offer_id: offerId, offer_name: offerName }),

  // Просмотр оффера
  viewOffer: (offerId: string, offerName: string) =>
    trackEvent("view_offer", { offer_id: offerId, offer_name: offerName }),

  // Фильтр по сумме
  filterByAmount: (amount: number) =>
    trackEvent("filter_by_amount", { amount }),

  // Фильтр по сроку
  filterByTerm: (term: number) =>
    trackEvent("filter_by_term", { term }),

  // Отправка заявки
  submitForm: (offerId: string) =>
    trackEvent("submit_form", { offer_id: offerId }),

  // Поиск
  search: (query: string) =>
    trackEvent("search", { query }),
} as const
