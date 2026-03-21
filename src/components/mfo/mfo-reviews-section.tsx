'use client';

import * as React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { ReviewList } from '@/components/reviews';
import { generateFakeReviews, generateReviewStats } from '@/lib/utils/fake-reviews';
import type { Review } from '@/types/offer';

interface MfoReviewsSectionProps {
  mfoId: string;
  mfoName: string;
  mfoRating: number;
}

export function MfoReviewsSection({ mfoId, mfoName, mfoRating }: MfoReviewsSectionProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [stats, setStats] = React.useState({ 
    average: 0, 
    total: 0, 
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } 
  });
  
  React.useEffect(() => {
    // Генерируем отзывы только на клиенте
    const fakeReviews = generateFakeReviews(mfoId, mfoName, 1, 30);
    setReviews(fakeReviews);
    setStats(generateReviewStats(fakeReviews));
  }, [mfoId, mfoName]);
  
  return (
    <div className="bg-muted rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Отзывы клиентов
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Реальные отзывы заёмщиков о {mfoName}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 justify-end">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-bold text-foreground">{stats.average || mfoRating}</span>
          </div>
          <p className="text-sm text-muted-foreground">{stats.total} отзывов</p>
        </div>
      </div>
      
      {/* Rating distribution */}
      {stats.total > 0 && (
        <div className="mb-6 space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.distribution[rating as keyof typeof stats.distribution];
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground w-8">{rating} ★</span>
                <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8">{count}</span>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Reviews list */}
      <ReviewList
        mfoId={mfoId}
        mfoName={mfoName}
        serverReviews={reviews}
        showForm={true}
        showCount={false}
        maxItems={10}
      />
    </div>
  );
}
