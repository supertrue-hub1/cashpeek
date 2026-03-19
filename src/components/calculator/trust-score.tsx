'use client';

import * as React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrustScoreProps {
  approvalChance: number;
  riskColor: string;
  recommendation: string;
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 50, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));
  
  React.useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  
  return (
    <motion.span className="tabular-nums">
      {display}
    </motion.span>
  );
}

export function TrustScore({
  approvalChance,
  riskColor,
  recommendation,
}: TrustScoreProps) {
  // Определяем тренд
  const trend = approvalChance >= 85 ? 'up' : approvalChance >= 70 ? 'stable' : 'down';
  
  const trendConfig = {
    up: { icon: TrendingUp, color: 'text-green-500', label: 'Высокий шанс' },
    stable: { icon: Minus, color: 'text-yellow-500', label: 'Средний шанс' },
    down: { icon: TrendingDown, color: 'text-red-500', label: 'Низкий шанс' },
  };
  
  const config = trendConfig[trend];
  const TrendIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl border p-6 shadow-sm"
    >
      {/* Заголовок */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Индекс доверия</h3>
          <p className="text-xs text-muted-foreground">Прогноз одобрения</p>
        </div>
      </div>

      {/* Большое число */}
      <div className="text-center py-6">
        <div className="relative inline-flex items-center justify-center">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Фоновый круг */}
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            {/* Прогресс круг */}
            <motion.circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              initial={{ strokeDasharray: '0 352' }}
              animate={{ strokeDasharray: `${(approvalChance / 100) * 352} 352` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">
              <AnimatedNumber value={approvalChance} />
            </span>
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
      </div>

      {/* Тренд и статус */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <TrendIcon className={cn('h-4 w-4', config.color)} />
        <span className={cn('text-sm font-medium', config.color)}>
          {config.label}
        </span>
      </div>

      {/* Рекомендация */}
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <p className="text-sm text-muted-foreground">
          {recommendation}
        </p>
      </div>
    </motion.div>
  );
}
