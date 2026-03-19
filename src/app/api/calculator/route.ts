import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// ============================================
// Types
// ============================================

interface CalculatorRequest {
  amount: number;
  days: number;
  purpose?: string;
}

interface MFOResult {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  rating: number;
  
  // Займ
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate: number | null;
  psk: number | null;
  
  // Одобрение
  approvalRate: number;
  decisionTime: number;
  
  // Специальные параметры
  firstLoanFree: boolean;
  badCreditOk: boolean;
  noCalls: boolean;
  roundTheClock: boolean;
  
  // Результаты расчёта
  isAvailable: boolean;
  unavailableReason?: string;
  calculatedRate: number;
  totalRepayment: number;
  overpayment: number;
  approvalChance: number;
  smartScore: number;
  
  // Бейджи
  badges: string[];
  
  // Для сравнения
  affiliateUrl: string | null;
}

interface Purpose {
  id: string;
  name: string;
  slug: string;
  icon: string;
  weights: {
    speedWeight: number;
    approvalWeight: number;
    loyaltyWeight: number;
    rateWeight: number;
  };
}

// ============================================
// Цели займов
// ============================================

const PURPOSES: Purpose[] = [
  {
    id: 'debt_refinance',
    name: 'Погашение долгов',
    slug: 'debt_refinance',
    icon: '🔄',
    weights: { speedWeight: 0.15, approvalWeight: 0.25, loyaltyWeight: 0.4, rateWeight: 0.2 },
  },
  {
    id: 'urgent_expenses',
    name: 'Срочные расходы',
    slug: 'urgent_expenses',
    icon: '⚡',
    weights: { speedWeight: 0.5, approvalWeight: 0.3, loyaltyWeight: 0.1, rateWeight: 0.1 },
  },
  {
    id: 'before_payday',
    name: 'До зарплаты',
    slug: 'before_payday',
    icon: '💰',
    weights: { speedWeight: 0.3, approvalWeight: 0.2, loyaltyWeight: 0.2, rateWeight: 0.3 },
  },
  {
    id: 'large_purchase',
    name: 'Крупная покупка',
    slug: 'large_purchase',
    icon: '🛒',
    weights: { speedWeight: 0.1, approvalWeight: 0.2, loyaltyWeight: 0.3, rateWeight: 0.4 },
  },
  {
    id: 'medical',
    name: 'Медицина',
    slug: 'medical',
    icon: '🏥',
    weights: { speedWeight: 0.4, approvalWeight: 0.35, loyaltyWeight: 0.15, rateWeight: 0.1 },
  },
  {
    id: 'education',
    name: 'Обучение',
    slug: 'education',
    icon: '📚',
    weights: { speedWeight: 0.2, approvalWeight: 0.25, loyaltyWeight: 0.25, rateWeight: 0.3 },
  },
];

// ============================================
// Алгоритмы
// ============================================

/**
 * Расчет шанса одобрения
 */
function calculateApprovalChance(
  baseApproval: number,
  amount: number,
  maxAmount: number,
  badCreditOk: boolean
): number {
  // Чем ближе сумма к максимуму, тем ниже шанс
  const ratio = amount / maxAmount;
  const penalty = ratio * 15; // Макс. снижение на 15%
  
  // Бонус за лояльность к КИ
  const bonus = badCreditOk ? 5 : 0;
  
  return Math.max(50, Math.min(99, baseApproval - penalty + bonus));
}

/**
 * Smart Score для сортировки
 */
function calculateSmartScore(
  mfo: {
    decisionTime: number;
    badCreditOk: boolean;
    approvalRate: number;
    firstLoanRate: number | null;
    baseRate: number;
  },
  weights: Purpose['weights'],
  rate: number,
  approval: number
): number {
  // Нормализация скорости (0-1, чем меньше время, тем выше балл)
  const speedScore = Math.max(0, 1 - mfo.decisionTime / 60);
  
  // Лояльность к закредитованности
  const loyaltyScore = mfo.badCreditOk ? 0.8 : 0.5;
  
  // Балл за одобрение (0-1)
  const approvalScore = approval / 100;
  
  // Балл за ставку (0-1, 0% = 1, высокая ставка = низкий балл)
  const rateScore = rate === 0 ? 1 : Math.max(0, 1 - rate / 2);
  
  return (
    speedScore * weights.speedWeight +
    loyaltyScore * weights.loyaltyWeight +
    approvalScore * weights.approvalWeight +
    rateScore * weights.rateWeight
  ) * 100;
}

