/**
 * Types for SEO Hub Pages
 */

import type { LoanOffer } from '@prisma/client';

// ============================================
// Основные типы
// ============================================

export interface HubPageParams {
  category: string;
  city: string;
}

export interface HubPageData {
  // Параметры страницы
  category: CategoryInfo;
  city: CityInfo;
  
  // Офферы
  offers: OfferData[];
  offersCount: number;
  isFallback: boolean;
  
  // SEO
  seo: SeoData;
  
  // Контент
  faqs: FaqItem[];
  relatedCities: RelatedLink[];
  relatedCategories: RelatedLink[];
}

// ============================================
// Категория
// ============================================

export interface CategoryInfo {
  slug: string;
  name: string;
  namePrepositional: string;
  description: string;
  h1: string;
  shortDesc: string;
  keywords: string[];
}

// ============================================
// Город
// ============================================

export interface CityInfo {
  slug: string;
  name: string;
  preposition: string;
  genitive: string;
  population?: number;
}

// ============================================
// Оффер (формат для UI)
// ============================================

export interface OfferData {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  rating: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate?: number;
  decisionTime: number;
  approvalRate: number;
  features: string[];
  payoutMethods: string[];
  badCreditOk: boolean;
  noCalls: boolean;
  roundTheClock: boolean;
  minAge: number;
  documents: string[];
  editorNote?: string;
  affiliateUrl: string;
  isFeatured: boolean;
  isNew: boolean;
  isPopular: boolean;
}

// ============================================
// SEO
// ============================================

export interface SeoData {
  title: string;
  description: string;
  h1: string;
  canonical: string;
  keywords: string[];
}

// ============================================

// FAQ
// ============================================

export interface FaqItem {
  question: string;
  answer: string;
}

// ============================================
// Related Links
// ============================================

export interface RelatedLink {
  title: string;
  href: string;
  description?: string;
}

// ============================================
// Calculator
// ============================================

export interface CalculatorState {
  amount: number;
  term: number;
}

export interface CalculatorResult {
  totalRepayment: number;
  overpayment: number;
  dailyPayment: number;
}

// ============================================
// Comparison Table
// ============================================

export interface ComparisonRow {
  feature: string;
  values: Record<string, string | number | boolean>;
}
