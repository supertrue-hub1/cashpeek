"use client"

import Script from "next/script"

/**
 * Google Analytics 4 + Yandex.Metrica Component
 * 
 * GA4 Measurement ID: G-ED5WFL7PCW
 * Yandex.Metrica ID: 101294728
 */
export function GoogleAnalytics() {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-ED5WFL7PCW"
  const ymId = process.env.NEXT_PUBLIC_YM_ID || "107712908"

  return (
    <>
      {/* Google tag (gtag.js) */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaMeasurementId}', {
            page_path: window.location.pathname,
            send_page_view: true
          });
        `}
      </Script>
      
      {/* Yandex.Metrica */}
      <Script id="yandex-metrica" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          
          ym(${ymId}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true,
            ecommerce:"dataLayer"
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
