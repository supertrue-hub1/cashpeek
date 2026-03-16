import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { OfferCard } from '@/components/offers/offer-card';
import { DynamicContentBlock } from './DynamicContentBlock';
import { InternalLinks } from './InternalLinks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Clock, Percent, TrendingUp } from 'lucide-react';

interface SeoPageContentProps {
  pageData: {
    id: string;
    city: string;
    citySlug: string;
    loanType: string;
    loanTypeSlug: string;
    pageTitle: string;
    pageDescription: string;
    amount: string;
    amountValue: number;
    term: string;
    termSlug: string;
    priority: number;
    variationSeed: number;
  };
  offers: Array<{
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    rating: number;
    minAmount: number;
    maxAmount: number;
    minTerm: number;
    maxTerm: number;
    baseRate: number;
    firstLoanRate: number | null;
    decisionTime: number;
    approvalRate: number;
    isFeatured: boolean;
    isNew: boolean;
    affiliateUrl: string;
  }>;
  relatedTypes: Array<{
    loanType: string;
    loanTypeSlug: string;
    city: string;
    citySlug: string;
  }>;
  relatedCities: Array<{
    city: string;
    citySlug: string;
    loanType: string;
    loanTypeSlug: string;
  }>;
}

export function SeoPageContent({
  pageData,
  offers,
  relatedTypes,
  relatedCities,
}: SeoPageContentProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b">
          <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="max-w-4xl">
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <a href="/" className="hover:text-primary">Главная</a>
                <span>/</span>
                <a href="/zaimy" className="hover:text-primary">Займы</a>
                <span>/</span>
                <a href={`/${pageData.loanTypeSlug}`} className="hover:text-primary">
                  {pageData.loanType}
                </a>
                <span>/</span>
                <span className="text-foreground">{pageData.city}</span>
              </nav>

              {/* H1 */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {pageData.pageTitle}
              </h1>

              {/* Description */}
              <p className="text-muted-foreground text-lg mb-6">
                {pageData.pageDescription}
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <Badge variant="secondary" className="gap-1.5 py-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {pageData.city}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  {pageData.amount}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {pageData.term}
                </Badge>
                <Badge variant="secondary" className="gap-1.5 py-1.5">
                  <Percent className="h-3.5 w-3.5" />
                  от 0% первый займ
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            {/* Left Column - Offers */}
            <div className="space-y-6">
              {/* Dynamic Content Block - уникализация */}
              <DynamicContentBlock
                city={pageData.city}
                loanType={pageData.loanType}
                amount={pageData.amountValue}
                variationSeed={pageData.variationSeed}
              />

              {/* Offers List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">
                  Лучшие предложения в {pageData.city}
                </h2>
                
                {offers.length > 0 ? (
                  <div className="grid gap-4">
                    {offers.map((offer, index) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        position={index + 1}
                        showDetails
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Нет доступных предложений по заданным параметрам.
                      Попробуйте изменить сумму или срок займа.
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Detailed Description */}
              <Card>
                <CardHeader>
                  <CardTitle>О {pageData.loanType.toLowerCase()} в {pageData.city}</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <DetailedDescription
                    city={pageData.city}
                    loanType={pageData.loanType}
                    amount={pageData.amountValue}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <aside className="space-y-6">
              {/* Related Types */}
              {relatedTypes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Другие виды займов</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InternalLinks
                      links={relatedTypes.map((t) => ({
                        label: t.loanType,
                        href: `/${t.loanTypeSlug}/${t.citySlug}`,
                      }))}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Related Cities */}
              {relatedCities.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {pageData.loanType} в других городах
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InternalLinks
                      links={relatedCities.map((c) => ({
                        label: c.city,
                        href: `/${c.loanTypeSlug}/${c.citySlug}`,
                      }))}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Quick Tips */}
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">💡 Советы</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p>• Сравнивайте условия в нескольких МФО</p>
                  <p>• Проверяйте наличие лицензии ЦБ РФ</p>
                  <p>• Внимательно читайте договор</p>
                  <p>• Первый займ может быть без процентов</p>
                </CardContent>
              </Card>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Детальное описание (уникализация через город)
function DetailedDescription({
  city,
  loanType,
  amount,
}: {
  city: string;
  loanType: string;
  amount: number;
}) {
  return (
    <div className="space-y-4">
      <p>
        На этой странице собраны актуальные предложения {loanType.toLowerCase()} 
        в городе {city}. Мы проанализировали условия крупнейших микрофинансовых 
        организаций и подготовили для вас рейтинг лучших вариантов.
      </p>
      
      <p>
        {loanType} в {city} доступны для граждан РФ старше 18 лет. 
        Для оформления потребуется паспорт и СНИЛС. Сумма до {amount.toLocaleString('ru-RU')} ₽ 
        может быть получена на банковскую карту, электронный кошелёк или наличными.
      </p>
      
      <p>
        Среднее время рассмотрения заявки — от 5 до 15 минут. 
        Большинство МФО работают круглосуточно и без выходных, 
        что позволяет получить деньги в любое удобное время.
      </p>
      
      <h3>Требования к заёмщику:</h3>
      <ul>
        <li>Возраст от 18 до 75 лет</li>
        <li>Гражданство РФ</li>
        <li>Постоянная регистрация на территории России</li>
        <li>Действующий мобильный телефон</li>
        <li>Банковская карта любого банка РФ</li>
      </ul>
    </div>
  );
}
