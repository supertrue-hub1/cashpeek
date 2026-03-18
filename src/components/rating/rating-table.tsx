'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, CheckCircle2, ArrowUpDown, Star, TrendingUp, MessageSquare, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RatingCard } from './rating-card';
import { useRatingStore, type MfoRating, type SortOption } from '@/lib/store/use-rating-store';
import { cn } from '@/lib/utils';

interface RatingTableProps {
  mfoList: MfoRating[];
}

const sortOptions: { value: SortOption; label: string; icon: React.ReactNode }[] = [
  { value: 'people', label: 'Народный рейтинг', icon: <Users className="h-4 w-4" /> },
  { value: 'rating', label: 'Наш рейтинг', icon: <Star className="h-4 w-4" /> },
  { value: 'reviews', label: 'По отзывам', icon: <MessageSquare className="h-4 w-4" /> },
  { value: 'approval', label: 'По одобрению', icon: <TrendingUp className="h-4 w-4" /> },
];

export function RatingTable({ mfoList }: RatingTableProps) {
  const {
    sortBy,
    setSortBy,
    showOnlyVerified,
    toggleVerified,
    searchQuery,
    setSearchQuery,
    getMfoPeopleRating,
    getMfoReviews,
  } = useRatingStore();

  const [showFilters, setShowFilters] = React.useState(false);

  // Сортировка и фильтрация
  const filteredAndSortedMfo = React.useMemo(() => {
    let result = [...mfoList];

    // Фильтр по поиску
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (mfo) =>
          mfo.name.toLowerCase().includes(query) ||
          mfo.slug.toLowerCase().includes(query)
      );
    }

    // Фильтр по проверенности
    if (showOnlyVerified) {
      result = result.filter((mfo) => mfo.isVerified);
    }

    // Сортировка
    result.sort((a, b) => {
      switch (sortBy) {
        case 'people': {
          const aPeople = getMfoPeopleRating(a.id) || a.rating;
          const bPeople = getMfoPeopleRating(b.id) || b.rating;
          return bPeople - aPeople;
        }
        case 'rating':
          return b.rating - a.rating;
        case 'reviews': {
          const aReviews = getMfoReviews(a.id).length || a.reviewsCount;
          const bReviews = getMfoReviews(b.id).length || b.reviewsCount;
          return bReviews - aReviews;
        }
        case 'approval':
          return b.approvalRate - a.approvalRate;
        default:
          return 0;
      }
    });

    return result;
  }, [mfoList, sortBy, showOnlyVerified, searchQuery, getMfoPeopleRating, getMfoReviews]);

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Рейтинг МФО
            </h2>
            <p className="text-muted-foreground mt-1">
              {filteredAndSortedMfo.length} организаций
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="sm:w-auto"
            aria-label={showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Фильтры
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden mb-8"
            >
              <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 sm:p-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Поиск по названию..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      aria-label="Поиск МФО"
                    />
                  </div>

                  {/* Sort */}
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={sortBy === option.value ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSortBy(option.value)}
                        className="gap-1.5"
                        aria-pressed={sortBy === option.value}
                        aria-label={`Сортировать по: ${option.label}`}
                      >
                        {option.icon}
                        <span className="hidden sm:inline">{option.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Verified Filter */}
                  <div className="flex items-center">
                    <button
                      onClick={toggleVerified}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg border transition-all',
                        showOnlyVerified
                          ? 'bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400'
                          : 'bg-transparent border-border text-muted-foreground hover:border-primary/30'
                      )}
                      aria-pressed={showOnlyVerified}
                      aria-label={showOnlyVerified ? 'Показать все МФО' : 'Только проверенные МФО'}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="text-sm font-medium">Только проверенные</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MFO List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAndSortedMfo.map((mfo, index) => (
              <motion.div
                key={mfo.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <RatingCard
                  mfo={mfo}
                  rank={index + 1}
                  peopleRating={getMfoPeopleRating(mfo.id)}
                  reviewsCount={getMfoReviews(mfo.id).length}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {filteredAndSortedMfo.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-muted-foreground mb-2">
                МФО не найдены
              </div>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery('');
                  setSortBy('people');
                }}
              >
                Сбросить фильтры
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
