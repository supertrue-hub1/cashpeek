'use client';

import * as React from 'react';
import { 
  Clock, ShieldCheck, Star, CreditCard, Moon, PhoneOff, Zap, ArrowRight, 
  X, ThumbsUp, CheckCircle, Calendar, Percent, Users, FileText, Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import type { Offer, OfferFeature, Review } from '@/types/offer';
import { getReviewsByOfferId } from '@/data/mock-offers';

interface OfferCardProps {
  offer: Offer;
  className?: string;
  featured?: boolean;
}

const featureLabels: Record<OfferFeature, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  first_loan_zero: { label: '0% первый займ', variant: 'default' },
  no_overpayments: { label: 'Без переплат', variant: 'secondary' },
  prolongation: { label: 'Пролонгация', variant: 'outline' },
  early_repayment: { label: 'Досрочное погашение', variant: 'outline' },
  no_hidden_fees: { label: 'Без скрытых комиссий', variant: 'outline' },
  online_approval: { label: 'Онлайн', variant: 'outline' },
  one_document: { label: '1 документ', variant: 'outline' },
  loyalty_program: { label: 'Программа лояльности', variant: 'outline' },
};

// MFO Logo component
function MFOLogo({ name, className }: { name: string; className?: string }) {
  const colors: Record<string, string> = {
    'Займер': 'bg-gradient-to-br from-blue-500 to-blue-600',
    'MoneyMan': 'bg-gradient-to-br from-green-500 to-green-600',
    'еКапуста': 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    'Турбозайм': 'bg-gradient-to-br from-orange-500 to-orange-600',
    'Moneza': 'bg-gradient-to-br from-purple-500 to-purple-600',
    'Webbankir': 'bg-gradient-to-br from-sky-500 to-sky-600',
    'До зарплаты': 'bg-gradient-to-br from-amber-500 to-amber-600',
    'Lime': 'bg-gradient-to-br from-lime-500 to-lime-600',
  };
  const bgColor = colors[name] || 'bg-gradient-to-br from-slate-500 to-slate-600';
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <div className={cn('flex items-center justify-center rounded-xl text-white font-bold', bgColor, className)}>
      {initials}
    </div>
  );
}

// Star rating component
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-transparent text-slate-300'
          )}
        />
      ))}
    </div>
  );
}

