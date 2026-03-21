'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, MessageSquare, Loader2 } from 'lucide-react';
import { useReviews, useReviewHydrated } from '@/lib/store/use-review-store';
import { ReviewCard } from './review-card';
import { ReviewForm } from './review-form';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Review } from '@/types/offer';

// ============================================
// Empty State
// ============================================

interface EmptyStateProps {
  mfoId: string;
  mfoName: string;
}

function EmptyState({ mfoId, mfoName }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
        <MessageSquare className="h-8 w-8 text-muted-foreground/50" />
      </div>
      <h3 className="font-medium text-foreground mb-1">
        Пока нет отзывов
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm">
        Будьте первым, кто оставит отзыв о {mfoName}!
      </p>
      <ReviewForm
        mfoId={mfoId}
        mfoName={mfoName}
        trigger={
          <Button className="gap-2">
            <Star className="h-4 w-4" />
            Оставить первый отзыв
          </Button>
        }
      />
    </motion.div>
  );
}

// ============================================
// Loading Skeleton
// ============================================

function ReviewSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-muted rounded mb-2" />
          <div className="h-3 w-24 bg-muted rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full bg-muted rounded" />
        <div className="h-3 w-4/5 bg-muted rounded" />
        <div className="h-3 w-2/3 bg-muted rounded" />
      </div>
    </div>
  );
}

// ============================================
// Review List Component
// ============================================

interface ReviewListProps {
  mfoId: string;
  mfoName: string;
  serverReviews?: Review[];
  showForm?: boolean;
  showCount?: boolean;
  maxItems?: number;
  className?: string;
}

export function ReviewList({
  mfoId,
  mfoName,
  serverReviews = [],
  showForm = true,
  showCount = true,
  maxItems,
  className,
}: ReviewListProps) {
  const hydrated = useReviewHydrated();
  const { reviews: localReviews, deleteReview } = useReviews(mfoId);
  const [showAll, setShowAll] = React.useState(false);
  
  // Устанавливаем серверные отзывы при монтировании
  React.useEffect(() => {
    if (serverReviews.length > 0) {
      const { setServerReviews } = useReviewStore.getState();
      setServerReviews(serverReviews);
    }
  }, [serverReviews]);
  
  // Объединяем отзывы: локальные первыми
  const allReviews = React.useMemo(() => {
    const local = localReviews.filter((r) => r.offerId === mfoId);
    const server = serverReviews.filter((r) => r.offerId === mfoId);
    
    // Убираем дубликаты по ID
    const serverIds = new Set(local.map((r) => r.id));
    const uniqueServer = server.filter((r) => !serverIds.has(r.id));
    
    return [...local, ...uniqueServer];
  }, [localReviews, serverReviews, mfoId]);
  
  // Ограничение количества
  const displayedReviews = React.useMemo(() => {
    if (!maxItems || showAll) return allReviews;
    return allReviews.slice(0, maxItems);
  }, [allReviews, maxItems, showAll]);
  
  const hasMore = maxItems && allReviews.length > maxItems && !showAll;
  
  // Если нет hydration — показываем скелетоны
  if (!hydrated) {
    return (
      <div className={cn('space-y-4', className)}>
        {showCount && (
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-9 w-32 bg-muted rounded animate-pulse" />
          </div>
        )}
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <ReviewSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }
  
  // Пустое состояние
  if (allReviews.length === 0) {
    return (
      <div className={className}>
        <EmptyState mfoId={mfoId} mfoName={mfoName} />
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      {showCount && (
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">
            Отзывы ({allReviews.length})
          </h3>
          {showForm && (
            <ReviewForm
              mfoId={mfoId}
              mfoName={mfoName}
              trigger={
                <Button variant="outline" size="sm" className="gap-2">
                  <Star className="h-4 w-4" />
                  Написать отзыв
                </Button>
              }
            />
          )}
        </div>
      )}
      
      {/* Reviews Grid */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {displayedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onDelete={review.source === 'local' ? deleteReview : undefined}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {/* Show More Button */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-2"
        >
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
          >
            Показать все отзывы ({allReviews.length})
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// Импорт для useEffect
import { useReviewStore } from '@/lib/store/use-review-store';
