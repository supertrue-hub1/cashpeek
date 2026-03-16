import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus } from 'lucide-react';
import type { OfferData } from '@/lib/seo-hub/types';

interface ComparisonTableProps {
  offers: OfferData[];
  cityName?: string;
}

export function ComparisonTable({ offers, cityName }: ComparisonTableProps) {
  // Защита от undefined
  const safeOffers = offers || [];
  
  // Берём топ-5 офферов для сравнения
  const topOffers = safeOffers.slice(0, 5);
  
  if (topOffers.length === 0) {
    return null;
  }
  
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('ru-RU').format(value);
  };
  
  return (
    <section className="py-8 lg:py-12 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Сравнение условий
          </h2>
          <p className="text-muted-foreground">
            Сравните ключевые параметры {cityName ? `МФО ${cityName}` : 'МФО'}
          </p>
        </div>
        
        {/* Table - Horizontal scroll on mobile */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold min-w-[140px]">МФО</TableHead>
                  <TableHead className="font-semibold text-center">Сумма</TableHead>
                  <TableHead className="font-semibold text-center">Срок</TableHead>
                  <TableHead className="font-semibold text-center">Ставка</TableHead>
                  <TableHead className="font-semibold text-center">Решение</TableHead>
                  <TableHead className="font-semibold text-center">Одобрение</TableHead>
                  <TableHead className="font-semibold text-center">Плохая КИ</TableHead>
                  <TableHead className="font-semibold text-center">24/7</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topOffers.map((offer) => (
                  <TableRow key={offer.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {offer.logo ? (
                          <img 
                            src={offer.logo} 
                            alt={offer.name}
                            className="h-8 w-8 rounded-lg object-contain"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {offer.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{offer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {formatAmount(offer.minAmount)} – {formatAmount(offer.maxAmount)} ₽
                    </TableCell>
                    <TableCell className="text-center">
                      {offer.minTerm} – {offer.maxTerm} дн.
                    </TableCell>
                    <TableCell className="text-center">
                      {offer.firstLoanRate === 0 ? (
                        <Badge className="bg-green-600">0%</Badge>
                      ) : (
                        <span>от {offer.baseRate}%</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {offer.decisionTime === 0 ? (
                        <Badge variant="secondary">Мгновенно</Badge>
                      ) : (
                        <span>{offer.decisionTime} мин</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={offer.approvalRate >= 90 ? 'text-green-600 font-medium' : ''}>
                        {offer.approvalRate}%
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {offer.badCreditOk ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="h-5 w-5 text-red-400 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {offer.roundTheClock ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Check className="h-4 w-4 text-green-600" />
            <span>Доступно</span>
          </div>
          <div className="flex items-center gap-1">
            <X className="h-4 w-4 text-red-400" />
            <span>Недоступно</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="h-4 w-4" />
            <span>Нет данных</span>
          </div>
        </div>
      </div>
    </section>
  );
}
