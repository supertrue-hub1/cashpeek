// Типы для синхронизации с API источниками

export interface SyncSource {
  id: string;
  name: string;
  apiUrl: string;
  apiKey?: string;
  status: 'available' | 'connected' | 'disconnected';
  lastSync?: Date;
  nextSync?: Date;
  interval?: number; // в минутах
  offersCount: number;
  enabled: boolean;
}

export interface SyncResult {
  success: boolean;
  source: string;
  processed: number;
  updated: number;
  added: number;
  errors: number;
  duration: number;
  errorMessage?: string;
}

export interface ExternalOffer {
  // ID из внешнего API
  externalId: string;
  
  // Основная информация
  name: string;
  slug: string;
  logo?: string;
  rating?: number;
  
  // Условия займа
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate?: number;
  psk?: number;
  decisionTime: number;
  approvalRate?: number;
  
  // Особенности
  features?: string[];
  payoutMethods?: string[];
  
  // Требования
  badCreditOk?: boolean;
  noCalls?: boolean;
  roundTheClock?: boolean;
  minAge?: number;
  documents?: string[];
  
  // Партнёрка
  affiliateUrl?: string;
  affiliateId?: string;
}

// Маппинг полей из API источников
export interface ApiFieldMapping {
  externalId?: string;
  name?: string;
  slug?: string;
  logo?: string;
  rating?: string;
  minAmount?: string;
  maxAmount?: string;
  minTerm?: string;
  maxTerm?: string;
  baseRate?: string;
  firstLoanRate?: string;
  psk?: string;
  decisionTime?: string;
  approvalRate?: string;
  features?: string;
  payoutMethods?: string;
  badCreditOk?: string;
  noCalls?: string;
  roundTheClock?: string;
  minAge?: string;
  documents?: string;
  affiliateUrl?: string;
  affiliateId?: string;
}
