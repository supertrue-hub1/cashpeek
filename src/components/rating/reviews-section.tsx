'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquarePlus, ThumbsUp, ChevronLeft, ChevronRight, Quote, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { StarRating } from './star-rating';
import { ReviewFormDialog } from './review-form-dialog';
import { useRatingStore, type Review } from '@/lib/store/use-rating-store';
import { generateFakeReviews as genFakeReviews } from '@/lib/utils/fake-reviews';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface ReviewsSectionProps {
  mfoId?: string;
  mfoName?: string;
  showAll?: boolean;
}

// Хук для безопасной работы с localStorage (hydration-safe)
function useHydrated() {
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

export function ReviewsSection({ mfoId, mfoName, showAll = false }: ReviewsSectionProps) {
  const isHydrated = useHydrated();
  const reviews = useRatingStore((state) => state.reviews);
  const likeReview = useRatingStore((state) => state.likeReview);

  const [selectedMfo, setSelectedMfo] = React.useState<{ id: string; name: string } | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);

  // Фильтрация отзывов
  const filteredReviews = React.useMemo(() => {
    if (mfoId) {
      return reviews.filter((r) => r.mfoId === mfoId);
    }
    return showAll ? reviews : reviews.slice(0, 6);
  }, [reviews, mfoId, showAll]);

  // Группировка по МФО для выбора
  const mfoGroups = React.useMemo(() => {
    const groups = new Map<string, { id: string; name: string; count: number }>();
    reviews.forEach((r) => {
      const existing = groups.get(r.mfoId);
      if (existing) {
        existing.count++;
      } else {
        groups.set(r.mfoId, { id: r.mfoId, name: r.mfoName, count: 1 });
      }
    });
    return Array.from(groups.values());
  }, [reviews]);

  const handleOpenForm = (mfo?: { id: string; name: string }) => {
    if (mfo) {
      setSelectedMfo(mfo);
    } else if (mfoId && mfoName) {
      setSelectedMfo({ id: mfoId, name: mfoName });
    }
    setIsFormOpen(true);
  };

  // Если hydration не завершена, показываем skeleton
  if (!isHydrated) {
    return (
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-muted rounded-lg" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Отзывы заёмщиков
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredReviews.length} {getReviewsWord(filteredReviews.length)}
            </p>
          </div>

          {!mfoId && mfoGroups.length > 0 && (
            <Button
              onClick={() => handleOpenForm(mfoGroups[0])}
              className="gap-2"
              aria-label="Написать отзыв"
            >
              <MessageSquarePlus className="h-4 w-4" />
              Написать отзыв
            </Button>
          )}

          {mfoId && mfoName && (
            <Button
              onClick={() => handleOpenForm()}
              className="gap-2"
              aria-label={`Написать отзыв о ${mfoName}`}
            >
              <MessageSquarePlus className="h-4 w-4" />
              Написать отзыв
            </Button>
          )}
        </div>

        {/* Empty State */}
        {filteredReviews.length === 0 && (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border bg-muted/30">
            <MessageSquarePlus className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Пока нет отзывов</p>
            {mfoId && mfoName && (
              <Button onClick={() => handleOpenForm()} variant="outline">
                Станьте первым, кто оставит отзыв
              </Button>
            )}
          </div>
        )}

        {/* Reviews Carousel/Grid */}
        {filteredReviews.length > 0 && (
          <>
            {/* Desktop Grid */}
            <div className="hidden lg:grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredReviews.map((review, index) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onLike={() => likeReview(review.id)}
                  index={index}
                />
              ))}
            </div>

            {/* Mobile Carousel */}
            <div className="lg:hidden">
              <Carousel
                opts={{
                  align: 'start',
                  loop: filteredReviews.length > 1,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {filteredReviews.map((review) => (
                    <CarouselItem key={review.id} className="pl-4 basis-full sm:basis-1/2">
                      <ReviewCard
                        review={review}
                        onLike={() => likeReview(review.id)}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {filteredReviews.length > 1 && (
                  <>
                    <CarouselPrevious className="left-0" aria-label="Предыдущий отзыв" />
                    <CarouselNext className="right-0" aria-label="Следующий отзыв" />
                  </>
                )}
              </Carousel>
            </div>
          </>
        )}

        {/* Review Form Dialog */}
        {selectedMfo && (
          <ReviewFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            mfoId={selectedMfo.id}
            mfoName={selectedMfo.name}
          />
        )}
      </div>
    </section>
  );
}

// Компонент карточки отзыва
function ReviewCard({
  review,
  onLike,
  index = 0,
}: {
  review: Review;
  onLike: () => void;
  index?: number;
}) {
  const timeAgo = formatDistanceToNow(new Date(review.createdAt), {
    addSuffix: true,
    locale: ru,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="h-full rounded-2xl border border-border bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium text-foreground">{review.author}</div>
                <div className="text-xs text-muted-foreground">{timeAgo}</div>
              </div>
            </div>
            <StarRating value={review.rating} readonly size="sm" />
          </div>

          {/* MFO Name */}
          <div className="text-sm text-primary font-medium mb-2">
            {review.mfoName}
          </div>

          {/* Quote */}
          <div className="relative mb-3">
            <Quote className="absolute -left-1 -top-1 h-4 w-4 text-muted-foreground/20" />
            <p className="text-sm text-muted-foreground pl-4 line-clamp-4">
              {review.text}
            </p>
          </div>

          {/* Pros & Cons */}
          {(review.pros || review.cons) && (
            <div className="space-y-1.5 mb-3 text-sm">
              {review.pros && (
                <div className="flex items-start gap-2">
                  <span className="text-green-500 shrink-0">+</span>
                  <span className="text-muted-foreground line-clamp-1">{review.pros}</span>
                </div>
              )}
              {review.cons && (
                <div className="flex items-start gap-2">
                  <span className="text-red-500 shrink-0">−</span>
                  <span className="text-muted-foreground line-clamp-1">{review.cons}</span>
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              aria-label="Поставить лайк"
            >
              <ThumbsUp className="h-4 w-4" />
              <span>{review.likes}</span>
            </button>
            {review.isVerified && (
              <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Проверенный отзыв
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Хелпер для склонения слова "отзыв"
function getReviewsWord(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 19) return 'отзывов';
  if (lastOne === 1) return 'отзыв';
  if (lastOne >= 2 && lastOne <= 4) return 'отзыва';
  return 'отзывов';
}
