/**
 * Favorites Store (Zustand)
 * 
 * Управление избранными МФО:
 * - Добавление/удаление из избранного
 * - Сохранение в localStorage
 * - Синхронизация между вкладками
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoritesState {
  // Состояние
  favorites: string[]; // Массив ID избранных МФО
  
  // Actions
  addFavorite: (offerId: string) => void;
  removeFavorite: (offerId: string) => void;
  toggleFavorite: (offerId: string) => void;
  clearFavorites: () => void;
  
  // Getters
  isFavorite: (offerId: string) => boolean;
  getCount: () => number;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (offerId: string) => {
        set((state) => {
          if (state.favorites.includes(offerId)) {
            return state;
          }
          return {
            favorites: [...state.favorites, offerId],
          };
        });
      },
      
      removeFavorite: (offerId: string) => {
        set((state) => ({
          favorites: state.favorites.filter((id) => id !== offerId),
        }));
      },
      
      toggleFavorite: (offerId: string) => {
        const { favorites } = get();
        if (favorites.includes(offerId)) {
          get().removeFavorite(offerId);
        } else {
          get().addFavorite(offerId);
        }
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
      },
      
      isFavorite: (offerId: string) => {
        return get().favorites.includes(offerId);
      },
      
      getCount: () => {
        return get().favorites.length;
      },
    }),
    {
      name: 'cashpeek-favorites', // localStorage key
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // Нужно для корректной работы с SSR
    }
  )
);

// ============================================
// Hydration для SSR
// ============================================

/**
 * Хук для инициализации избранного на клиенте
 * Использовать в layout или provider
 */
'use client';

import { useEffect, useState } from 'react';

export function useFavoritesHydrated() {
  const [hydrated, setHydrated] = useState(false);
  
  useEffect(() => {
    // Zustand auto-hydration
    setHydrated(true);
  }, []);
  
  return hydrated;
}

// ============================================
// React Hook
// ============================================

/**
 * Хук для работы с избранным в компонентах
 */
'use client';

import { useFavoritesStore } from './favorites-store';

export function useFavorites() {
  const favorites = useFavoritesStore((state) => state.favorites);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  const isFavorite = useFavoritesStore((state) => state.isFavorite);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);
  
  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  };
}
