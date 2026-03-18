'use client';

import * as React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 'md',
  showValue = false,
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = React.useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleClick = (rating: number) => {
    if (readonly || !onChange) return;
    onChange(rating);
  };

  const handleMouseEnter = (rating: number) => {
    if (readonly) return;
    setHoverValue(rating);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverValue(0);
  };

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-1">
      <div
        className="flex items-center gap-0.5"
        role={readonly ? 'img' : 'slider'}
        aria-label={`Рейтинг: ${value} из 5`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={5}
        {...(!readonly && { tabIndex: 0 })}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            className={cn(
              'transition-all duration-150',
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm'
            )}
            aria-label={`Оценить ${star} звёзд${star > 1 ? 'ы' : 'а'}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                'transition-colors',
                star <= displayValue
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-transparent text-muted-foreground/30'
              )}
            />
          </button>
        ))}
      </div>
      {showValue && (
        <span className="ml-2 text-sm font-medium text-foreground">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  );
}