// Review Card component
function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-border pb-4 last:border-0">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
            {review.author.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground text-sm">{review.author}</span>
              {review.verified && (
                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Проверен
                </Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{review.date}</span>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{review.text}</p>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <ThumbsUp className="h-3 w-3" />
        <span>Полезно: {review.helpful}</span>
      </div>
    </div>
  );
}

export function OfferCard({ offer, className, featured = false }: OfferCardProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const reviews = getReviewsByOfferId(offer.id);
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : offer.rating;

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };

  const formatDecisionTime = (minutes: number) => {
    if (minutes === 0) return 'Мгновенно';
    if (minutes < 60) return `${minutes} мин`;
    return `${Math.floor(minutes / 60)} ч`;
  };

  // Безопасное получение массивов
  const documents = Array.isArray(offer.documents) ? offer.documents : ['passport'];
  const features = Array.isArray(offer.features) ? offer.features : [];
  const payoutMethods = Array.isArray(offer.payoutMethods) ? offer.payoutMethods : ['card'];

  return (
    <>
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-300 hover:shadow-lg bg-card border-border',
          featured && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
          className
        )}
      >
        {/* Featured badge */}
        {featured && (
          <div className="absolute right-0 top-0 z-10">
            <div className="rounded-bl-xl bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              Рекомендуем
            </div>
          </div>
        )}

        <CardContent className="p-5 pb-0">
          {/* Header: Logo, Name, Rating */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <MFOLogo name={offer.name} className="h-12 w-12 text-lg" />
              <div>
                <h3 className="font-semibold text-base text-foreground">{offer.name}</h3>
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground">{offer.rating}</span>
                </div>
              </div>
            </div>
            
            {/* Quick badges */}
            <div className="flex gap-1">
              {offer.isNew && (
                <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                  Новый
                </Badge>
              )}
            </div>
          </div>

          {/* Main terms */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground mb-1">Сумма</div>
              <div className="font-semibold text-sm text-foreground">
                {formatAmount(offer.minAmount)} – {formatAmount(offer.maxAmount)} ₽
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 p-3">
              <div className="text-xs text-muted-foreground mb-1">Срок</div>
              <div className="font-semibold text-sm text-foreground">
                {offer.minTerm} – {offer.maxTerm} дней
              </div>
            </div>
          </div>

          {/* Decision time */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Решение:</span>
            <span className="font-medium text-foreground">{formatDecisionTime(offer.decisionTime)}</span>
            {offer.decisionTime <= 5 && (
              <Zap className="h-4 w-4 text-amber-500" />
            )}
          </div>

          {/* Special conditions badges */}
          <div className="mb-4 flex flex-wrap gap-1.5">
            {features.slice(0, 3).map((feature) => {
              const config = featureLabels[feature];
              if (!config) return null;
              
              if (feature === 'first_loan_zero') {
                return (
                  <Badge
                    key={feature}
                    className="bg-primary text-primary-foreground text-xs border-0"
                  >
                    {config.label}
                  </Badge>
                );
              }
              
              return (
                <Badge key={feature} variant={config.variant} className="text-xs bg-muted text-muted-foreground border-0">
                  {config.label}
                </Badge>
              );
            })}
          </div>

          {/* Quick icons for conditions */}
          <div className="mb-4 flex gap-3 text-muted-foreground">
            {offer.badCreditOk && (
              <div className="flex items-center gap-1 text-xs" title="Подходит для плохой КИ">
                <ShieldCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Плохая КИ</span>
              </div>
            )}
            {offer.noCalls && (
              <div className="flex items-center gap-1 text-xs" title="Без звонков">
                <PhoneOff className="h-4 w-4" />
                <span className="hidden sm:inline">Без звонков</span>
              </div>
            )}
            {offer.roundTheClock && (
              <div className="flex items-center gap-1 text-xs" title="Круглосуточно">
                <Moon className="h-4 w-4" />
                <span className="hidden sm:inline">24/7</span>
              </div>
            )}
            {payoutMethods.includes('card') && (
              <div className="flex items-center gap-1 text-xs" title="На карту">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">На карту</span>
              </div>
            )}
          </div>

          {/* Editor note */}
          {offer.editorNote && (
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {offer.editorNote}
            </p>
          )}
        </CardContent>

        <CardFooter className="p-5 pt-0 gap-2">
          <Button
            asChild
            className="flex-1"
            size="lg"
          >
            <a href={offer.affiliateUrl} target="_blank" rel="noopener noreferrer">
              Получить
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => setModalOpen(true)}
            className="border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Подробнее
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <MFOLogo name={offer.name} className="h-16 w-16 text-xl" />
              <div>
                <DialogTitle className="text-xl">{offer.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <StarRating rating={Number(avgRating)} size="md" />
                  <span className="text-sm text-muted-foreground">{avgRating} ({reviews.length} отзывов)</span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="info">Информация</TabsTrigger>
              <TabsTrigger value="terms">Условия</TabsTrigger>
              <TabsTrigger value="reviews">Отзывы ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              {/* Quick stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Wallet className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Сумма</div>
                  <div className="font-semibold text-sm">{formatAmount(offer.maxAmount)} ₽</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Срок</div>
                  <div className="font-semibold text-sm">до {offer.maxTerm} дней</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Percent className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Ставка</div>
                  <div className="font-semibold text-sm text-green-600">
                    {offer.firstLoanRate === 0 ? '0%' : 'от 0.8%'}
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <div className="text-xs text-muted-foreground">Одобрение</div>
                  <div className="font-semibold text-sm">{offer.approvalRate}%</div>
                </div>
              </div>

              {/* Features */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Особенности</h4>
                <div className="flex flex-wrap gap-2">
                  {features.map((feature) => {
                    const config = featureLabels[feature];
                    if (!config) return null;
                    return (
                      <Badge key={feature} variant="secondary" className="bg-primary/10 text-primary">
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              {/* Editor note */}
              {offer.editorNote && (
                <div className="bg-primary/5 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-foreground mb-1">Мнение редакции</h4>
                      <p className="text-sm text-muted-foreground">{offer.editorNote}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick info */}
              <div className="flex flex-wrap gap-3">
                {offer.badCreditOk && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                    С плохой КИ
                  </div>
                )}
                {offer.noCalls && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneOff className="h-4 w-4 text-green-600" />
                    Без звонков
                  </div>
                )}
                {offer.roundTheClock && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Moon className="h-4 w-4 text-green-600" />
                    Круглосуточно
                  </div>
                )}
              </div>

              <Button asChild className="w-full" size="lg">
                <a href={offer.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Получить займ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="terms" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Сумма займа</span>
                  <span className="font-medium">{formatAmount(offer.minAmount)} – {formatAmount(offer.maxAmount)} ₽</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Срок займа</span>
                  <span className="font-medium">{offer.minTerm} – {offer.maxTerm} дней</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Ставка (первый займ)</span>
                  <span className="font-medium text-green-600">
                    {offer.firstLoanRate === 0 ? '0%' : `${offer.firstLoanRate || offer.baseRate}%`}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Базовая ставка</span>
                  <span className="font-medium">{offer.baseRate}% в день</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Время решения</span>
                  <span className="font-medium">{formatDecisionTime(offer.decisionTime)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Процент одобрения</span>
                  <span className="font-medium">{offer.approvalRate}%</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Минимальный возраст</span>
                  <span className="font-medium">от {offer.minAge} лет</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-muted-foreground">Документы</span>
                  <span className="font-medium">{documents.map(d => {
                    const labels: Record<string, string> = { passport: 'Паспорт', inn: 'ИНН', snils: 'СНИЛС', driver_license: 'ВУ' };
                    return labels[d] || d;
                  }).join(', ')}</span>
                </div>
              </div>

              <Button asChild className="w-full" size="lg">
                <a href={offer.affiliateUrl} target="_blank" rel="noopener noreferrer">
                  Получить займ
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-4">
              {reviews.length > 0 ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <StarRating rating={Number(avgRating)} size="md" />
                    <span className="font-medium">{avgRating}</span>
                    <span className="text-muted-foreground">на основе {reviews.length} отзывов</span>
                  </div>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-2 opacity-20" />
                  <p>Пока нет отзывов</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
