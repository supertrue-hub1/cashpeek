/**
 * Core Web Vitals Tracker
 * 
 * Отслеживание метрик производительности:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * 
 * Отправка в Google Analytics / Яндекс.Метрика
 */

'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface WebVitalsMetric {
  id: string;
  name: string;
  value: number;
  delta: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

// ============================================
// Web Vitals Reporter
// ============================================

/**
 * Отправка метрики в консоль и аналитику
 */
function reportWebVitals(metric: WebVitalsMetric) {
  // Логирование в консоль
  console.log(`[Web Vitals] ${metric.name}:`, {
    value: metric.value.toFixed(2),
    delta: metric.delta.toFixed(2),
    rating: metric.rating,
  });

  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: metric.rating,
      metric_id: metric.id,
    });
  }

  // Яндекс.Метрика
  if (typeof window !== 'undefined' && (window as any).ym) {
    (window as any).ym?.('reachGoal', `WEB_VITALS_${metric.name}`, {
      value: metric.value,
      rating: metric.rating,
    });
  }

  // Отправка в API (опционально)
  sendToAnalytics(metric);
}

/**
 * Отправка на сервер
 */
async function sendToAnalytics(metric: WebVitalsMetric) {
  try {
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...metric,
        url: window.location.href,
        timestamp: Date.now(),
      }),
      // Не блокируем навигацию
      keepalive: true,
    });
  } catch (error) {
    // Игнорируем ошибки отправки
  }
}

// ============================================
// React Component
// ============================================

export function WebVitalsTracker() {
  const pathname = usePathname();
  const webVitalsLoaded = useRef(false);

  useEffect(() => {
    // Загружаем web-vitals только один раз
    if (webVitalsLoaded.current) return;
    webVitalsLoaded.current = true;

    // Динамический импорт web-vitals
    import('web-vitals').then((webVitals) => {
      const { onCLS, onFID, onFCP, onLCP, onTTFB, onINP } = webVitals;

      // Largest Contentful Paint
      onLCP((metric: WebVitalsMetric) => {
        reportWebVitals({ ...metric, name: 'LCP' });
      });

      // First Input Delay (или INP)
      onINP((metric: WebVitalsMetric) => {
        reportWebVitals({ ...metric, name: 'INP' });
      });

      // Cumulative Layout Shift
      onCLS((metric: WebVitalsMetric) => {
        reportWebVitals({ ...metric, name: 'CLS' });
      });

      // First Contentful Paint
      onFCP((metric: WebVitalsMetric) => {
        reportWebVitals({ ...metric, name: 'FCP' });
      });

      // Time to First Byte
      onTTFB((metric: WebVitalsMetric) => {
        reportWebVitals({ ...metric, name: 'TTFB' });
      });
    }).catch((error) => {
      console.error('[Web Vitals] Failed to load:', error);
    });
  }, [pathname]);

  // Компонент ничего не рендерит
  return null;
}

// ============================================
// API Route для сохранения метрик
// ============================================

export const config = {
  runtime: 'edge',
};
