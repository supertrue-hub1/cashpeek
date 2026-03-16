/**
 * Offer Filters Component
 * 
 * Фильтры для страницы сравнения:
 * - По сумме займа
 * - По сроку займа
 * - По способу получения
 * - По процентной ставке
 * - По типу заёмщика
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  Check,
  Filter,
  RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { OfferData } from '@/lib/seo-hub/types';

// ============================================
// Types
// ============================================

export interface OfferFiltersState {
  amount: {
    min: number;
    max: number;
  };
  term: {
    min: number;
    max: number;
  };
  payoutMethods: string[];
  features: string[];
  rating: number;
  firstLoanOnly: boolean;
  badCreditOk: boolean;
  roundTheClock: boolean;
}

interface OfferFiltersProps {
  offers: OfferData[];
  onFilterChange?: (filteredOffers: OfferData[]) => void;
}

const DEFAULT_FILTERS: OfferFiltersState = {
  amount: { min: 0, max: 100000 },
  term: { min: 0, max: 365 },
  payoutMethods: [],
  features: [],
  rating: 0,
  firstLoanOnly: false,
  badCreditOk: false,
  roundTheClock: false,
};

// ============================================
// Constants
// ============================================

const AMOUNT_OPTIONS = [
  { value: '0-5000', label: 'До 5 000 ₽', min: 0, max: 5000 },
  { value: '5000-15000', label: '5 000 – 15 000 ₽', min: 5000, max: 15000 },
  { value: '15000-30000', label: '15 000 – 30 000 ₽', min: 15000, max: 30000 },
  { value: '30000-50000', label: '30 000 – 50 000 ₽', min: 30000, max: 50000 },
  { value: '50000-100000', label: '50 000 – 100 000 ₽', min: 50000, max: 100000 },
  { value: '100000-999999', label: 'Более 100 000 ₽', min: 100000, max: 999999 },
];

const TERM_OPTIONS = [
  { value: '0-7', label: 'До 7 дней', min: 0, max: 7 },
  { value: '7-14', label: '7 – 14 дней', min: 7, max: 14 },
  { value: '14-30', label: '14 – 30 дней', min: 14, max: 30 },
  { value: '30-60', label: '30 – 60 дней', min: 30, max: 60 },
  { value: '60-90', label: '60 – 90 дней', min: 60, max: 90 },
  { value: '90-365', label: 'Более 90 дней', min: 90, max: 365 },
];

const PAYOUT_METHODS = [
  { id: 'card', label: 'На карту' },
  { id: 'account', label: 'На банковский счёт' },
  { id: 'cash', label: 'Наличными' },
  { id: 'wallet', label: 'На кошелёк' },
  { id: 'contact', label: 'Через Контакт' },
];

const FEATURES = [
  { id: 'first_loan_zero', label: 'Первый займ без %' },
  { id: 'online_approval', label: 'Одобрение онлайн' },
  { id: 'bad_credit_ok', label: 'С плохой КИ' },
  { id: 'no_document', label: 'Без паспорта' },
  { id: 'prolongation', label: 'Пролонгация' },
  { id: 'early_repayment', label: 'Досрочное погашение' },
];

const RATING_OPTIONS = [
  { value: '0', label: 'Любой рейтинг' },
  { value: '4', label: '4+ ★' },
  { value: '4.5', label: '4.5+ ★' },
  { value: '4.8', label: '4.8+ ★' },
];

// ============================================
// Component
// ============================================

export function OfferFilters({ offers, onFilterChange }: OfferFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [filters, setFilters] = useState<OfferFiltersState>(() => {
    // Инициализация из URL параметров
    const amount = searchParams.get('amount');
    const term = searchParams.get('term');
    const payout = searchParams.get('payout');
    const features = searchParams.get('features');
    const rating = searchParams.get('rating');
    const firstLoan = searchParams.get('firstLoan');
    const badCredit = searchParams.get('badCredit');
    const roundClock = searchParams.get('roundClock');
    
    return {
      amount: amount ? JSON.parse(amount) : DEFAULT_FILTERS.amount,
      term: term ? JSON.parse(term) : DEFAULT_FILTERS.term,
      payoutMethods: payout ? payout.split(',') : [],
      features: features ? features.split(',') : [],
      rating: rating ? parseFloat(rating) : 0,
      firstLoanOnly: firstLoan === 'true',
      badCreditOk: badCredit === 'true',
      roundTheClock: roundClock === 'true',
    };
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  
  // Фильтрация офферов
  const filteredOffers = useMemo(() => {
    return offers.filter(offer => {
      // По сумме
      if (offer.minAmount < filters.amount.min || offer.maxAmount > filters.amount.max) {
        return false;
      }
      
      // По сроку
      if (offer.minTerm < filters.term.min || offer.maxTerm > filters.term.max) {
        return false;
      }
      
      // По способу получения
      if (filters.payoutMethods.length > 0) {
        const hasMethod = filters.payoutMethods.some(method => 
          offer.payoutMethods.includes(method)
        );
        if (!hasMethod) return false;
      }
      
      // По фичам
      if (filters.features.length > 0) {
        const hasFeature = filters.features.some(feature => 
          offer.features.includes(feature)
        );
        if (!hasFeature) return false;
      }
      
      // По рейтингу
      if (filters.rating > 0 && offer.rating < filters.rating) {
        return false;
      }
      
      // Первый займ без %
      if (filters.firstLoanOnly && !offer.features.includes('first_loan_zero')) {
        return false;
      }
      
      // С плохой КИ
      if (filters.badCreditOk && !offer.badCreditOk) {
        return false;
      }
      
      // Круглосуточно
      if (filters.roundTheClock && !offer.roundTheClock) {
        return false;
      }
      
      return true;
    });
  }, [offers, filters]);
  
  // Callback при изменении фильтров
  useMemo(() => {
    if (onFilterChange) {
      onFilterChange(filteredOffers);
    }
  }, [filteredOffers, onFilterChange]);
  
  // Обновление URL
  const updateURL = useCallback((newFilters: OfferFiltersState) => {
    const params = new URLSearchParams();
    
    if (newFilters.amount.min !== 0 || newFilters.amount.max !== 100000) {
      params.set('amount', JSON.stringify(newFilters.amount));
    }
    if (newFilters.term.min !== 0 || newFilters.term.max !== 365) {
      params.set('term', JSON.stringify(newFilters.term));
    }
    if (newFilters.payoutMethods.length > 0) {
      params.set('payout', newFilters.payoutMethods.join(','));
    }
    if (newFilters.features.length > 0) {
      params.set('features', newFilters.features.join(','));
    }
    if (newFilters.rating > 0) {
      params.set('rating', newFilters.rating.toString());
    }
    if (newFilters.firstLoanOnly) params.set('firstLoan', 'true');
    if (newFilters.badCreditOk) params.set('badCredit', 'true');
    if (newFilters.roundTheClock) params.set('roundClock', 'true');
    
    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '/sravnit', { scroll: false });
  }, [router]);
  
  // Сброс фильтров
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    router.push('/sravnit', { scroll: false });
  };
  
  // Подсчёт активных фильтров
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.amount.min !== 0 || filters.amount.max !== 100000) count++;
    if (filters.term.min !== 0 || filters.term.max !== 365) count++;
    if (filters.payoutMethods.length > 0) count++;
    if (filters.features.length > 0) count++;
    if (filters.rating > 0) count++;
    if (filters.firstLoanOnly) count++;
    if (filters.badCreditOk) count++;
    if (filters.roundTheClock) count++;
    return count;
  }, [filters]);
  
  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          <h3 className="font-semibold">Фильтры</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Сбросить
          </Button>
        )}
      </div>
      
      {/* Быстрые фильтры */}
      <div className="flex flex-wrap gap-2">
        {/* Сумма */}
        <Select
          value={`${filters.amount.min}-${filters.amount.max}`}
          onValueChange={(value) => {
            const option = AMOUNT_OPTIONS.find(o => o.value === value);
            if (option) {
              setFilters(f => ({
                ...f,
                amount: { min: option.min, max: option.max }
              }));
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Сумма займа" />
          </SelectTrigger>
          <SelectContent>
            {AMOUNT_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Срок */}
        <Select
          value={`${filters.term.min}-${filters.term.max}`}
          onValueChange={(value) => {
            const option = TERM_OPTIONS.find(o => o.value === value);
            if (option) {
              setFilters(f => ({
                ...f,
                term: { min: option.min, max: option.max }
              }));
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Срок займа" />
          </SelectTrigger>
          <SelectContent>
            {TERM_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Рейтинг */}
        <Select
          value={filters.rating.toString()}
          onValueChange={(value) => {
            setFilters(f => ({
              ...f,
              rating: parseFloat(value)
            }));
          }}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Рейтинг" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Чекбоксы */}
      <div className="flex flex-wrap gap-4 pt-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.firstLoanOnly}
            onCheckedChange={(checked) => {
              setFilters(f => ({ ...f, firstLoanOnly: checked as boolean }));
            }}
          />
          <span className="text-sm">Первый займ без %</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.badCreditOk}
            onCheckedChange={(checked) => {
              setFilters(f => ({ ...f, badCreditOk: checked as boolean }));
            }}
          />
          <span className="text-sm">С плохой КИ</span>
        </label>
        
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={filters.roundTheClock}
            onCheckedChange={(checked) => {
              setFilters(f => ({ ...f, roundTheClock: checked as boolean }));
            }}
          />
          <span className="text-sm">Круглосуточно</span>
        </label>
      </div>
      
      {/* Расширенные фильтры (Popover) */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            Все фильтры
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-4" align="start">
          <div className="space-y-4">
            <h4 className="font-semibold">Способ получения</h4>
            <div className="grid grid-cols-2 gap-2">
              {PAYOUT_METHODS.map(method => (
                <label 
                  key={method.id} 
                  className={cn(
                    "flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted",
                    filters.payoutMethods.includes(method.id) && "border-primary bg-primary/5"
                  )}
                >
                  <Checkbox
                    checked={filters.payoutMethods.includes(method.id)}
                    onCheckedChange={(checked) => {
                      setFilters(f => ({
                        ...f,
                        payoutMethods: checked
                          ? [...f.payoutMethods, method.id]
                          : f.payoutMethods.filter(p => p !== method.id)
                      }));
                    }}
                  />
                  <span className="text-sm">{method.label}</span>
                </label>
              ))}
            </div>
            
            <h4 className="font-semibold">Особенности</h4>
            <div className="grid grid-cols-2 gap-2">
              {FEATURES.map(feature => (
                <label 
                  key={feature.id} 
                  className={cn(
                    "flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted",
                    filters.features.includes(feature.id) && "border-primary bg-primary/5"
                  )}
                >
                  <Checkbox
                    checked={filters.features.includes(feature.id)}
                    onCheckedChange={(checked) => {
                      setFilters(f => ({
                        ...f,
                        features: checked
                          ? [...f.features, feature.id]
                          : f.features.filter(p => p !== feature.id)
                      }));
                    }}
                  />
                  <span className="text-sm">{feature.label}</span>
                </label>
              ))}
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setIsOpen(false)}>Применить</Button>
              <Button variant="outline" onClick={resetFilters}>Сбросить</Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Результат */}
      <div className="text-sm text-muted-foreground">
        Найдено: <span className="font-semibold text-foreground">{filteredOffers.length}</span> предложений
      </div>
    </div>
  );
}

export default OfferFilters;
