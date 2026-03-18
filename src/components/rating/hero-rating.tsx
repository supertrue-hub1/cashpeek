import { Trophy, Users, Star, TrendingUp } from 'lucide-react';

interface HeroRatingProps {
  totalMfo: number;
  totalReviews: number;
  avgRating: number;
  verifiedMfo: number;
}

export function HeroRating({
  totalMfo,
  totalReviews,
  avgRating,
  verifiedMfo,
}: HeroRatingProps) {
  return (
    <section className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24 relative">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Народный выбор 2025
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Рейтинг МФО по мнению{' '}
            <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
              реальных заёмщиков
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Честные отзывы, реальные оценки и прозрачная методология.
            Выбирайте лучшую МФО на основе опыта других заёмщиков.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              value={totalMfo.toString()}
              label="МФО в рейтинге"
              color="blue"
            />
            <StatCard
              icon={<Star className="h-5 w-5" />}
              value={totalReviews.toString()}
              label="Отзывов"
              color="yellow"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              value={avgRating.toFixed(1)}
              label="Средний балл"
              color="green"
            />
            <StatCard
              icon={<Trophy className="h-5 w-5" />}
              value={verifiedMfo.toString()}
              label="Проверенных"
              color="purple"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// Компонент карточки статистики
function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: 'blue' | 'yellow' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="relative group">
      <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20">
        <div className="flex flex-col items-center text-center">
          <div className={`p-2.5 rounded-xl ${colorClasses[color]} mb-3`}>
            {icon}
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
            {value}
          </div>
          <div className="text-xs sm:text-sm text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}
