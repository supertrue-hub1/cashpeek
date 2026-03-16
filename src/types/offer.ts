// Типы данных для офферов МФО

export interface Offer {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number; // 1-5
  
  // Условия займа
  minAmount: number; // минимальная сумма в рублях
  maxAmount: number; // максимальная сумма
  minTerm: number; // минимальный срок в днях
  maxTerm: number; // максимальный срок
  
  // Ставки
  baseRate: number; // базовая ставка в % в день
  firstLoanRate?: number; // ставка для первого займа (0 = бесплатно)
  
  // Решение
  decisionTime: number; // время решения в минутах (0 = мгновенно)
  approvalRate: number; // процент одобрения (примерный)
  
  // Способы получения
  payoutMethods: PayoutMethod[];
  
  // Особенности
  features: OfferFeature[];
  badCreditOk: boolean; // одобряют с плохой КИ
  noCalls: boolean; // без звонков
  roundTheClock: boolean; // работает ночью
  
  // Требования
  minAge: number;
  documents: DocumentRequirement[];
  
  // Редакционный комментарий
  editorNote?: string;
  
  // Партнёрская ссылка
  affiliateUrl: string;
  
  // Метки
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
  
  // Для мобильных карточек
  affiliateLink?: string;
}

export type PayoutMethod = 
  | 'card' 
  | 'cash' 
  | 'bank_account' 
  | 'yoomoney' 
  | 'qiwi' 
  | 'contact'
  | 'golden_crown';

export type OfferFeature = 
  | 'first_loan_zero' 
  | 'no_overpayments' 
  | 'prolongation' 
  | 'early_repayment'
  | 'no_hidden_fees'
  | 'online_approval'
  | 'one_document'
  | 'loyalty_program';

export type DocumentRequirement = 
  | 'passport' 
  | 'inn' 
  | 'snils' 
  | 'driver_license';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  filter: Partial<OfferFilter>;
}

export interface OfferFilter {
  badCreditOk?: boolean;
  noCalls?: boolean;
  roundTheClock?: boolean;
  firstLoanZero?: boolean;
  payoutMethod?: PayoutMethod;
  maxDecisionTime?: number;
}

// Состояние формы быстрого подбора (Hero)
export interface QuickFilterState {
  amount: number;       // Желаемая сумма
  term: number;         // Желаемый срок в днях
  payoutMethod: string; // Способ получения
  firstLoanZero: boolean;
  urgent: boolean;
  noCalls: boolean;
  badCreditOk: boolean;
}

// Функция фильтрации офферов
export function filterOffers(
  offers: Offer[],
  filters: Partial<QuickFilterState>
): Offer[] {
  return offers.filter((offer) => {
    // Проверка суммы
    if (filters.amount !== undefined) {
      if (filters.amount < offer.minAmount || filters.amount > offer.maxAmount) {
        return false;
      }
    }

    // Проверка срока
    if (filters.term !== undefined) {
      if (filters.term < offer.minTerm || filters.term > offer.maxTerm) {
        return false;
      }
    }

    // Проверка способа получения
    if (filters.payoutMethod && filters.payoutMethod !== 'card') {
      if (!offer.payoutMethods.includes(filters.payoutMethod as PayoutMethod)) {
        return false;
      }
    }

    // Первый займ под 0%
    if (filters.firstLoanZero) {
      if (!offer.features.includes('first_loan_zero') || offer.firstLoanRate !== 0) {
        return false;
      }
    }

    // Срочно (до 15 минут)
    if (filters.urgent) {
      if (offer.decisionTime > 15) {
        return false;
      }
    }

    // Без звонков
    if (filters.noCalls && !offer.noCalls) {
      return false;
    }

    // С плохой КИ
    if (filters.badCreditOk && !offer.badCreditOk) {
      return false;
    }

    return true;
  });
}
