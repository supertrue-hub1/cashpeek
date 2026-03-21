'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ReviewList } from '@/components/reviews';
import { generateFakeReviews } from '@/lib/utils/fake-reviews';
import type { Review } from '@/types/offer';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface FakeReviewsSectionProps {
  showAll?: boolean;
  mfoList?: Array<{ id: string; name: string }>;
}

// МФО для генерации отзывов
const DEFAULT_MFOS = [
  { id: '1', name: 'Займер' },
  { id: '2', name: 'MoneyMan' },
  { id: '3', name: 'еКапуста' },
  { id: '4', name: 'Турбозайм' },
  { id: '5', name: 'Moneza' },
  { id: '6', name: 'Webbankir' },
  { id: '7', name: 'До зарплаты' },
  { id: '8', name: 'Lime' },
];

export function FakeReviewsSection({ showAll = false, mfoList = DEFAULT_MFOS }: FakeReviewsSectionProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [selectedMfo, setSelectedMfo] = React.useState<{ id: string; name: string } | null>(null);
  
  // Генерируем отзывы при монтировании
  React.useEffect(() => {
    const allReviews: Review[] = [];
    
    // Генерируем по 3-8 отзывов для каждого МФО
    mfoList.forEach((mfo) => {
      const mfoReviews = generateFakeReviews(mfo.id, mfo.name, 3, 8);
      allReviews.push(...mfoReviews);
    });
    
    // Сортируем по дате (новые первыми)
    allReviews.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    setReviews(allReviews);
  }, [mfoList]);
  
  const displayReviews = showAll ? reviews : reviews.slice(0, 12);
  
  // Группировка по МФО
  const mfoGroups = React.useMemo(() => {
    const groups = new Map<string, { id: string; name: string; count: number }>();
    reviews.forEach((r) => {
      const existing = groups.get(r.offerId);
      if (existing) {
        existing.count++;
      } else {
        groups.set(r.offerId, { id: r.offerId, name: r.offerId, count: 1 });
      }
    });
    return Array.from(groups.values());
  }, [reviews]);
  
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Отзывы заёмщиков
          </h2>
          <p className="text-muted-foreground">
            {reviews.length} {getReviewsWord(reviews.length)} от реальных клиентов
          </p>
        </div>
        
        {/* Reviews Grid */}
        {displayReviews.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {displayReviews.map((review, index) => (
              <ReviewCardInline
                key={review.id}
                review={review}
                index={index}
              />
            ))}
          </div>
        )}
        
        {/* Show More */}
        {!showAll && reviews.length > 12 && (
          <div className="text-center">
            <Button variant="outline" size="lg">
              Показать все отзывы ({reviews.length})
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

// Карточка отзыва (inline версия)
function ReviewCardInline({ review, index }: { review: Review; index: number }) {
  const formattedDate = React.useMemo(() => {
    try {
      return format(new Date(review.date), 'd MMMM yyyy', { locale: ru });
    } catch {
      return review.date;
    }
  }, [review.date]);
  
  const initials = review.author
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-medium text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground text-sm">
                  {review.author}
                </span>
                {review.verified && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                    Проверен
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-3 w-3',
                        star <= review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-transparent text-muted-foreground/30'
                      )}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {/* Text */}
          <p className="text-sm text-muted-foreground line-clamp-4 mb-3">
            {review.text}
          </p>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{review.helpful}</span>
            </button>
            <span className="text-xs text-muted-foreground/50">
              {review.source === 'local' ? 'Новый' : 'МФО'}
            </span>
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