/**
 * Генерация ИИ-подсказок
 */
function generateSmartTip(
  amount: number,
  days: number,
  results: MFOResult[]
): string {
  const bestFreeLoan = results.find(r => r.firstLoanFree && r.isAvailable);
  
  if (bestFreeLoan) {
    return `💡 ${bestFreeLoan.name} предлагает первый займ под 0%! Вы сэкономите ${amount.toLocaleString('ru-RU')} руб.`;
  }
  
  if (days > 21 && amount < 15000) {
    const saving = Math.round(amount * 0.008 * (days - 14));
    return `💡 При сроке ${days} дней переплата высокая. Рекомендуем взять на 14 дней — сэкономите до ${saving.toLocaleString('ru-RU')} руб.`;
  }
  
  if (amount > 50000) {
    const highApproval = results.filter(r => r.approvalChance >= 85 && r.isAvailable);
    if (highApproval.length > 0) {
      return `💡 При большой сумме рекомендуем выбрать МФО с высоким шансом одобрения (${highApproval[0].name}).`;
    }
  }
  
  if (days <= 7) {
    return `💡 Короткий срок — отличный выбор! Переплата будет минимальной.`;
  }
  
  const avgRate = results.reduce((sum, r) => sum + r.calculatedRate, 0) / results.length;
  if (avgRate > 0.5) {
    return `💡 Совет: выбирайте МФО с первым займом под 0% для максимальной выгоды.`;
  }
  
  return `💡 Сравните предложения и выберите лучшее для вашей ситуации.`;
}

/**
 * Определение уровня риска
 */
function getRiskLevel(
  amount: number,
  days: number,
  approvalChance: number
): { level: 'low' | 'medium' | 'high'; color: string } {
  const riskScore = (amount / 100000) * 0.4 + (days / 30) * 0.3 + ((100 - approvalChance) / 100) * 0.3;
  
  if (riskScore < 0.35) {
    return { level: 'low', color: 'text-green-600' };
  } else if (riskScore < 0.6) {
    return { level: 'medium', color: 'text-yellow-600' };
  } else {
    return { level: 'high', color: 'text-red-600' };
  }
}

/**
 * Расчёт индекса переплаты
 */
function calculateOverpaymentIndex(
  amount: number,
  days: number,
  results: MFOResult[]
): number {
  const validResults = results.filter(r => r.isAvailable && r.calculatedRate > 0);
  if (validResults.length === 0) return 0;
  
  const avgOverpayment = validResults.reduce((sum, r) => sum + r.overpayment, 0) / validResults.length;
  return Math.round((avgOverpayment / amount) * 100);
}

/**
 * Рекомендуемый срок
 */
function getOptimalDays(amount: number): number {
  if (amount <= 5000) return 7;
  if (amount <= 15000) return 14;
  if (amount <= 30000) return 21;
  return 30;
}

/**
 * Потенциальная экономия
 */
function calculatePotentialSaving(
  amount: number,
  days: number,
  results: MFOResult[]
): number {
  const freeLoan = results.find(r => r.firstLoanFree && r.isAvailable);
  if (freeLoan) {
    // Экономия при 0% ставке
    return Math.round(amount * 0.008 * days);
  }
  
  // Разница между худшим и лучшим предложением
  const available = results.filter(r => r.isAvailable && r.calculatedRate > 0);
  if (available.length < 2) return 0;
  
  const rates = available.map(r => r.overpayment);
  const maxOverpayment = Math.max(...rates);
  const minOverpayment = Math.min(...rates);
  
  return maxOverpayment - minOverpayment;
}

