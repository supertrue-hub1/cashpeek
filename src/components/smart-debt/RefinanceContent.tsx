'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  RefreshCw,
  Loader2,
  ArrowRight,
  Clock,
  Percent,
  Coins,
  Star,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface RefinanceOffer {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  rating: number;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate: number;
  isFirstLoanFree: boolean;
  decisionTime: number;
  approvalRate: number;
  features: string[];
  affiliateUrl: string | null;
  badges: string[];
}

export function RefinanceContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [offers, setOffers] = useState<RefinanceOffer[]>([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/offers/refinance');
      const data = await res.json();
      setOffers(data);
    } catch (error) {
      toast.error('Ошибка загрузки предложений');
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)} тыс`;
    }
    return amount.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-green-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Рефинансирование</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Лучшие предложения для перекредитования ваших долгов
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      )}

      {/* Offers Grid */}
      {!isLoading && offers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {offers.map((offer, index) => (
            <Card
              key={offer.id}
              className={`border-border relative overflow-hidden transition-all hover:shadow-lg ${
                index === 0 ? 'ring-2 ring-green-500/50' : ''
              }`}
            >
              {/* Recommended Badge */}
              {index === 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
              )}

              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  {/* Logo */}
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {offer.logo ? (
                      <Image
                        src={offer.logo}
                        alt={offer.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <Coins className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{offer.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">{offer.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                {/* 0% Badge */}
                {offer.isFirstLoanFree && (
                  <div className="mb-3 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="flex items-center justify-center gap-2">
                      <Percent className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        0% первый займ
                      </span>
                    </div>
                  </div>
                )}

                {/* Terms Grid */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Сумма</p>
                    <p className="text-sm font-medium">
                      {formatAmount(offer.minAmount)} - {formatAmount(offer.maxAmount)} ₽
                    </p>
                  </div>
                  <div className="p-2 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground">Срок</p>
                    <p className="text-sm font-medium">
                      {offer.minTerm}-{offer.maxTerm} дней
                    </p>
                  </div>
                </div>

                {/* Rate */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Ставка</span>
                    <span className="font-medium">
                      {offer.isFirstLoanFree ? (
                        <span className="text-green-500">0% → {offer.baseRate.toFixed(1)}%</span>
                      ) : (
                        <span>от {offer.firstLoanRate.toFixed(1)}%</span>
                      )}
                    </span>
                  </div>
                </div>

                {/* Approval Rate */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Одобрение
                    </span>
                    <span className="font-medium">{offer.approvalRate}%</span>
                  </div>
                  <Progress value={offer.approvalRate} className="h-1.5" />
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {offer.decisionTime === 0 && (
                    <Badge variant="outline" className="text-xs bg-green-500/10 text-green-600 border-green-500/20">
                      Мгновенно
                    </Badge>
                  )}
                  {offer.decisionTime > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {offer.decisionTime} мин
                    </Badge>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  className={`w-full gap-2 ${
                    index === 0
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      : ''
                  }`}
                  asChild
                >
                  <a
                    href={offer.affiliateUrl || `/sravnit/${offer.slug}`}
                    target={offer.affiliateUrl ? '_blank' : undefined}
                    rel={offer.affiliateUrl ? 'noopener noreferrer' : undefined}
                  >
                    Получить деньги
                    {offer.affiliateUrl ? (
                      <ExternalLink className="h-4 w-4" />
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && offers.length === 0 && (
        <Card className="border-border border-dashed">
          <CardContent className="p-8 text-center">
            <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Нет предложений</h3>
            <p className="text-sm text-muted-foreground">
              В данный момент нет доступных предложений
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
