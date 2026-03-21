'use client';

import { useEffect } from 'react';
import { useReviewStore } from '@/lib/store/use-review-store';

/**
 * Provider для инициализации Review Store на клиенте
 * 
 * Использование:
 * ```tsx
 * <ReviewProvider>
 *   <App />
 * </ReviewProvider>
 * ```
 */
export function ReviewProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Инициализация после гидратации
    useReviewStore.persist.rehydrate();
  }, []);
  
  return <>{children}</>;
}