// ============================================
// Main Handler
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body: CalculatorRequest = await request.json();
    
    // Валидация
    if (!body.amount || !body.days) {
      return NextResponse.json(
        { success: false, error: 'Не указаны сумма или срок' },
        { status: 400 }
      );
    }
    
    const { amount, days, purpose } = body;
    
    // Получаем веса для цели займа
    const defaultWeights = { speedWeight: 0.25, approvalWeight: 0.25, loyaltyWeight: 0.25, rateWeight: 0.25 };
    const purposeData = purpose 
      ? PURPOSES.find(p => p.slug === purpose) ?? { weights: defaultWeights }
      : { weights: defaultWeights };
    
    // Получаем все опубликованные офферы
    const offers = await db.loanOffer.findMany({
      where: { 
        status: 'published',
        isBroken: false,
      },
      orderBy: { rating: 'desc' },
    });
    
    // Рассчитываем результаты для каждого МФО
    const results: MFOResult[] = offers.map(offer => {
      // Проверяем доступность
      const isAvailable = amount >= offer.minAmount && 
                          amount <= offer.maxAmount && 
                          days >= offer.minTerm && 
                          days <= offer.maxTerm;
      
      // Определяем ставку
      const isFirstLoanZero = offer.firstLoanRate === 0;
      const calculatedRate = isFirstLoanZero ? 0 : offer.baseRate;
      
      // Рассчитываем переплату и сумму к возврату
      const overpayment = calculatedRate === 0 ? 0 : Math.round(amount * (calculatedRate / 100) * days);
      const totalRepayment = amount + overpayment;
      
      // Шанс одобрения
      const approvalChance = calculateApprovalChance(
        offer.approvalRate,
        amount,
        offer.maxAmount,
        offer.badCreditOk
      );
      
      // Smart Score
      const smartScore = calculateSmartScore(
        offer,
        purposeData.weights,
        calculatedRate,
        approvalChance
      );
      
      // Бейджи
      const badges: string[] = [];
      if (isFirstLoanZero) badges.push('0% первый займ');
      if (offer.badCreditOk) badges.push('С плохой КИ');
      if (offer.noCalls) badges.push('Без звонков');
      if (offer.roundTheClock) badges.push('24/7');
      if (offer.decisionTime <= 5) badges.push('Быстрое решение');
      if (offer.approvalRate >= 95) badges.push('Высокое одобрение');
      
      return {
        id: offer.id,
        name: offer.name,
        slug: offer.slug,
        logo: offer.logo,
        rating: offer.rating,
        
        minAmount: offer.minAmount,
        maxAmount: offer.maxAmount,
        minTerm: offer.minTerm,
        maxTerm: offer.maxTerm,
        baseRate: offer.baseRate,
        firstLoanRate: offer.firstLoanRate,
        psk: offer.psk,
        
        approvalRate: offer.approvalRate,
        decisionTime: offer.decisionTime,
        
        firstLoanFree: isFirstLoanZero,
        badCreditOk: offer.badCreditOk,
        noCalls: offer.noCalls,
        roundTheClock: offer.roundTheClock,
        
        isAvailable,
        unavailableReason: !isAvailable 
          ? amount > offer.maxAmount 
            ? 'Сумма превышает лимит' 
            : days > offer.maxTerm 
              ? 'Срок превышает лимит'
              : 'Недоступно'
          : undefined,
        
        calculatedRate,
        totalRepayment,
        overpayment,
        approvalChance,
        smartScore,
        
        badges,
        
        affiliateUrl: offer.affiliateUrl,
      };
    });
    
    // Сортируем по Smart Score (только доступные)
    const sortedResults = results.sort((a, b) => {
      // Сначала доступные
      if (a.isAvailable && !b.isAvailable) return -1;
      if (!a.isAvailable && b.isAvailable) return 1;
      
      // Затем по Smart Score
      return b.smartScore - a.smartScore;
    });
    
    // Средний шанс одобрения для доступных
    const availableResults = sortedResults.filter(r => r.isAvailable);
    const avgApprovalChance = availableResults.length > 0
      ? Math.round(availableResults.reduce((sum, r) => sum + r.approvalChance, 0) / availableResults.length)
      : 70;
    
    const risk = getRiskLevel(amount, days, avgApprovalChance);
    
    // Формируем ответ
    const response = {
      success: true,
      data: {
        results: sortedResults,
        trustScore: {
          approvalChance: avgApprovalChance,
          riskLevel: risk.level,
          riskColor: risk.color,
          recommendation: avgApprovalChance >= 85 
            ? 'Отличный шанс одобрения! Рекомендуем подавать заявку.'
            : avgApprovalChance >= 70 
              ? 'Хороший шанс одобрения. Можно подавать заявку.'
              : 'Средний шанс одобрения. Рассмотрите альтернативы.',
        },
        overpaymentIndex: calculateOverpaymentIndex(amount, days, sortedResults),
        smartTip: generateSmartTip(amount, days, sortedResults),
        optimalDays: getOptimalDays(amount),
        potentialSaving: calculatePotentialSaving(amount, days, sortedResults),
        purposes: PURPOSES.map(p => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          icon: p.icon,
        })),
      },
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[Calculator API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
