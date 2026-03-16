import { ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OfferCard } from '@/components/offers/offer-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import type { OfferData } from '@/lib/seo-hub/types';

interface TopOffersProps {
  offers: OfferData[];
  isFallback: boolean;
  cityName: string;
}

export function TopOffers({ offers, isFallback, cityName }: TopOffersProps) {
  // Защита от undefined
  const safeOffers = offers || [];
  
  if (safeOffers.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">Предложения не найдены</h3>
        <p className="text-muted-foreground mb-4">
          К сожалению, подходящих предложений {cityName ? `в ${cityName}` : ''} не найдено.
        </p>
        <Button asChild>
          <Link href="/zaimy">Смотреть все займы</Link>
        </Button>
      </div>
    );
  }
  
  // Преобразуем OfferData в формат Offer для OfferCard
  const formattedOffers = safeOffers.map(offer => ({
    ...offer,
    // OfferCard ожидает массив строк для features
    features: offer.features || [],
    payoutMethods: offer.payoutMethods || ['card'],
    documents: offer.documents || ['passport'],
  }));
  
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Лучшие предложения
          </h2>
          <p className="text-muted-foreground">
            {safeOffers.length} МФО с высоким процентом одобрения
          </p>
        </div>
        
        {isFallback && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
            Показаны альтернативы
          </Badge>
        )}
      </div>
      
      {/* Fallback Alert */}
      {isFallback && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-300">
            Мы не нашли точных совпадений для данной категории, но подобрали лучшие альтернативные варианты.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Offers Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {formattedOffers.slice(0, 20).map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer as any}
            featured={offer.isFeatured}
          />
        ))}
      </div>
      
      {/* Show All Button */}
      {safeOffers.length >= 20 && (
        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="gap-2"
          >
            <Link href="/sravnit">
              Смотреть все предложения
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
