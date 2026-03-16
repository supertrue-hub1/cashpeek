/**
 * Analytics Provider
 * 
 * Объединяет GA4 и Яндекс.Метрику
 * Добавляется в layout
 */

'use client';

import { GAProvider, GAAnalytics } from './ga4';
import { YMProvider, YMAnalytics } from './yandex-metrika';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  return (
    <GAProvider>
      <YMProvider>
        <GAAnalytics />
        <YMAnalytics />
        {children}
      </YMProvider>
    </GAProvider>
  );
}

export { GAProvider, GAAnalytics, GAEvents } from './ga4';
export { YMProvider, YMAnalytics, YMGoals, reachGoal } from './yandex-metrika';
