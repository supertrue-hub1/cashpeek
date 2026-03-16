// Утилиты для преобразования данных из Prisma в типы Offer

import type { Offer, OfferFeature, PayoutMethod, DocumentRequirement } from '@/types/offer';
import type { LoanOffer, Tag } from '@prisma/client';

// Преобразование LoanOffer из Prisma в тип Offer
export function transformOffer(offer: LoanOffer & { tags?: Tag[] }): Offer {
  // Определяем features на основе тегов
  const features: OfferFeature[] = [];
  
  if (offer.tags) {
    const tagNames = offer.tags.map(t => t.slug);
    if (tagNames.includes('first-loan-zero')) features.push('first_loan_zero');
    if (tagNames.includes('no-overpayments')) features.push('no_overpayments');
    if (tagNames.includes('prolongation')) features.push('prolongation');
    if (tagNames.includes('early-repayment')) features.push('early_repayment');
    if (tagNames.includes('no-hidden-fees')) features.push('no_hidden_fees');
    if (tagNames.includes('online-approval')) features.push('online_approval');
    if (tagNames.includes('one-document')) features.push('one_document');
    if (tagNames.includes('loyalty-program')) features.push('loyalty_program');
  }
  
  // Определяем payoutMethods
  const payoutMethods: PayoutMethod[] = [];
  if (offer.payoutMethods?.includes('card')) payoutMethods.push('card');
  if (offer.payoutMethods?.includes('cash')) payoutMethods.push('cash');
  if (offer.payoutMethods?.includes('bank_account')) payoutMethods.push('bank_account');
  if (offer.payoutMethods?.includes('yoomoney')) payoutMethods.push('yoomoney');
  if (offer.payoutMethods?.includes('qiwi')) payoutMethods.push('qiwi');
  if (offer.payoutMethods?.includes('contact')) payoutMethods.push('contact');
  if (offer.payoutMethods?.includes('golden_crown')) payoutMethods.push('golden_crown');
  
  // Определяем documents
  const documents: DocumentRequirement[] = [];
  if (offer.documents?.includes('passport')) documents.push('passport');
  if (offer.documents?.includes('inn')) documents.push('inn');
  if (offer.documents?.includes('snils')) documents.push('snils');
  if (offer.documents?.includes('driver_license')) documents.push('driver_license');
  
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
    baseRate: offer.interestRate || 1,
    firstLoanRate: offer.firstLoanRate ?? undefined,
    decisionTime: parseDecisionTime(offer.decisionTime),
    approvalRate: 85, // дефолтное значение
    payoutMethods: payoutMethods.length > 0 ? payoutMethods : ['card'],
    features,
    badCreditOk: offer.badCreditOk ?? false,
    noCalls: offer.noCalls ?? false,
    roundTheClock: offer.roundTheClock ?? false,
    minAge: offer.minAge || 18,
    maxAge: offer.maxAge || 75,
    documents: documents.length > 0 ? documents : ['passport'],
    editorNote: offer.editorNote || undefined,
    affiliateUrl: offer.affiliateUrl || offer.website || '#',
    isFeatured: offer.isFeatured ?? false,
    isNew: offer.isNew ?? false,
    isPopular: offer.rating >= 4.5,
  };
}

// Парсинг времени решения из строки в минуты
function parseDecisionTime(decisionTime: string | null): number {
  if (!decisionTime) return 15;
  
  // "5 минут", "1 час", "мгновенно"
  const minutesMatch = decisionTime.match(/(\d+)\s*мин/);
  if (minutesMatch) return parseInt(minutesMatch[1]);
  
  const hoursMatch = decisionTime.match(/(\d+)\s*час/);
  if (hoursMatch) return parseInt(hoursMatch[1]) * 60;
  
  if (decisionTime.toLowerCase().includes('мгновен')) return 0;
  
  return 15;
}

// Упрощённая карточка займа для SEO страниц
export interface SimpleOfferCardProps {
  offer: LoanOffer & { tags?: Tag[] };
}

export function SimpleOfferCard({ offer }: SimpleOfferCardProps) {
  const amount = `${offer.minAmount?.toLocaleString() || '1 000'} – ${offer.maxAmount?.toLocaleString() || '30 000'} ₽`;
  const term = `до ${offer.maxTerm || 30} дней`;
  const rate = offer.firstLoanRate === 0 ? '0%' : `от ${offer.firstLoanRate || offer.interestRate}%`;
  
  return (
    <a
      href={`/mfo/${offer.slug}`}
      className="block bg-white border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/20 transition-all"
    >
      <div className="flex items-start gap-4">
        {offer.logo ? (
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2 flex-shrink-0">
            <img src={offer.logo} alt={offer.name} className="max-w-full max-h-full object-contain" />
          </div>
        ) : (
          <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {offer.name.slice(0, 2).toUpperCase()}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900">{offer.name}</h3>
              <div className="flex items-center gap-1 text-sm mt-0.5">
                <span className="text-yellow-500">★</span>
                <span className="text-muted-foreground">{offer.rating}</span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-lg font-bold text-primary">{rate}</div>
              <div className="text-xs text-muted-foreground">в день</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {amount}
            </span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
              {term}
            </span>
            {offer.decisionTime && (
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                {offer.decisionTime}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
