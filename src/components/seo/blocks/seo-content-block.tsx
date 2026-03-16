'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Percent, 
  CheckCircle2, 
  Users, 
  TrendingUp,
  Star,
  Zap,
  Shield,
} from 'lucide-react';
import type { SeoStats, SeoTip, SeoFact } from '@/lib/seo/content';

interface SeoStatsBlockProps {
  stats: SeoStats;
  cityName?: string;
  categoryPrepositional?: string;
  className?: string;
}

const iconMap = {
  clock: Clock,
  money: Percent,
  doc: Shield,
  card: CheckCircle2,
  check: CheckCircle2,
};

/**
 * Блок статистики для SEO-страниц
 */
export function SeoStatsBlock({ 
  stats, 
  cityName, 
  categoryPrepositional,
  className 
}: SeoStatsBlockProps) {
  const location = cityName ? ` в ${cityName}` : '';

  return (
    <section className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="bg-gradient-to-br from-muted to-background rounded-2xl border p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">
              Статистика{location}
            </h2>
            <p className="text-muted-foreground">
              Актуальные данные на основе {stats.offersCount} МФО
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="МФО"
              value={stats.offersCount.toString()}
              suffix="организаций"
            />
            <StatCard
              icon={Star}
              label="Рейтинг"
              value={stats.avgRating.toString()}
              suffix="из 5"
            />
            <StatCard
              icon={Percent}
              label="Ставка"
              value={stats.avgRate.toString()}
              suffix="% в день"
            />
            <StatCard
              icon={Zap}
              label="Под 0%"
              value={stats.zeroPercentCount.toString()}
              suffix="МФО"
              highlight
            />
          </div>

          {stats.zeroPercentCount > 0 && (
            <div className="mt-6 text-center">
              <Badge variant="secondary" className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                {stats.zeroPercentCount} МФО предлагают первый займ без процентов
              </Badge>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  suffix, 
  highlight 
}: { 
  icon: React.ElementType;
  label: string;
  value: string;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-background rounded-xl border p-4 text-center">
      <Icon className={`h-5 w-5 mx-auto mb-2 ${highlight ? 'text-green-600 dark:text-green-500' : 'text-primary'}`} />
      <div className={`text-2xl font-bold ${highlight ? 'text-green-600 dark:text-green-500' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{suffix}</div>
    </div>
  );
}

// ============================================

interface SeoTipsBlockProps {
  tips: SeoTip[];
  title?: string;
  className?: string;
}

/**
 * Блок советов для SEO-страниц
 */
export function SeoTipsBlock({ tips, title = 'Советы заёмщикам', className }: SeoTipsBlockProps) {
  return (
    <section className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {tips.map((tip, index) => {
            const Icon = iconMap[tip.icon] || CheckCircle2;
            return (
              <div 
                key={index}
                className="flex gap-4 p-4 bg-muted rounded-xl border hover:border-primary/20 transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ============================================

interface SeoFactsBlockProps {
  facts: SeoFact[];
  title?: string;
  className?: string;
}

/**
 * Блок фактов для SEO-страниц
 */
export function SeoFactsBlock({ facts, title = 'Интересные факты', className }: SeoFactsBlockProps) {
  return (
    <section className={className}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6">{title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {facts.map((fact, index) => (
            <Card key={index}>
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{fact.value}</div>
                <div className="text-sm font-medium text-foreground mb-1">{fact.title}</div>
                <div className="text-xs text-muted-foreground">{fact.description}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================

interface SeoContentBlockProps {
  stats?: SeoStats;
  tips?: SeoTip[];
  facts?: SeoFact[];
  cityName?: string;
  categorySlug?: string;
  className?: string;
}

/**
 * Комбинированный SEO-контент блок
 */
export function SeoContentBlock({
  stats,
  tips,
  facts,
  cityName,
  categorySlug,
  className,
}: SeoContentBlockProps) {
  return (
    <div className={className}>
      {stats && (
        <SeoStatsBlock stats={stats} cityName={cityName} />
      )}
      
      {tips && tips.length > 0 && (
        <SeoTipsBlock tips={tips} className="mt-8" />
      )}
      
      {facts && facts.length > 0 && (
        <SeoFactsBlock facts={facts} className="mt-8" />
      )}
    </div>
  );
}
