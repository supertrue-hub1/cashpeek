'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Star,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  ChevronRight,
  BadgeCheck,
  ThumbsUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { MfoRating } from '@/lib/store/use-rating-store';
import { cn } from '@/lib/utils';

interface RatingCardProps {
  mfo: MfoRating;
  rank: number;
  peopleRating: number;
  reviewsCount: number;
}

export function RatingCard({ mfo, rank, peopleRating, reviewsCount }: RatingCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  // Определяем место в топе
  const isTopThree = rank <= 3;
  const rankColors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-amber-600 to-amber-700',
  };

  // Рейтинг для отображения (народный или базовый)
  const displayRating = peopleRating || mfo.rating;
  const displayReviewsCount = reviewsCount || mfo.reviewsCount;

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Link href={`/mfo/${mfo.slug}`} className="block">
        <div
          className={cn(
            'relative rounded-2xl border bg-card/50 backdrop-blur-sm transition-all duration-300',
            'hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30',
            isTopThree && 'border-primary/20 bg-gradient-to-r from-primary/5 to-transparent'
          )}
        >
          {/* Top Badge */}
          {isTopThree && (
            <div className="absolute -top-3 left-4 z-10">
              <div
                className={cn(
                  'px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg',
                  `bg-gradient-to-r ${rankColors[rank as keyof typeof rankColors]}`
                )}
              >
                #{rank} в рейтинге
              </div>
            </div>
          )}

          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
              {/* Rank Number (Desktop) */}
              <div className="hidden lg:flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 shrink-0">
                <span className="text-2xl font-bold text-muted-foreground">
                  {rank}
                </span>
              </div>

              {/* Logo */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl border border-border bg-white flex items-center justify-center overflow-hidden">
                  {mfo.logo ? (
                    <img
                      src={mfo.logo}
                      alt={mfo.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-xl font-bold text-muted-foreground">
                      {mfo.name.charAt(0)}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-foreground truncate">
                    {mfo.name}
                  </h3>
                  {mfo.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-green-500 shrink-0" />
                  )}
                  {mfo.isPopular && (
                    <Badge variant="secondary" className="text-xs shrink-0">
                      Популярное
                    </Badge>
                  )}
                </div>

                  {/* Quick Stats */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {mfo.minAmount.toLocaleString('ru-RU')} – {mfo.maxAmount.toLocaleString('ru-RU')} ₽
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">
                      {mfo.minTerm}–{mfo.maxTerm} дней
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">
                      от {(mfo.firstLoanRate ?? mfo.baseRate)}% в день
                    </span>
                  </div>

                  {/* Mobile Rating */}
                  <div className="flex items-center gap-4 mt-3 lg:hidden">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">
                        {displayRating.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {displayReviewsCount} отзывов
                    </div>
                  </div>
              </div>

              {/* Stats Grid (Desktop) */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-6 shrink-0">
                {/* People Rating */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-xl font-bold text-foreground">
                      {displayRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Народный рейтинг</div>
                </div>

                {/* Reviews */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-xl font-bold text-foreground">
                      {displayReviewsCount}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Отзывов</div>
                </div>

                {/* Approval Rate */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xl font-bold text-foreground">
                      {mfo.approvalRate}%
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Одобрение</div>
                </div>

                {/* Decision Time */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-xl font-bold text-foreground">
                      {mfo.avgDecisionTime === 0 ? 'Мгновенно' : `${mfo.avgDecisionTime} мин`}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">Решение</div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 lg:shrink-0">
                <motion.div
                  animate={{ x: isHovered ? 4 : 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Button
                    className="gap-2 rounded-xl"
                    aria-label={`Подробнее о ${mfo.name}`}
                  >
                    Подробнее
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              </div>
            </div>

            {/* Progress Bar (Visual indicator) */}
            {isTopThree && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Рекомендуют</span>
                  <span className="font-medium text-foreground">
                    {Math.round(displayRating * 20)}%
                  </span>
                </div>
                <Progress value={displayRating * 20} className="h-2" />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
