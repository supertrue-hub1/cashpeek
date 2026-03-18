import { Metadata } from 'next';
import { db } from '@/lib/db';
import {
  HeroRating,
  RatingTable,
  HowItWorks,
  ReviewsSection,
} from '@/components/rating';
import type { MfoRating } from '@/lib/store/use-rating-store';

export const metadata: Metadata = {
  title: 'Народный рейтинг МФО — честные отзывы и оценки заёмщиков | CashPeek',
  description:
    'Рейтинг микрофинансовых организаций на основе реальных отзывов заёмщиков. Сравнивайте МФО по народному рейтингу, проценту одобрения и условиям займа.',
  keywords: [
    'рейтинг МФО',
    'отзывы о МФО',
    'народный рейтинг МФО',
    'лучшая МФО',
    'сравнение МФО',
    'официальный рейтинг МФО',
  ],
  openGraph: {
    title: 'Народный рейтинг МФО — CashPeek',
    description:
      'Честные отзывы и оценки заёмщиков. Выбирайте лучшую МФО на основе реального опыта.',
    type: 'website',
  },
  alternates: {
    canonical: '/rating',
  },
};

// Schema.org для SEO
const ratingSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Народный рейтинг МФО',
  description: 'Рейтинг микрофинансовых организаций на основе отзывов заёмщиков',
  numberOfItems: 0, // Будет обновлено динамически
};

export default async function RatingPage() {
  // Получаем данные из БД
  const offers = await db.loanOffer.findMany({
    where: {
      status: 'published',
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      rating: true,
      approvalRate: true,
      decisionTime: true,
      minAmount: true,
      maxAmount: true,
      minTerm: true,
      maxTerm: true,
      baseRate: true,
      firstLoanRate: true,
      isFeatured: true,
      viewsCount: true,
      clicksCount: true,
    },
    orderBy: [
      { rating: 'desc' },
      { clicksCount: 'desc' },
    ],
  });

  // Преобразуем в формат для клиента
  const mfoList: MfoRating[] = offers.map((offer) => ({
    id: offer.id,
    name: offer.name,
    slug: offer.slug,
    logo: offer.logo,
    rating: offer.rating,
    reviewsCount: Math.floor(offer.clicksCount / 10), // Заглушка: кол-во отзывов
    approvalRate: offer.approvalRate,
    avgDecisionTime: offer.decisionTime,
    minAmount: offer.minAmount,
    maxAmount: offer.maxAmount,
    minTerm: offer.minTerm,
    maxTerm: offer.maxTerm,
    baseRate: offer.baseRate,
    firstLoanRate: offer.firstLoanRate,
    isVerified: offer.clicksCount > 100, // Заглушка: проверенные
    isPopular: offer.isFeatured,
    peopleRating: offer.rating, // Будет обновлено из отзывов
  }));

  // Статистика для Hero
  const stats = {
    totalMfo: offers.length,
    totalReviews: offers.reduce((sum, o) => sum + Math.floor(o.clicksCount / 10), 0),
    avgRating: offers.length > 0
      ? offers.reduce((sum, o) => sum + o.rating, 0) / offers.length
      : 0,
    verifiedMfo: offers.filter((o) => o.clicksCount > 100).length,
  };

  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            ...ratingSchema,
            numberOfItems: offers.length,
          }),
        }}
      />

      <div className="min-h-screen">
        {/* Hero Section */}
        <HeroRating
          totalMfo={stats.totalMfo}
          totalReviews={stats.totalReviews}
          avgRating={stats.avgRating}
          verifiedMfo={stats.verifiedMfo}
        />

        {/* Rating Table */}
        <RatingTable mfoList={mfoList} />

        {/* How It Works */}
        <HowItWorks />

        {/* Reviews Section */}
        <ReviewsSection showAll />
      </div>
    </>
  );
}
