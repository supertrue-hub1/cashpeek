/**
 * Review Store (Zustand)
 * 
 * Управление отзывами:
 * - Локальные отзывы (localStorage)
 * - Серверные отзывы (готово к интеграции)
 * - Лайки отзывов
 * - Hydration safety
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Review, ReviewInput } from '@/types/offer';

// ============================================
// Types
// ============================================

interface ReviewState {
  // Локальные отзывы (из localStorage)
  localReviews: Review[];
  
  // Серверные отзывы (будут загружаться из API)
  serverReviews: Review[];
  
  // Actions
  addReview: (review: ReviewInput) => Review;
  deleteReview: (reviewId: string) => void;
  
  // Лайки
  likeReview: (reviewId: string, userId?: string) => void;
  unlikeReview: (reviewId: string, userId?: string) => void;
  
  // Getters
  getReviewsByMfoId: (mfoId: string) => Review[];
  getLocalReviewsByMfoId: (mfoId: string) => Review[];
  getServerReviewsByMfoId: (mfoId: string) => Review[];
  
  // Server reviews (для будущей интеграции)
  setServerReviews: (reviews: Review[]) => void;
  mergeServerReviews: (reviews: Review[]) => void;
  
  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

// ============================================
// Store
// ============================================

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      localReviews: [],
      serverReviews: [],
      _hasHydrated: false,
      
      // Добавить отзыв
      addReview: (input: ReviewInput) => {
        const newReview: Review = {
          ...input,
          id: uuidv4(),
          date: new Date().toISOString(),
          helpful: 0,
          source: 'local',
          likedBy: [],
        };
        
        set((state) => ({
          localReviews: [newReview, ...state.localReviews],
        }));
        
        return newReview;
      },
      
      // Удалить отзыв (только локальные)
      deleteReview: (reviewId: string) => {
        set((state) => ({
          localReviews: state.localReviews.filter((r) => r.id !== reviewId),
        }));
      },
      
      // Лайкнуть отзыв
      likeReview: (reviewId: string, userId: string = 'anonymous') => {
        set((state) => {
          // Ищем в локальных отзывах
          const localIndex = state.localReviews.findIndex((r) => r.id === reviewId);
          
          if (localIndex !== -1) {
            const review = state.localReviews[localIndex];
            const likedBy = review.likedBy || [];
            
            // Если уже лайкнул — ничего не делаем
            if (likedBy.includes(userId)) {
              return state;
            }
            
            const updatedReviews = [...state.localReviews];
            updatedReviews[localIndex] = {
              ...review,
              helpful: review.helpful + 1,
              likedBy: [...likedBy, userId],
            };
            
            return { localReviews: updatedReviews };
          }
          
          // Ищем в серверных отзывах (для лайков нужна отдельная логика)
          // Пока просто обновляем локально
          const serverIndex = state.serverReviews.findIndex((r) => r.id === reviewId);
          
          if (serverIndex !== -1) {
            const review = state.serverReviews[serverIndex];
            const likedBy = review.likedBy || [];
            
            if (likedBy.includes(userId)) {
              return state;
            }
            
            const updatedReviews = [...state.serverReviews];
            updatedReviews[serverIndex] = {
              ...review,
              helpful: review.helpful + 1,
              likedBy: [...likedBy, userId],
            };
            
            return { serverReviews: updatedReviews };
          }
          
          return state;
        });
      },
      
      // Убрать лайк
      unlikeReview: (reviewId: string, userId: string = 'anonymous') => {
        set((state) => {
          const localIndex = state.localReviews.findIndex((r) => r.id === reviewId);
          
          if (localIndex !== -1) {
            const review = state.localReviews[localIndex];
            const likedBy = review.likedBy || [];
            
            if (!likedBy.includes(userId)) {
              return state;
            }
            
            const updatedReviews = [...state.localReviews];
            updatedReviews[localIndex] = {
              ...review,
              helpful: Math.max(0, review.helpful - 1),
              likedBy: likedBy.filter((id) => id !== userId),
            };
            
            return { localReviews: updatedReviews };
          }
          
          return state;
        });
      },
      
      // Получить все отзывы для МФО (локальные + серверные)
      getReviewsByMfoId: (mfoId: string) => {
        const { localReviews, serverReviews } = get();
        
        const local = localReviews.filter((r) => r.offerId === mfoId);
        const server = serverReviews.filter((r) => r.offerId === mfoId);
        
        // Локальные отзывы показываем первыми
        return [...local, ...server];
      },
      
      // Только локальные отзывы
      getLocalReviewsByMfoId: (mfoId: string) => {
        return get().localReviews.filter((r) => r.offerId === mfoId);
      },
      
      // Только серверные отзывы
      getServerReviewsByMfoId: (mfoId: string) => {
        return get().serverReviews.filter((r) => r.offerId === mfoId);
      },
      
      // Установить серверные отзывы (из API/SSR)
      setServerReviews: (reviews: Review[]) => {
        set({ serverReviews: reviews });
      },
      
      // Добавить серверные отзывы (дополнительно)
      mergeServerReviews: (reviews: Review[]) => {
        set((state) => {
          const existingIds = new Set(state.serverReviews.map((r) => r.id));
          const newReviews = reviews.filter((r) => !existingIds.has(r.id));
          return {
            serverReviews: [...state.serverReviews, ...newReviews],
          };
        });
      },
      
      // Hydration
      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'cashpeek-reviews',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        localReviews: state.localReviews,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// ============================================
// React Hooks
// ============================================

/**
 * Хук для проверки гидратации
 */
export function useReviewHydrated() {
  const hasHydrated = useReviewStore((state) => state._hasHydrated);
  return hasHydrated;
}

/**
 * Основной хук для работы с отзывами
 */
export function useReviews(mfoId?: string) {
  const localReviews = useReviewStore((state) => state.localReviews);
  const serverReviews = useReviewStore((state) => state.serverReviews);
  const addReview = useReviewStore((state) => state.addReview);
  const deleteReview = useReviewStore((state) => state.deleteReview);
  const likeReview = useReviewStore((state) => state.likeReview);
  const unlikeReview = useReviewStore((state) => state.unlikeReview);
  const getReviewsByMfoId = useReviewStore((state) => state.getReviewsByMfoId);
  
  const reviews = mfoId ? getReviewsByMfoId(mfoId) : [];
  
  return {
    reviews,
    localReviews,
    serverReviews,
    addReview,
    deleteReview,
    likeReview,
    unlikeReview,
    count: reviews.length,
  };
}
