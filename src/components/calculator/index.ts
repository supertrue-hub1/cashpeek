/**
 * Calculator components and utilities
 */

export { InteractiveCalculator } from './interactive-calculator';

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
