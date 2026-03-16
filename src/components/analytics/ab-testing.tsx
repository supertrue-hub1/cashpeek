/**
 * A/B Testing / Split Testing
 * 
 * Позволяет тестировать разные варианты страниц:
 * - Разные заголовки
 * - Разные CTA
 * - Разные макеты
 * - Разные цвета
 * 
 * Интеграция с GA4 и Яндекс.Метрикой для отслеживания конверсий
 */

'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { event } from './ga4';
import { reachGoal } from './yandex-metrika';

// ============================================
// Types
// ============================================

interface Experiment {
  id: string;
  name: string;
  variants: string[];
  defaultVariant?: string;
}

interface ExperimentContextValue {
  experiments: Record<string, string>; // experimentId -> variant
  getVariant: (experimentId: string) => string | null;
  trackConversion: (experimentId: string, goalName: string) => void;
}

const ExperimentContext = createContext<ExperimentContextValue | null>(null);

// ============================================
// Experiments Config
// ============================================

export const EXPERIMENTS: Record<string, Experiment> = {
  // Главная страница -Hero заголовок
  'home-hero-title': {
    name: 'Hero заголовок на главной',
    variants: ['control', 'variant-b', 'variant-c'],
    defaultVariant: 'control',
  },
  
  // CTA кнопка на главной
  'home-cta-button': {
    name: 'CTA кнопка на главной',
    variants: ['control', 'variant-b'],
    defaultVariant: 'control',
  },
  
  // Hub страница - макет
  'hub-layout': {
    name: 'Макет hub-страницы',
    variants: ['control', 'variant-b'],
    defaultVariant: 'control',
  },
  
  // Сравнение - таблица vs карточки
  'compare-view': {
    name: 'Вид сравнения',
    variants: ['table', 'cards'],
    defaultVariant: 'table',
  },
  
  // Оффер - кнопка
  'offer-button': {
    name: 'Кнопка оформления',
    variants: ['control', 'variant-b'],
    defaultVariant: 'control',
  },
};

// ============================================
// Storage
// ============================================

const STORAGE_KEY = 'cashpeek_experiments';

function getStoredExperiments(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveExperiment(experimentId: string, variant: string) {
  if (typeof window === 'undefined') return;
  
  const experiments = getStoredExperiments();
  experiments[experimentId] = variant;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(experiments));
}

// ============================================
// Helper Functions
// ============================================

/**
 * Получить вариант для эксперимента
 * Использует простой hash для распределения
 */
function getRandomVariant(experiment: Experiment): string {
  const stored = getStoredExperiments();
  
  // Если уже есть вариант, используем его
  if (stored[experiment.id]) {
    return stored[experiment.id];
  }
  
  // Новый пользователь - случайное распределение
  const hash = Math.random();
  const variantIndex = Math.floor(hash * experiment.variants.length);
  const variant = experiment.variants[variantIndex];
  
  // Сохраняем
  saveExperiment(experiment.id, variant);
  
  // Отправляем событие в аналитику
  trackExperimentImpression(experiment.id, variant);
  
  return variant;
}

/**
 * Отслеживание показа варианта
 */
function trackExperimentImpression(experimentId: string, variant: string) {
  // GA4
  event({
    action: 'experiment_impression',
    category: 'ab_test',
    label: `${experimentId}:${variant}`,
  });
  
  // Яндекс.Метрика
  reachGoal('EXPERIMENT_IMPRESSION', { experimentId, variant });
}

/**
 * Отслеживание конверсии
 */
function trackConversion(experimentId: string, goalName: string) {
  const variant = getStoredExperiments()[experimentId];
  
  if (!variant) return;
  
  // GA4
  event({
    action: 'experiment_conversion',
    category: 'ab_test',
    label: `${experimentId}:${variant}:${goalName}`,
  });
  
  // Яндекс.Метрика
  reachGoal('EXPERIMENT_CONVERSION', { experimentId, variant, goalName });
}

// ============================================
// React Hook
// ============================================

/**
 * Хук для работы с A/B тестом
 */
export function useExperiment(experimentId: string): string | null {
  const [variant, setVariant] = useState<string | null>(null);
  
  useEffect(() => {
    const experiment = EXPERIMENTS[experimentId];
    if (!experiment) {
      console.warn(`[AB] Experiment ${experimentId} not found`);
      return;
    }
    
    const assignedVariant = getRandomVariant(experiment);
    setVariant(assignedVariant);
  }, [experimentId]);
  
  return variant;
}

/**
 * Хук для отслеживания конверсий в эксперименте
 */
export function useExperimentConversion(experimentId: string) {
  return (goalName: string) => {
    trackConversion(experimentId, goalName);
  };
}

// ============================================
// Context Provider
// ============================================

export function ExperimentProvider({ children }: { children: React.ReactNode }) {
  const [experiments, setExperiments] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Инициализируем все эксперименты
    const initialized: Record<string, string> = {};
    
    Object.keys(EXPERIMENTS).forEach(experimentId => {
      const experiment = EXPERIMENTS[experimentId];
      initialized[experimentId] = getRandomVariant(experiment);
    });
    
    setExperiments(initialized);
  }, []);
  
  const getVariant = (experimentId: string): string | null => {
    return experiments[experimentId] || null;
  };
  
  const trackConv = (experimentId: string, goalName: string) => {
    trackConversion(experimentId, goalName);
  };
  
  return (
    <ExperimentContext.Provider value={{ experiments, getVariant, trackConversion: trackConv }}>
      {children}
    </ExperimentContext.Provider>
  );
}

/**
 * Хук для использования контекста экспериментов
 */
export function useExperiments() {
  const context = useContext(ExperimentContext);
  if (!context) {
    throw new Error('useExperiments must be used within ExperimentProvider');
  }
  return context;
}

// ============================================
// Component: Variant Renderer
// ============================================

interface VariantRendererProps {
  experimentId: string;
  variants: {
    [key: string]: React.ReactNode;
  };
  fallback?: React.ReactNode;
}

export function VariantRenderer({ experimentId, variants, fallback = null }: VariantRendererProps) {
  const variant = useExperiment(experimentId);
  
  if (!variant || !variants[variant]) {
    return <>{fallback}</>;
  }
  
  return <>{variants[variant]}</>;
}

// ============================================
// Example Usage
// ============================================

/*
// В компоненте:
function HeroSection() {
  const variant = useExperiment('home-hero-title');
  
  const titles = {
    control: 'Сравните займы и выберите лучшее',
    'variant-b': 'Найдите займ за 5 минут',
    'variant-c': 'Лучшие займы в одном месте',
  };
  
  return (
    <h1>{titles[variant || 'control']}</h1>
  );
}

// Или с VariantRenderer:
function HeroSection() {
  return (
    <VariantRenderer
      experimentId="home-hero-title"
      variants={{
        control: <h1>Сравните займы и выберите лучшее</h1>,
        'variant-b': <h1>Найдите займ за 5 минут</h1>,
        'variant-c': <h1>Лучшие займы в одном месте</h1>,
      }}
    />
  );
}
*/
