'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialRadarProps {
  amount: number;
  maxAmount?: number;
  riskLevel: 'low' | 'medium' | 'high';
  approvalChance: number;
}

const riskColors = {
  low: {
    bg: 'from-green-50 to-emerald-100 dark:from-green-950/30 dark:to-emerald-900/20',
    border: 'border-green-300 dark:border-green-800',
    text: 'text-green-700 dark:text-green-400',
    ring: 'ring-green-400',
    gradient: ['#22c55e', '#10b981', '#059669'],
  },
  medium: {
    bg: 'from-yellow-50 to-amber-100 dark:from-yellow-950/30 dark:to-amber-900/20',
    border: 'border-yellow-300 dark:border-yellow-800',
    text: 'text-yellow-700 dark:text-yellow-400',
    ring: 'ring-yellow-400',
    gradient: ['#eab308', '#f59e0b', '#d97706'],
  },
  high: {
    bg: 'from-red-50 to-rose-100 dark:from-red-950/30 dark:to-rose-900/20',
    border: 'border-red-300 dark:border-red-800',
    text: 'text-red-700 dark:text-red-400',
    ring: 'ring-red-400',
    gradient: ['#ef4444', '#f43f5e', '#dc2626'],
  },
};

export function FinancialRadar({
  amount,
  maxAmount = 100000,
  riskLevel,
  approvalChance,
}: FinancialRadarProps) {
  const colors = riskColors[riskLevel];
  const percentage = Math.min((amount / maxAmount) * 100, 100);
  
  // Определяем уровень риска текстом
  const riskLabel = {
    low: 'Низкий риск',
    medium: 'Средний риск',
    high: 'Высокий риск',
  }[riskLevel];
  
  const riskIcon = {
    low: CheckCircle2,
    medium: AlertTriangle,
    high: AlertTriangle,
  }[riskLevel];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'relative h-56 rounded-2xl overflow-hidden',
        'bg-gradient-to-br backdrop-blur-xl border',
        colors.bg,
        colors.border
      )}
    >
      {/* Радарные круги */}
      <div className="absolute inset-0 flex items-center justify-center">
        {[100, 75, 50, 25].map((size, i) => (
          <motion.div
            key={size}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className={cn(
              'absolute rounded-full border-2',
              riskLevel === 'low' && 'border-green-400/30',
              riskLevel === 'medium' && 'border-yellow-400/30',
              riskLevel === 'high' && 'border-red-400/30'
            )}
            style={{
              width: `${size}%`,
              height: `${size}%`,
            }}
          />
        ))}
      </div>

      {/* Пульсирующий центр */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={cn(
            'w-24 h-24 rounded-full',
            riskLevel === 'low' && 'bg-green-400/20',
            riskLevel === 'medium' && 'bg-yellow-400/20',
            riskLevel === 'high' && 'bg-red-400/20'
          )}
        />
      </div>

      {/* Центральный индикатор суммы */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <div className="text-4xl font-bold text-foreground mb-1">
            {amount.toLocaleString('ru-RU')} ₽
          </div>
          <div className="text-sm text-muted-foreground">
            Сумма займа
          </div>
        </motion.div>
      </div>

      {/* Бейдж уровня риска */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4"
      >
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
          'border shadow-sm',
          colors.border
        )}>
          {React.createElement(riskIcon, { className: cn('h-4 w-4', colors.text) })}
          <span className={cn('text-sm font-medium', colors.text)}>
            {riskLabel}
          </span>
        </div>
      </motion.div>

      {/* Шанс одобрения */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="absolute top-4 left-4"
      >
        <div className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
          'border shadow-sm'
        )}>
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {approvalChance}% одобрение
          </span>
        </div>
      </motion.div>

      {/* Прогресс-бар внизу */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-2 bg-white/50 dark:bg-gray-800/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
            className={cn(
              'h-full rounded-full',
              riskLevel === 'low' && 'bg-gradient-to-r from-green-400 to-emerald-500',
              riskLevel === 'medium' && 'bg-gradient-to-r from-yellow-400 to-amber-500',
              riskLevel === 'high' && 'bg-gradient-to-r from-red-400 to-rose-500'
            )}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>0 ₽</span>
          <span>{maxAmount.toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
    </motion.div>
  );
}
