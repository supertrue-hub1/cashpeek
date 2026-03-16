/**
 * Блок статистики для города
 * Anti-Thin Content: детерминированная псевдо-статистика
 */

'use client';

import { TrendingUp, Users, Clock, CreditCard, MapPin } from 'lucide-react';

interface CityStatsProps {
  cityName: string;
  citySlug: string;
}

// Детерминированная статистика на основе seed от города
function getCityStats(citySlug: string) {
  // Используем slug как seed для детерминированных значений
  const seed = citySlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (mod: number) => (seed * 9301 + 49297) % 233280 % mod;
  
  return {
    activeLoans: 15 + random(20),
    avgAmount: 8000 + random(15000),
    avgTerm: 10 + random(20),
    approvalRate: 85 + random(12),
    avgTime: random(15),
  };
}

// Популярные суммы в городе
function getPopularAmounts(citySlug: string) {
  const seed = citySlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (mod: number) => (seed * 9301 + 49297) % 233280 % mod;
  
  const amounts = [1000, 3000, 5000, 10000, 15000, 20000, 30000];
  // Копируем массив перед сортировкой и используем детерминированный seed
  return [...amounts].sort((a, b) => {
    const aScore = (a * seed) % 233280;
    const bScore = (b * seed) % 233280;
    return aScore - bScore;
  }).slice(0, 4);
}

// Популярные сроки
function getPopularTerms(citySlug: string) {
  const seed = citySlug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const terms = [
    { days: 7, label: '7 дней' },
    { days: 14, label: '2 недели' },
    { days: 30, label: '1 месяц' },
    { days: 60, label: '2 месяца' },
  ];
  // Копируем массив перед сортировкой и используем детерминированный seed
  return [...terms].sort((a, b) => {
    const aScore = (a.days * seed) % 233280;
    const bScore = (b.days * seed) % 233280;
    return aScore - bScore;
  }).slice(0, 3);
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subValue?: string;
}

function StatCard({ icon, label, value, subValue }: StatCardProps) {
  return (
    <div className="bg-background rounded-xl border p-4 flex items-start gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-xl font-bold text-foreground">{value}</div>
        {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
      </div>
    </div>
  );
}

export function CityStats({ cityName, citySlug }: CityStatsProps) {
  const stats = getCityStats(citySlug);
  const popularAmounts = getPopularAmounts(citySlug);
  const popularTerms = getPopularTerms(citySlug);
  
  return (
    <section className="py-8 border-t bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Статистика займов в {cityName}
        </h2>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Активных займов"
            value={stats.activeLoans}
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            label="Средняя сумма"
            value={`${stats.avgAmount.toLocaleString()} ₽`}
          />
          <StatCard
            icon={<Clock className="h-5 w-5" />}
            label="Средний срок"
            value={`${stats.avgTerm} дней`}
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Одобрение"
            value={`${stats.approvalRate}%`}
          />
        </div>
        
        {/* Popular Choices */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Popular Amounts */}
          <div className="bg-background rounded-xl border p-5">
            <h3 className="font-semibold text-foreground mb-3">Популярные суммы</h3>
            <div className="flex flex-wrap gap-2">
              {popularAmounts.map((amount) => (
                <a
                  key={amount}
                  href={`/zaimy/do-${amount}-rublei/v-${citySlug}`}
                  className="px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  до {amount.toLocaleString()} ₽
                </a>
              ))}
            </div>
          </div>
          
          {/* Popular Terms */}
          <div className="bg-background rounded-xl border p-5">
            <h3 className="font-semibold text-foreground mb-3">Популярные сроки</h3>
            <div className="flex flex-wrap gap-2">
              {popularTerms.map((term) => (
                <a
                  key={term.days}
                  href={`/zaimy/v-${citySlug}?term=${term.days}`}
                  className="px-3 py-1.5 bg-muted rounded-lg text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {term.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-6 text-center">
          * Статистика основана на усредненных данных и может отличаться от реальных показателей
        </p>
      </div>
    </section>
  );
}
