/**
 * MFO Landing Page / Card Component
 * 
 * Детальная карточка МФО для лендинга
 * - Лого и рейтинг
 * - Условия займа
 - Особенности
 - Отзывы
 - CTA кнопка
 */

'use client';

import { useState } from 'react';
import { 
  Star, 
  Clock, 
  Percent, 
  Shield, 
  CreditCard, 
  CheckCircle2, 
  XCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Calculator,
  ThumbsUp,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { FavoriteButton } from '@/components/favorites/favorite-button';
import { CompareButton } from '@/components/compare/compare-button';

interface MfoLandingCardProps {
  mfo: {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    rating: number;
    reviewCount?: number;
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
    documents: string[];
    badCreditOk: boolean;
    roundTheClock: boolean;
    minAge: number;
    description?: string;
    advantages?: string[];
    affiliateUrl: string;
  };
  variant?: 'default' | 'compact' | 'detailed';
}

const FEATURE_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  first_loan_zero: { label: 'Первый займ под 0%', icon: <Percent className="h-4 w-4" /> },
  online_approval: { label: 'Одобрение онлайн', icon: <CreditCard className="h-4 w-4" /> },
  bad_credit_ok: { label: 'С плохой КИ', icon: <Shield className="h-4 w-4" /> },
  prolongation: { label: 'Пролонгация', icon: <Clock className="h-4 w-4" /> },
  early_repayment: { label: 'Досрочное погашение', icon: <CheckCircle2 className="h-4 w-4" /> },
  no_hidden_fees: { label: 'Без скрытых комиссий', icon: <Shield className="h-4 w-4" /> },
};

const PAYOUT_METHODS: Record<string, string> = {
  card: 'На карту',
  account: 'На счёт',
  cash: 'Наличными',
  wallet: 'На кошелёк',
  contact: 'Через Контакт',
};

