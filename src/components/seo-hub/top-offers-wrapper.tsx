import type { OfferData } from '@/lib/seo-hub/types';
import { TopOffers } from './top-offers';

interface TopOffersWrapperProps {
  offers: OfferData[];
  isFallback: boolean;
  cityName: string;
}

export function TopOffersWrapper({ offers, isFallback, cityName }: TopOffersWrapperProps) {
  return (
    <TopOffers 
      offers={offers} 
      isFallback={isFallback}
      cityName={cityName}
    />
  );
}
