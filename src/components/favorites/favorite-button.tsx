/**
 * Favorite Button Component
 * 
 * Кнопка добавления/удаления из избранного
 * - Heart иконка
 * - Анимация при клике
 * - toast уведомление
 */

'use client';

import { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/lib/store/favorites-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface FavoriteButtonProps {
  offerId: string;
  offerName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  className?: string;
}

export function FavoriteButton({
  offerId,
  offerName,
  variant = 'ghost',
  size = 'icon',
  showLabel = false,
  className,
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isFav = isFavorite(offerId);
  
  const handleToggle = () => {
    // Анимация
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
    
    // Переключение
    toggleFavorite(offerId);
    
    // Toast
    if (!isFav) {
      toast.success(
        offerName 
          ? `${offerName} добавлен в избранное` 
          : 'Добавлено в избранное',
        {
          description: 'Вы можете найти его в личном кабинете',
          duration: 3000,
        }
      );
    } else {
      toast.info(
        offerName 
          ? `${offerName} удалён из избранного` 
          : 'Удалено из избранного',
        {
          duration: 2000,
        }
      );
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleToggle}
      className={cn(
        "transition-all duration-200",
        isFav && "text-red-500 hover:text-red-600",
        isAnimating && "scale-125",
        className
      )}
      aria-label={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
      title={isFav ? 'Удалить из избранного' : 'Добавить в избранное'}
    >
      <Heart 
        className={cn(
          "h-5 w-5",
          isFav && "fill-current"
        )} 
      />
      {showLabel && (
        <span className="ml-2">
          {isFav ? 'В избранном' : 'В избранное'}
        </span>
      )}
    </Button>
  );
}

// ============================================
// Badge с счётчиком
// ============================================

interface FavoritesBadgeProps {
  className?: string;
}

export function FavoritesBadge({ className }: FavoritesBadgeProps) {
  const { count } = useFavorites();
  
  if (count === 0) return null;
  
  return (
    <span 
      className={cn(
        "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center",
        "bg-red-500 text-white text-xs font-bold rounded-full px-1",
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
}

// ============================================
// Компонент для страницы избранного
// ============================================

interface FavoritesListProps {
  offers: any[]; // Массив офферов
  onRemove?: (offerId: string) => void;
}

export function FavoritesList({ offers, onRemove }: FavoritesListProps) {
  const { favorites, removeFavorite, clearFavorites } = useFavorites();
  
  // Фильтруем только избранные
  const favoriteOffers = offers.filter(offer => favorites.includes(offer.id));
  
  if (favoriteOffers.length === 0) {
    return (
      <div className="text-center py-12">
        <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Избранного пока нет</h3>
        <p className="text-muted-foreground">
          Добавляйте понравившиеся МФО в избранное, чтобы не потерять их
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {favoriteOffers.length} избранных МФО
        </p>
        <Button 
          variant="outline" 
          size="sm"
          onClick={clearFavorites}
        >
          Очистить всё
        </Button>
      </div>
      
      <div className="space-y-2">
        {favoriteOffers.map(offer => (
          <div 
            key={offer.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {offer.logo && (
                <img 
                  src={offer.logo} 
                  alt={offer.name}
                  className="h-8 w-auto"
                />
              )}
              <div>
                <p className="font-medium">{offer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {offer.minAmount} – {offer.maxAmount} ₽
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Подробнее
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => removeFavorite(offer.id)}
              >
                <Heart className="h-5 w-5 fill-current text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
