/**
 * Google Analytics 4 Integration
 * 
 * Отслеживание событий:
 * - Pageview
 * - Conversion (клики по офферам)
 * - Search
 * - Filter usage
 * - Compare actions
 * - Favorite actions
 */

'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

// ============================================
// Types
// ============================================

interface GAEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}

interface GAPageView {
  page_path: string;
  page_title?: string;
}

// ============================================
// Analytics Instance
// ============================================

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag: any;
    dataLayer: any;
  }
}

/**
 * Инициализация GA4
 */
export function initGA() {
  if (!GA_MEASUREMENT_ID) {
    console.warn('[GA4] GA_ID not set');
    return;
  }

  // Добавляем скрипт
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script1);

  // Инициализация
  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
}

/**
 * Отправка события pageview
 */
export function pageview(url: string, title?: string) {
  if (!window.gtag || !GA_MEASUREMENT_ID) return;
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title || document.title,
  });
}

/**
 * Отправка события
 */
export function event({ action, category, label, value }: GAEvent) {
  if (!window.gtag) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// ============================================
// Event Helpers
// ============================================

export const GAEvents = {
  // Офферы
  offerClick: (offerName: string, offerId: string) => {
    event({
      action: 'select_content',
      category: 'offers',
      label: offerName,
      value: Number(offerId),
    });
  },
  
  offerApply: (offerName: string, amount: number) => {
    event({
      action: 'begin_checkout',
      category: 'offers',
      label: offerName,
      value: amount,
    });
  },
  
  // Поиск
  search: (query: string, resultsCount: number) => {
    event({
      action: 'search',
      category: 'site',
      label: query,
      value: resultsCount,
    });
  },
  
  // Фильтры
  filterApply: (filterName: string, filterValue: string) => {
    event({
      action: 'apply_filter',
      category: 'filters',
      label: `${filterName}: ${filterValue}`,
    });
  },
  
  filterReset: () => {
    event({
      action: 'reset_filters',
      category: 'filters',
    });
  },
  
  // Избранное
  addToFavorites: (offerName: string) => {
    event({
      action: 'add_to_wishlist',
      category: 'favorites',
      label: offerName,
    });
  },
  
  removeFromFavorites: (offerName: string) => {
    event({
      action: 'remove_from_wishlist',
      category: 'favorites',
      label: offerName,
    });
  },
  
  // Сравнение
  addToCompare: (offerName: string) => {
    event({
      action: 'add_to_compare',
      category: 'compare',
      label: offerName,
    });
  },
  
  viewCompare: () => {
    event({
      action: 'view_compare',
      category: 'compare',
    });
  },
  
  // Регистрация / Логин
  signUp: (method: string) => {
    event({
      action: 'sign_up',
      category: 'auth',
      label: method,
    });
  },
  
  // Скролл
  scrollDepth: (depth: number) => {
    event({
      action: 'scroll',
      category: 'engagement',
      label: `${depth}%`,
    });
  },
  
  // Время на странице
  timeOnPage: (seconds: number) => {
    event({
      action: 'timing_complete',
      category: 'engagement',
      label: 'time_on_page',
      value: seconds,
    });
  },
};

// ============================================
// React Components
// ============================================

/**
 * GA4 Provider - инициализирует аналитику
 */
export function GAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initGA();
  }, []);

  return <>{children}</>;
}

/**
 * Page View Tracker - отслеживает переходы между страницами
 */
function GATracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    pageview(url, document.title);
  }, [pathname, searchParams]);

  return null;
}

/**
 * Suspense-обёртка для GATracker
 */
export function GAAnalytics() {
  return (
    <Suspense fallback={null}>
      <GATracker />
    </Suspense>
  );
}

export default GAProvider;
