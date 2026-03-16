/**
 * DynamicContentBlock - Компонент для уникализации контента
 * 
 * Генерирует псевдо-уникальную статистику на основе хэша города.
 * Это помогает избежать Thin Content на 500K+ похожих страницах.
 */

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  Percent,
  Shield,
} from 'lucide-react';

interface DynamicContentBlockProps {
  city: string;
  loanType: string;
  amount: number;
  variationSeed: number; // (citySlug.length * 13) % 100
}

export function DynamicContentBlock({
  city,
  loanType,
  amount,
  variationSeed,
}: DynamicContentBlockProps) {
  // Генерация псевдо-статистики на основе variationSeed
  const stats = generateStats(variationSeed, amount);

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-transparent">
      <CardContent className="py-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Approval Rate */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Одобрение в {city}</span>
            </div>
            <div className="text-2xl font-bold">{stats.approvalRate}%</div>
            <Progress value={stats.approvalRate} className="h-2" />
          </div>

          {/* Average Time */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm">Среднее время</span>
            </div>
            <div className="text-2xl font-bold">{stats.avgTime} мин</div>
            <p className="text-xs text-muted-foreground">до получения денег</p>
          </div>

          {/* Active Borrowers */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm">Заёмщиков сегодня</span>
            </div>
            <div className="text-2xl font-bold">{stats.borrowersToday}</div>
            <p className="text-xs text-muted-foreground">из {city}</p>
          </div>

          {/* Zero Rate Available */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Percent className="h-4 w-4 text-orange-500" />
              <span className="text-sm">Под 0%</span>
            </div>
            <div className="text-2xl font-bold">{stats.zeroRateOffers}</div>
            <p className="text-xs text-muted-foreground">предложений</p>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
          <Badge variant="outline" className="gap-1">
            <Shield className="h-3 w-3" />
            Проверено ЦБ РФ
          </Badge>
          <Badge variant="outline" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            {stats.totalOffers} МФО доступно
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Круглосуточно
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Генерация псевдо-статистики на основе seed
 */
function generateStats(seed: number, amount: number) {
  // Детерминированная генерация на основе seed
  const baseApproval = 75 + (seed % 20); // 75-95%
  const avgTimeBase = 7 + (seed % 10); // 7-17 мин
  const borrowersBase = 50 + (seed * 3) % 200; // 50-250

  // Корректировка на сумму
  const amountMultiplier = amount > 30000 ? 0.9 : 1;

  return {
    approvalRate: Math.round(baseApproval * amountMultiplier),
    avgTime: avgTimeBase,
    borrowersToday: borrowersBase,
    zeroRateOffers: Math.max(2, Math.round(seed / 15)),
    totalOffers: Math.max(5, Math.round(seed / 8) + 5),
  };
}

/**
 * Экспорт функции для использования в других местах
 */
export function generateVariationSeed(citySlug: string): number {
  return (citySlug.length * 13) % 100;
}
