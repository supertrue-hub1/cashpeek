'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Типы
export interface Review {
  id: string;
  mfoId: string;
  mfoName: string;
  author: string;
  rating: number;
  text: string;
  pros?: string;
  cons?: string;
  createdAt: string;
  isVerified: boolean;
  likes: number;
}

export interface MfoRating {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating: number;
  reviewsCount: number;
  approvalRate: number;
  avgDecisionTime: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate: number | null;
  psk: number | null;
  isVerified: boolean;
  isPopular: boolean;
  peopleRating: number; // Народный рейтинг (на основе отзывов)
}

export type SortOption = 'rating' | 'reviews' | 'approval' | 'people';

interface RatingState {
  // Фильтры
  sortBy: SortOption;
  showOnlyVerified: boolean;
  searchQuery: string;

  // Отзывы (localStorage)
  reviews: Review[];

  // Действия
  setSortBy: (sort: SortOption) => void;
  toggleVerified: () => void;
  setSearchQuery: (query: string) => void;

  // Отзывы
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'likes'>) => void;
  likeReview: (reviewId: string) => void;

  // Утилиты
  getMfoReviews: (mfoId: string) => Review[];
  getMfoPeopleRating: (mfoId: string) => number;
}

// Генерация ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useRatingStore = create<RatingState>()(
  persist(
    (set, get) => ({
      // Начальные значения фильтров
      sortBy: 'people',
      showOnlyVerified: false,
      searchQuery: '',

      // Начальные отзывы (пустой массив, заполняется из localStorage)
      reviews: [],

      // Действия с фильтрами
      setSortBy: (sortBy) => set({ sortBy }),
      toggleVerified: () => set((state) => ({ showOnlyVerified: !state.showOnlyVerified })),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      // Добавление отзыва
      addReview: (reviewData) => {
        const newReview: Review = {
          ...reviewData,
          id: generateId(),
          createdAt: new Date().toISOString(),
          likes: 0,
        };
        set((state) => ({
          reviews: [newReview, ...state.reviews],
        }));
      },

      // Лайк отзыва
      likeReview: (reviewId) => {
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === reviewId
              ? { ...review, likes: review.likes + 1 }
              : review
          ),
        }));
      },

      // Получить отзывы для конкретной МФО
      getMfoReviews: (mfoId) => {
        return get().reviews.filter((review) => review.mfoId === mfoId);
      },

      // Рассчитать народный рейтинг на основе отзывов
      getMfoPeopleRating: (mfoId) => {
        const mfoReviews = get().getMfoReviews(mfoId);
        if (mfoReviews.length === 0) return 0;

        const sum = mfoReviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round((sum / mfoReviews.length) * 10) / 10;
      },
    }),
    {
      name: 'cashpeek-rating-reviews',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ reviews: state.reviews }),
    }
  )
);