export function MfoLandingCard({ mfo, variant = 'default' }: MfoLandingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  
  // Калькулятор процентов
  const [calcAmount, setCalcAmount] = useState(mfo.minAmount);
  const [calcDays, setCalcDays] = useState(mfo.minTerm);
  
  const calculateRepayment = () => {
    const rate = mfo.firstLoanRate && calcDays <= 30 ? mfo.firstLoanRate : mfo.baseRate;
    return calcAmount + (calcAmount * rate / 100 * calcDays / 30);
  };
  
  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {mfo.logo && (
              <img src={mfo.logo} alt={mfo.name} className="h-10 w-auto" />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{mfo.name}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {mfo.rating}
                </div>
                <span>•</span>
                <span>{mfo.minAmount} – {mfo.maxAmount} ₽</span>
              </div>
            </div>
            <div className="flex gap-1">
              <FavoriteButton offerId={mfo.id} size="icon" />
              <CompareButton offerId={mfo.id} size="icon" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {mfo.logo && (
              <img src={mfo.logo} alt={mfo.name} className="h-14 w-auto" />
            )}
            <div>
              <CardTitle className="text-xl">{mfo.name}</CardTitle>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{mfo.rating}</span>
                </div>
                {mfo.reviewCount && (
                  <span className="text-sm text-muted-foreground">
                    {mfo.reviewCount} отзывов
                  </span>
                )}
                <Badge variant={mfo.approvalRate >= 90 ? 'default' : 'secondary'}>
                  {mfo.approvalRate}% одобрения
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex gap-1">
            <FavoriteButton offerId={mfo.id} offerName={mfo.name} />
            <CompareButton offerId={mfo.id} offerName={mfo.name} />
          </div>
        </div>
      </CardHeader>
      
      {/* Main Info */}
      <CardContent className="space-y-4">
        {/* Conditions Grid */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
          <div>
            <p className="text-sm text-muted-foreground">Сумма</p>
            <p className="text-lg font-semibold">{mfo.minAmount.toLocaleString()} – {mfo.maxAmount.toLocaleString()} ₽</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Срок</p>
            <p className="text-lg font-semibold">{mfo.minTerm} – {mfo.maxTerm} дней</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Ставка</p>
            <p className="text-lg font-semibold">{mfo.baseRate}% в день</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Решение</p>
            <p className="text-lg font-semibold">до {mfo.decisionTime} мин</p>
          </div>
        </div>
        
        {/* First Loan Rate */}
        {mfo.firstLoanRate !== undefined && (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-900">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-green-600" />
              <span className="font-medium">Первый займ</span>
            </div>
            <span className="text-green-600 font-bold">{mfo.firstLoanRate}%</span>
          </div>
        )}
        
        {/* Features */}
        <div className="flex flex-wrap gap-2">
          {mfo.features.slice(0, 4).map((feature) => {
            const featureInfo = FEATURE_LABELS[feature];
            if (!featureInfo) return null;
            return (
              <Badge key={feature} variant="outline" className="gap-1">
                {featureInfo.icon}
                {featureInfo.label}
              </Badge>
            );
          })}
          {mfo.badCreditOk && (
            <Badge variant="outline" className="gap-1">
              <Shield className="h-4 w-4" />
              С плохой КИ
            </Badge>
          )}
          {mfo.roundTheClock && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-4 w-4" />
              24/7
            </Badge>
          )}
        </div>
        
        {/* Calculator Toggle */}
        <Button 
          variant="outline" 
          className="w-full gap-2"
          onClick={() => setIsCalculatorOpen(!isCalculatorOpen)}
        >
          <Calculator className="h-4 w-4" />
          Рассчитать переплату
          {isCalculatorOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {/* Calculator */}
        {isCalculatorOpen && (
          <div className="p-4 bg-muted/30 rounded-lg space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Сумма займа</label>
              <input
                type="range"
                min={mfo.minAmount}
                max={mfo.maxAmount}
                value={calcAmount}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>{calcAmount.toLocaleString()} ₽</span>
                <span>{mfo.maxAmount.toLocaleString()} ₽</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Срок (дней)</label>
              <input
                type="range"
                min={mfo.minTerm}
                max={mfo.maxTerm}
                value={calcDays}
                onChange={(e) => setCalcDays(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-sm">
                <span>{calcDays} дней</span>
                <span>{mfo.maxTerm} дней</span>
              </div>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">К возврату:</span>
              <span className="text-xl font-bold">{Math.round(calculateRepayment()).toLocaleString()} ₽</span>
            </div>
            <Progress 
              value={(mfo.baseRate * calcDays / 30) * 10} 
              className="h-2"
            />
            <p className="text-xs text-muted-foreground text-center">
              Переплата: {Math.round(calculateRepayment() - calcAmount).toLocaleString()} ₽
            </p>
          </div>
        )}
        
        {/* CTA */}
        <Button asChild size="lg" className="w-full gap-2">
          <a href={mfo.affiliateUrl} target="_blank" rel="noopener noreferrer">
            Оформить займ
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
        
        {/* Expand Details */}
        {variant === 'detailed' && (
          <>
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Свернуть' : 'Подробнее о МФО'}
              {isExpanded ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
            </Button>
            
            {isExpanded && (
              <div className="space-y-4 pt-4 border-t">
                {/* Description */}
                {mfo.description && (
                  <p className="text-sm text-muted-foreground">{mfo.description}</p>
                )}
                
                {/* Advantages */}
                {mfo.advantages && mfo.advantages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Преимущества</h4>
                    <ul className="space-y-1">
                      {mfo.advantages.map((adv, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          {adv}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Payout Methods */}
                <div>
                  <h4 className="font-medium mb-2">Способы получения</h4>
                  <div className="flex flex-wrap gap-2">
                    {mfo.payoutMethods.map((method) => (
                      <Badge key={method} variant="secondary">
                        {PAYOUT_METHODS[method] || method}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Documents */}
                <div>
                  <h4 className="font-medium mb-2">Документы</h4>
                  <div className="flex flex-wrap gap-2">
                    {mfo.documents.map((doc) => (
                      <Badge key={doc} variant="outline">
                        {doc === 'passport' ? 'Паспорт' : doc}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Age */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Возраст:</span>
                  <span>от {mfo.minAge} лет</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default MfoLandingCard;
