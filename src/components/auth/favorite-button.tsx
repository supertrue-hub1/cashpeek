/**
 * Кнопка "В избранное"
 * Гибридный режим: LocalStorage для гостей, БД для авторизованных
 */

'use client';

import { useState, useEffect, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/app/actions/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RegisterForm } from './register-form';

// ============================================
// LocalStorage utilities
// ============================================

const GUEST_FAVORITES_KEY = 'cashpeek_guest_favorites';
const GUEST_ID_KEY = 'cashpeek_guest_id';

interface GuestFavorite {
  offerId: string;
  offerExternalId?: string;
  note?: string;
  createdAt: string;
}

function getGuestId(): string {
  if (typeof window === 'undefined') return '';

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

function getGuestFavorites(): GuestFavorite[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(GUEST_FAVORITES_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveGuestFavorites(favorites: GuestFavorite[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favorites));
}

// ============================================
// Component
// ============================================

interface FavoriteButtonProps {
  offerId: string;
  offerExternalId?: string;
  initialIsFavorite?: boolean;
  isAuthenticated: boolean;
  variant?: 'default' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
  className?: string;
}

export function FavoriteButton({
  offerId,
  offerExternalId,
  initialIsFavorite = false,
  isAuthenticated,
  variant = 'ghost',
  size = 'icon',
  showText = false,
  className,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Синхронизация с localStorage для гостей
  useEffect(() => {
    if (!isAuthenticated) {
      const favorites = getGuestFavorites();
      setIsFavorite(favorites.some((f) => f.offerId === offerId));
    }
  }, [isAuthenticated, offerId]);

  const handleToggle = async () => {
    if (isAuthenticated) {
      // Авторизованный пользователь - работаем с БД
      startTransition(async () => {
        const result = await toggleFavorite(offerId, offerExternalId);
        if (result.success && result.data) {
          setIsFavorite(result.data.isFavorite);
        }
      });
    } else {
      // Гость - работаем с localStorage
      const favorites = getGuestFavorites();
      const existingIndex = favorites.findIndex((f) => f.offerId === offerId);

      if (existingIndex >= 0) {
        // Удаляем
        favorites.splice(existingIndex, 1);
        setIsFavorite(false);
      } else {
        // Добавляем
        favorites.push({
          offerId,
          offerExternalId,
          createdAt: new Date().toISOString(),
        });
        setIsFavorite(true);

        // Показываем диалог с предложением регистрации после 3-го избранного
        if (favorites.length >= 3) {
          setShowAuthDialog(true);
        }
      }

      saveGuestFavorites(favorites);
    }
  };

  const handleSyncComplete = () => {
    // Очищаем localStorage после миграции
    localStorage.removeItem(GUEST_FAVORITES_KEY);
    localStorage.removeItem(GUEST_ID_KEY);
    setShowAuthDialog(false);
  };

  const guestData = (() => {
    if (isAuthenticated) return null;
    const guestId = getGuestId();
    const favorites = getGuestFavorites();
    return {
      guestId,
      favorites,
      searchHistory: [], // Можно добавить историю поиска
    };
  })();

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          'group transition-all',
          isFavorite && 'text-red-500 hover:text-red-600',
          className
        )}
        title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      >
        <Heart
          className={cn(
            'h-4 w-4 transition-all',
            isFavorite ? 'fill-current' : 'group-hover:scale-110'
          )}
        />
        {showText && (
          <span className="ml-2">
            {isFavorite ? 'В избранном' : 'В избранное'}
          </span>
        )}
      </Button>

      {/* Диалог регистрации */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Сохраните избранное</DialogTitle>
            <DialogDescription>
              Зарегистрируйтесь, чтобы сохранить избранное и получить доступ к
              нему с любого устройства
            </DialogDescription>
          </DialogHeader>
          <RegisterForm 
            onSuccess={handleSyncComplete}
            onSwitchToLogin={() => setShowAuthDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============================================
// Hook для получения данных гостя
// ============================================

export function useGuestData() {
  const [guestData, setGuestData] = useState<{
    guestId: string;
    favorites: GuestFavorite[];
  } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const guestId = getGuestId();
    const favorites = getGuestFavorites();

    setGuestData({ guestId, favorites });
  }, []);

  return guestData;
}

// ============================================
// Компонент для отображения количества избранного
// ============================================

export function FavoriteCount({
  count,
  className,
}: {
  count: number;
  className?: string;
}) {
  if (count === 0) return null;

  return (
    <span
      className={cn(
        'absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center',
        className
      )}
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
