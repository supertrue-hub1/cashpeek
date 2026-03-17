/**
 * Яндекс.Метрика Integration
 * 
 * Отслеживание:
 * - Pageview
 * - Цели (goals)
 * - E-commerce
 */

'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// ============================================
// Types
// ============================================

const YM_ID = process.env.NEXT_PUBLIC_YM_ID;

declare global {
  interface Window {
    ym: any;
    yaCounter: any;
  }
}

/**
 * Отправка pageview
 */
export function pageview(url: string) {
  if (!window.ym || !YM_ID) return;
  window.ym(YM_ID, 'hit', url);
}

/**
 * Достижение цели
 */
export function reachGoal(goalName: string, params?: Record<string, any>) {
  if (!window.ym || !YM_ID) return;
  window.ym(YM_ID, 'reachGoal', goalName, params);
}

/**
 * E-commerce: просмотр товара
 */
export function ecommerceView(productId: string, productName: string, price?: number) {
  if (!window.dataLayer) return;
  
  window.dataLayer.push({
    ecommerce: {
      detail: {
        products: [{
          id: productId,
          name: productName,
          price: price,
        }],
      },
    },
  });
}

/**
 * E-commerce: добавление в корзину
 */
export function ecommerceAddToCart(productId: string, productName: string, price: number) {
  if (!window.dataLayer) return;
  
  window.dataLayer.push({
    ecommerce: {
      add: {
        products: [{
          id: productId,
          name: productName,
          price: price,
          quantity: 1,
        }],
      },
    },
  });
  
  reachGoal('ADD_TO_CART', { productId, price });
}

/**
 * E-commerce: оформление заявки
 */
export function ecommerceCheckout(productId: string, productName: string, price: number) {
  if (!window.dataLayer) return;
  
  window.dataLayer.push({
    ecommerce: {
      purchase: {
        products: [{
          id: productId,
          name: productName,
          price: price,
          quantity: 1,
        }],
      },
    },
  });
  
  reachGoal('ORDER', { productId, price });
}

// ============================================
// Predefined Goals
// ============================================

export const YMGoals = {
  offerClick: (offerId: string) => reachGoal('OFFER_CLICK', { offerId }),
  offerApply: (offerId: string) => reachGoal('OFFER_APPLY', { offerId }),
  filterApply: (filterName: string) => reachGoal('FILTER_APPLY', { filterName }),
  filterReset: () => reachGoal('FILTER_RESET'),
  search: (query: string, resultsCount: number) => reachGoal('SEARCH', { query, resultsCount }),
  addToFavorites: (offerId: string) => reachGoal('ADD_TO_FAVORITES', { offerId }),
  addToCompare: (offerId: string) => reachGoal('ADD_TO_COMPARE', { offerId }),
  viewCompare: () => reachGoal('VIEW_COMPARE'),
  signUp: (method: string) => reachGoal('SIGN_UP', { method }),
  formSubmit: (formName: string) => reachGoal('FORM_SUBMIT', { formName }),
  phoneClick: () => reachGoal('PHONE_CLICK'),
  emailClick: () => reachGoal('EMAIL_CLICK'),
};

// ============================================
// React Components
// ============================================

/**
 * YM Provider - загружает скрипт через Next.js
 */
export function YMProvider({ children }: { children: React.ReactNode }) {
  if (!YM_ID) {
    return <>{children}</>;
  }

  return (
    <>
      <Script id="ym-init" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
          
          ym(${YM_ID}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true,
            ecommerce:"dataLayer"
          });
        `}
      </Script>
      {children}
    </>
  );
}

/**
 * Page View Tracker для Яндекс.Метрики
 */
function YMTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Suspense-обёртка для YMTracker
 */
export function YMAnalytics() {
  return (
    <Suspense fallback={null}>
      <YMTracker />
    </Suspense>
  );
}

export default YMProvider;
