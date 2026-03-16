/**
 * Compare Store (Zustand)
 * 
 * Управление сравнением МФО:
 * - Добавление/удаление из сравнения
 * - Максимум 3 МФО
 * - Сохранение в localStorage
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const MAX_COMPARE_ITEMS = 3;

interface CompareState {
  // Состояние
  compareIds: string[]; // Массив ID МФО для сравнения
  
  // Actions
  addToCompare: (offerId: string) => boolean; // Returns false if max reached
  removeFromCompare: (offerId: string) => void;
  toggleCompare: (offerId: string) => boolean;
  clearCompare: () => void;
  
  // Getters
  isInCompare: (offerId: string) => boolean;
  getCount: () => number;
  canAdd: () => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareIds: [],
      
      addToCompare: (offerId: string) => {
        const { compareIds } = get();
        
        // Уже в сравнении
        if (compareIds.includes(offerId)) {
          return true;
        }
        
        // Максимум достигнут
        if (compareIds.length >= MAX_COMPARE_ITEMS) {
          return false;
        }
        
        set({
          compareIds: [...compareIds, offerId],
        });
        
        return true;
      },
      
      removeFromCompare: (offerId: string) => {
        set((state) => ({
          compareIds: state.compareIds.filter((id) => id !== offerId),
        }));
      },
      
      toggleCompare: (offerId: string) => {
        const { compareIds, addToCompare, removeFromCompare } = get();
        
        if (compareIds.includes(offerId)) {
          removeFromCompare(offerId);
          return false;
        } else {
          return addToCompare(offerId);
        }
      },
      
      clearCompare: () => {
        set({ compareIds: [] });
      },
      
      isInCompare: (offerId: string) => {
        return get().compareIds.includes(offerId);
      },
      
      getCount: () => {
        return get().compareIds.length;
      },
      
      canAdd: () => {
        return get().compareIds.length < MAX_COMPARE_ITEMS;
      },
    }),
    {
      name: 'cashpeek-compare',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ============================================
// React Hook
// ============================================

/**
 * Хук для работы с сравнением в компонентах
 */
'use client';

import { useCompareStore } from './compare-store';

export function useCompare() {
  const compareIds = useCompareStore((state) => state.compareIds);
  const addToCompare = useCompareStore((state) => state.addToCompare);
  const removeFromCompare = useCompareStore((state) => state.removeFromCompare);
  const toggleCompare = useCompareStore((state) => state.toggleCompare);
  const isInCompare = useCompareStore((state) => state.isInCompare);
  const clearCompare = useCompareStore((state) => state.clearCompare);
  const canAdd = useCompareStore((state) => state.canAdd);
  
  return {
    compareIds,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    isInCompare,
    clearCompare,
    canAdd,
    count: compareIds.length,
  };
}
