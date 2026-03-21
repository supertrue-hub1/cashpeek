'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, CheckCircle, MoreVertical, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Review } from '@/types/offer';
import { useReviews } from '@/lib/store/use-review-store';

// ============================================
// Star Rating Display
// ============================================

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md';
}

function StarRating({ rating, size = 'sm' }: StarRatingProps) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-transparent text-muted-foreground/30'
          )}
        />
      ))}
    </div>
  );
}

// ============================================
// Review Card Component
// ============================================

interface ReviewCardProps {
  review: Review;
  showActions?: boolean;
  onDelete?: (reviewId: string) => void;
  animate?: boolean;
}

export function ReviewCard({ 
  review, 
  showActions = true,
  onDelete,
  animate = true 
}: ReviewCardProps) {
  const { likeReview, unlikeReview } = useReviews();
  const [isLiked, setIsLiked] = React.useState(
    review.likedBy?.includes('anonymous') ?? false
  );
  const [helpfulCount, setHelpfulCount] = React.useState(review.helpful);
  
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
  
  const handleLike = () => {
    if (isLiked) {
      unlikeReview(review.id);
      setHelpfulCount((prev) => Math.max(0, prev - 1));
    } else {
      likeReview(review.id);
      setHelpfulCount((prev) => prev + 1);
    }
    setIsLiked(!isLiked);
  };
  
  const cardContent = (
    <div className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {review.author}
              </span>
              {review.verified && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Проверен
                </Badge>
              )}
              {review.source === 'local' && (
                <Badge 
                  variant="outline" 
                  className="text-xs text-muted-foreground"
                >
                  Новый
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">
                {formattedDate}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions menu */}
        {showActions && review.source === 'local' && onDelete && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(review.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Удалить отзыв
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Review text */}
      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
        {review.text}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-8 gap-1.5 text-muted-foreground hover:text-foreground',
            isLiked && 'text-primary hover:text-primary'
          )}
          onClick={handleLike}
        >
          <ThumbsUp className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
          <span className="text-xs">
            Полезно{helpfulCount > 0 && ` (${helpfulCount})`}
          </span>
        </Button>
        
        {review.source === 'server' && (
          <span className="text-xs text-muted-foreground/50">
            с сервера
          </span>
        )}
      </div>
    </div>
  );
  
  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        layout
      >
        {cardContent}
      </motion.div>
    );
  }
  
  return cardContent;
}
