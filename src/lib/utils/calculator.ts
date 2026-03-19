/**
 * Калькулятор займов
 * Расчёт итоговой суммы, переплаты и даты возврата
 */

import { z } from 'zod';

// ============================================
// Типы и схемы валидации
// ============================================

export const CalculatorInputSchema = z.object({
  amount: z.number().min(100).max(1000000),
  term: z.number().min(1).max(365),
  dailyRate: z.number().min(0).max(100),
  isFirstLoanZero: z.boolean().optional().default(false),
  isNewClient: z.boolean().optional().default(true),
});

export type CalculatorInput = z.infer<typeof CalculatorInputSchema>;

export interface CalculatorResult {
  /** Сумма к возврату */
  totalRepayment: number;
  /** Переплата (проценты) */
  overpayment: number;
  /** Дата возврата */
  dueDate: Date;
  /** Дата возврата в формате строки */
  dueDateFormatted: string;
  /** Эффективная дневная ставка (%) */
  effectiveRate: number;
  /** Эффективная годовая ставка (%) */
  effectiveAnnualRate: number;
  /** Полная стоимость займа (ПСК) в % годовых */
  psk: number;
  /** Применимая ставка (0% для новых клиентов, если доступно) */
  appliedRate: number;
  /** Флаг: бесплатный займ */
  isFree: boolean;
}

// ============================================
// Константы
// ============================================

/** Количество дней в году для расчёта ПСК */
const DAYS_IN_YEAR = 365;

/** Максимальная ставка по закону РФ (0.8% в день) */
const MAX_DAILY_RATE = 0.8;

// ============================================
// Основная функция расчёта
// ============================================

/**
 * Рассчитывает параметры займа
 * 
 * @param input - входные параметры
 * @returns результат расчёта
 * 
 * @example
 * const result = calculateLoan({
 *   amount: 10000,
 *   term: 14,
 *   dailyRate: 0.4,
 *   isFirstLoanZero: true,
 *   isNewClient: true,
 * });
 * // result.totalRepayment = 10000 (0% для нового клиента)
 * // result.overpayment = 0
 */
export function calculateLoan(input: CalculatorInput): CalculatorResult {
  // Валидация
  const validated = CalculatorInputSchema.parse(input);
  
  const {
    amount,
    term,
    dailyRate,
    isFirstLoanZero,
    isNewClient,
  } = validated;

  // Определяем применимую ставку
  const isFree = isFirstLoanZero && isNewClient;
  const appliedRate = isFree ? 0 : dailyRate;
  
  // Ограничиваем ставку по закону
  const effectiveRate = Math.min(appliedRate, MAX_DAILY_RATE);
  
  // Расчёт переплаты: Amount * Rate * Days
  // Для 0% переплата = 0
  const overpayment = isFree ? 0 : Math.round(amount * (effectiveRate / 100) * term);
  
  // Сумма к возврату
  const totalRepayment = amount + overpayment;
  
  // Дата возврата
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + term);
  
  // Эффективная годовая ставка (простой процент)
  const effectiveAnnualRate = effectiveRate * DAYS_IN_YEAR;
  
  // ПСК (упрощённая формула)
  // ПСК = (Overpayment / Amount) * (DAYS_IN_YEAR / Term) * 100
  const psk = overpayment > 0 
    ? (overpayment / amount) * (DAYS_IN_YEAR / term) * 100 
    : 0;

  return {
    totalRepayment,
    overpayment,
    dueDate,
    dueDateFormatted: formatDate(dueDate),
    effectiveRate,
    effectiveAnnualRate,
    psk,
    appliedRate: effectiveRate,
    isFree,
  };
}

// ============================================
// Вспомогательные функции
// ============================================

/**
 * Форматирует дату в читаемый вид
 * "15 января 2025"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Форматирует число как валюту
 * "15 000 ₽"
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Форматирует число с разделителями
 * "15 000"
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

/**
 * Парсит строку с суммой в число
 * "15 000" → 15000
 */
export function parseAmount(value: string): number {
  const cleaned = value.replace(/[^\d]/g, '');
  return parseInt(cleaned, 10) || 0;
}

/**
 * Возвращает склонение слова "день"
 * 1 день, 2 дня, 5 дней
 */
export function getDaysWord(days: number): string {
  const lastTwo = Math.abs(days) % 100;
  const lastOne = lastTwo % 10;
  
  if (lastTwo > 10 && lastTwo < 20) return 'дней';
  if (lastOne === 1) return 'день';
  if (lastOne >= 2 && lastOne <= 4) return 'дня';
  return 'дней';
}

/**
 * Форматирует срок займа
 * "14 дней"
 */
export function formatTerm(days: number): string {
  return `${days} ${getDaysWord(days)}`;
}

/**
 * Генерирует массив предустановленных сумм
 */
export function getPresetAmounts(
  min: number,
  max: number,
  count: number = 5
): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => 
    Math.round(min + step * i)
  );
}

/**
 * Генерирует массив предустановленных сроков
 */
export function getPresetTerms(
  min: number,
  max: number
): number[] {
  // Стандартные сроки: 7, 14, 21, 30 дней
  const standard = [7, 14, 21, 30];
  return standard.filter(term => term >= min && term <= max);
}

// ============================================
// Валидация границ
// ============================================

/**
 * Ограничивает значение в пределах min-max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Проверяет, валидны ли параметры займа
 */
export function validateLoanParams(
  amount: number,
  term: number,
  minAmount: number,
  maxAmount: number,
  minTerm: number,
  maxTerm: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (amount < minAmount) {
    errors.push(`Минимальная сумма: ${formatCurrency(minAmount)}`);
  }
  if (amount > maxAmount) {
    errors.push(`Максимальная сумма: ${formatCurrency(maxAmount)}`);
  }
  if (term < minTerm) {
    errors.push(`Минимальный срок: ${formatTerm(minTerm)}`);
  }
  if (term > maxTerm) {
    errors.push(`Максимальный срок: ${formatTerm(maxTerm)}`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
