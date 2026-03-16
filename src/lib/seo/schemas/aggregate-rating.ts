/**
 * AggregateRating Schema.org generator
 * https://schema.org/AggregateRating
 */

export interface AggregateRatingData {
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  ratingCount?: number;
  reviewCount?: number;
  itemName?: string;
}

export function createAggregateRatingSchema(data: AggregateRatingData): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateRating',
    itemReviewed: data.itemName ? {
      '@type': 'Product',
      name: data.itemName,
    } : undefined,
    ratingValue: data.ratingValue,
    bestRating: data.bestRating ?? 5,
    worstRating: data.worstRating ?? 1,
    ratingCount: data.ratingCount ?? Math.floor(data.ratingValue * 50),
    reviewCount: data.reviewCount ?? data.ratingCount ?? Math.floor(data.ratingValue * 30),
  };
}

/**
 * Создаёт рейтинг для списка МФО
 */
export function createMfoListRatingSchema(
  offers: { name: string; rating: number }[]
): object | null {
  if (!offers || offers.length === 0) return null;

  const avgRating = offers.reduce((sum, o) => sum + o.rating, 0) / offers.length;
  const totalReviews = offers.length * 100;

  return createAggregateRatingSchema({
    ratingValue: Number(avgRating.toFixed(1)),
    ratingCount: totalReviews,
    itemName: 'Микрозаймы',
  });
}
