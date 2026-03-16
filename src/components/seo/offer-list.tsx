/**
 * Компонент списка предложений с сортировкой по интенту страницы
 * Anti-Thin Content: разная сортировка для разных типов страниц
 */

'use client';

import { useState, useMemo } from 'react';
import { OffersGrid } from '@/components/offers';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ArrowUpDown, Star, Clock, Percent, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { Offer } from '@/types/offer';

type SortOption = 'rating' | 'rate' | 'amount' | 'term' | 'approval';

interface OfferListProps {
  offers: any[];
  loanTypeSlug?: string;
  showSort?: boolean;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'По рейтингу', icon: Star },
  { value: 'rate', label: 'По ставке', icon: Percent },
  { value: 'amount', label: 'По сумме', icon: TrendingUp },
  { value: 'term', label: 'По сроку', icon: Clock },
];

// Transform DB offer to frontend Offer type
function transformOffer(offer: any): Offer {
  const parseJsonArray = (value: unknown, defaultValue: string[] = []): string[] => {
    if (!value) return defaultValue;
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : defaultValue;
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  };

  return {
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    logo: offer.logo || undefined,
    rating: offer.rating,
    minAmount: offer.minAmount,
    maxAmount: offer.maxAmount,
    minTerm: offer.minTerm || 1,
    maxTerm: offer.maxTerm || 30,
    baseRate: offer.baseRate || 0.8,
    firstLoanRate: offer.firstLoanRate ?? undefined,
    decisionTime: offer.decisionTime || 15,
    approvalRate: offer.approvalRate || 85,
    payoutMethods: parseJsonArray(offer.payoutMethods, ['card']) as import('@/types/offer').PayoutMethod[],
    features: parseJsonArray(offer.features, ['online_approval']) as import('@/types/offer').OfferFeature[],
    badCreditOk: offer.badCreditOk ?? false,
    noCalls: offer.noCalls ?? false,
    roundTheClock: offer.roundTheClock ?? false,
    minAge: offer.minAge || 18,
    documents: parseJsonArray(offer.documents, ['passport']) as import('@/types/offer').DocumentRequirement[],
    editorNote: offer.customDescription || offer.editorNote || undefined,
    affiliateUrl: offer.affiliateUrl || '#',
    isFeatured: offer.isFeatured ?? false,
    isNew: offer.isNew ?? false,
    isPopular: offer.isPopular ?? false,
  };
}

// Сортировка по умолчанию в зависимости от типа займа
function getDefaultSort(loanTypeSlug?: string): SortOption {
  switch (loanTypeSlug) {
    case 'bez-procentov':
    case 'bez-otkaza':
      return 'approval'; // Сначала одобряемые
    case 'na-kartu':
      return 'rate'; // Сначала с низкой ставкой
    default:
      return 'rating';
  }
}

// Фильтрация и сортировка офферов под интент
function sortOffersByIntent(offers: Offer[], intent?: string): Offer[] {
  const sorted = [...offers];
  
  switch (intent) {
    case 'bez-procentov':
      // Сначала офферы с 0%
      sorted.sort((a, b) => {
        const aZero = a.firstLoanRate === 0 ? 0 : 1;
        const bZero = b.firstLoanRate === 0 ? 0 : 1;
        if (aZero !== bZero) return aZero - bZero;
        return b.rating - a.rating;
      });
      break;
      
    case 'bez-otkaza':
      // Сначала с высоким approvalRate
      sorted.sort((a, b) => {
        const aApproval = a.approvalRate || 85;
        const bApproval = b.approvalRate || 85;
        return bApproval - aApproval || b.rating - a.rating;
      });
      break;
      
    case 'na-kartu':
      // Сначала с payout на карту
      sorted.sort((a, b) => {
        const aCard = a.payoutMethods?.includes('card') ? 0 : 1;
        const bCard = b.payoutMethods?.includes('card') ? 0 : 1;
        if (aCard !== bCard) return aCard - bCard;
        return b.rating - a.rating;
      });
      break;
      
    case 'bez-proverki-ki':
      // Сначала с плохой КИ
      sorted.sort((a, b) => {
        const aBadCredit = a.badCreditOk ? 0 : 1;
        const bBadCredit = b.badCreditOk ? 0 : 1;
        if (aBadCredit !== bBadCredit) return aBadCredit - bBadCredit;
        return b.rating - a.rating;
      });
      break;
      
    default:
      // По умолчанию - рейтинг
      sorted.sort((a, b) => b.rating - a.rating);
  }
  
  return sorted;
}

export function OfferList({ offers: rawOffers, loanTypeSlug, showSort = true }: OfferListProps) {
  const [sortBy, setSortBy] = useState<SortOption>(getDefaultSort(loanTypeSlug));
  
  // Преобразуем офферы в формат Offer
  const offers = useMemo(() => rawOffers.map(transformOffer), [rawOffers]);
  
  // Мемоизируем отсортированный список
  const sortedOffers = useMemo(() => {
    // Сначала применяем сортировку по интенту
    let result = sortOffersByIntent(offers, loanTypeSlug);
    
    // Затем дополнительная сортировка пользователя
    switch (sortBy) {
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'rate':
        result.sort((a, b) => (a.firstLoanRate || a.baseRate) - (b.firstLoanRate || b.baseRate));
        break;
      case 'amount':
        result.sort((a, b) => b.maxAmount - a.maxAmount);
        break;
      case 'term':
        result.sort((a, b) => b.maxTerm - a.maxTerm);
        break;
      case 'approval':
        result.sort((a, b) => (b.approvalRate || 90) - (a.approvalRate || 90));
        break;
    }
    
    return result;
  }, [offers, sortBy, loanTypeSlug]);
  
  if (offers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">
          В данной категории пока нет предложений
        </p>
        <Button asChild>
          <Link href="/zaimy">Смотреть все займы</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      {showSort && (
        <div className="flex items-center justify-between py-4 border-b">
          <span className="text-sm text-muted-foreground">
            Найдено {offers.length} предложений
          </span>
          
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Сортировка" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <span className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
      
      {/* Offers Grid */}
      <OffersGrid
        offers={sortedOffers}
        featuredIds={sortedOffers.filter((o) => o.isFeatured).map((o) => o.id)}
      />
    </div>
  );
}
