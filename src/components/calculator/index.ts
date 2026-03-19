/**
 * Calculator components and utilities
 */

export { InteractiveCalculator } from './interactive-calculator';
export { SmartCalculator } from './smart-calculator';
export { FinancialRadar } from './financial-radar';
export { TrustScore } from './trust-score';
export { TopCategories } from './top-categories';
export { MFOCard } from './mfo-card';
export { ComparisonPanel } from './comparison-panel';
export { Quiz } from './quiz';

export {
  calculateLoan,
  formatCurrency,
  formatNumber,
  formatTerm,
  getPresetAmounts,
  getPresetTerms,
  clamp,
  validateLoanParams,
  CalculatorInputSchema,
  type CalculatorInput,
  type CalculatorResult,
} from '@/lib/utils/calculator';
