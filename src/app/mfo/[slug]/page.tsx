import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { db } from '@/lib/db';
import { generateBreadcrumb } from '@/lib/seo/metadata';
import { createMfoBreadcrumb } from '@/lib/seo/schemas/breadcrumb';
import { createFinancialProductSchema } from '@/lib/seo/schemas/product';
import { createFAQSchema } from '@/lib/seo/schemas/faq';
import { getMfoTemplates } from '@/lib/seo/utils/text-templates';
import { generateMfoKeywords } from '@/lib/seo/utils/keywords';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, CreditCard, Clock, Star, ExternalLink, Phone, Mail, Shield, Zap, Users } from 'lucide-react';
import Link from 'next/link';

// ISR: обновление каждый час
export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const mfos = await db.loanOffer.findMany({
      where: { status: 'published' },
      select: { slug: true },
      take: 200,
    });
    
    return mfos.map(mfo => ({ slug: mfo.slug }));
  } catch (error) {
    console.error('[MFO] Error generating static params:', error);
    return [];
  }
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const mfo = await db.loanOffer.findUnique({
      where: { slug, status: 'published' },
    });
    
    if (!mfo) {
      return { title: 'МФО не найдено' };
    }

    const templates = getMfoTemplates(
      mfo.name,
      mfo.minAmount,
      mfo.maxAmount,
      mfo.minTerm,
      mfo.maxTerm,
      mfo.baseRate
    );

    const keywords = generateMfoKeywords(mfo.name);
    
    return {
      title: templates.title,
      description: templates.description,
      keywords,
      alternates: {
        canonical: `https://cashpeek.ru/mfo/${mfo.slug}`,
      },
      openGraph: {
        title: templates.title,
        description: templates.description,
        type: 'website',
        url: `https://cashpeek.ru/mfo/${mfo.slug}`,
        images: mfo.logo ? [{ url: mfo.logo }] : undefined,
      },
    };
  } catch (error) {
    console.error('[MFO] Error generating metadata:', error);
    return { title: 'МФО' };
  }
}

async function getMfoData(slug: string) {
  try {
    return await db.loanOffer.findUnique({
      where: { slug, status: 'published' },
      include: {
        tags: { include: { tag: true } },
      },
    });
  } catch (error) {
    console.error('[MFO] Error fetching MFO:', error);
    return null;
  }
}

// FAQ для МФО
function getMfoFaq(mfoName: string) {
  return [
    {
      question: `Как получить займ в ${mfoName}?`,
      answer: `Для получения займа в ${mfoName} перейдите на официальный сайт, заполните онлайн-заявку (потребуется паспорт и банковская карта) и дождитесь решения. Обычно это занимает 5-15 минут.`,
    },
    {
      question: 'Какие документы нужны?',
      answer: 'Для оформления займа нужен только паспорт гражданина РФ. Дополнительно может потребоваться СНИЛС или ИНН для подтверждения личности.',
    },
    {
      question: 'Можно ли погасить займ досрочно?',
      answer: 'Да, досрочное погашение доступно в любой момент без штрафов и комиссий. Вы платите проценты только за фактические дни использования займа.',
    },
    {
      question: 'Как быстро придут деньги?',
      answer: 'После одобрения заявки деньги зачисляются на банковскую карту мгновенно или в течение 1-5 минут.',
    },
  ];
}
  
export default async function MfoPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  const mfo = await getMfoData(slug);
  
  if (!mfo) {
    notFound();
  }
  
  // Генерируем JSON-LD схемы
  const breadcrumbSchema = createMfoBreadcrumb(mfo.slug, mfo.name);
  const productSchema = createFinancialProductSchema({
    name: mfo.name,
    slug: mfo.slug,
    description: mfo.customDescription || undefined,
    logo: mfo.logo || undefined,
    rating: mfo.rating,
    minAmount: mfo.minAmount,
    maxAmount: mfo.maxAmount,
    minTerm: mfo.minTerm,
    maxTerm: mfo.maxTerm,
    baseRate: mfo.baseRate,
    firstLoanRate: mfo.firstLoanRate ?? undefined,
    affiliateUrl: mfo.affiliateUrl || '#',
  });
  const faqSchema = createFAQSchema(getMfoFaq(mfo.name));

  // Комбинируем схемы
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbSchema, productSchema, faqSchema].filter(Boolean),
  };

  // Парсим JSON поля
  const parseJsonArray = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const features = parseJsonArray(mfo.features);
  const documents = parseJsonArray(mfo.documents);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* JSON-LD Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      
      <Header />
      
      <main className="flex-1">
        {/* MFO Header */}
        <section className="bg-gradient-to-b from-muted to-background border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
              <Link href="/" className="hover:text-primary transition-colors">Главная</Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/mfo" className="hover:text-primary transition-colors">МФО</Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground font-medium">{mfo.name}</span>
            </nav>
            
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Logo */}
              {mfo.logo && (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-background shadow-sm flex items-center justify-center p-2 border">
                  <img src={mfo.logo} alt={mfo.name} className="max-w-full max-h-full object-contain" />
                </div>
              )}
              
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {mfo.name}
                </h1>
                
                {mfo.customDescription && (
                  <p className="text-lg text-muted-foreground mb-4">
                    {mfo.customDescription}
                  </p>
                )}
                
                {/* Stats */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-yellow-500" />
                    Рейтинг: {mfo.rating}/5
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" />
                    {mfo.minAmount?.toLocaleString('ru-RU')} - {mfo.maxAmount?.toLocaleString('ru-RU')} ₽
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {mfo.decisionTime} мин
                  </Badge>
                  {mfo.firstLoanRate === 0 && (
                    <Badge className="flex items-center gap-1.5 bg-green-600 dark:bg-green-700">
                      <Zap className="h-3.5 w-3.5" />
                      0% первый займ
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* CTA */}
              <div className="flex flex-col gap-2 min-w-[180px]">
                <Button size="lg" asChild className="gap-2">
                  <a href={mfo.affiliateUrl || '#'} target="_blank" rel="noopener noreferrer nofollow">
                    Получить займ
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/mfo/${slug}/zayavka`}>
                    Подробнее
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              {/* Main info */}
              <div className="space-y-8">
                {/* Conditions */}
                <div className="bg-muted rounded-xl p-6">
                  <h2 className="text-xl font-bold text-foreground mb-4">Условия займа</h2>
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-background rounded-lg p-3 border">
                      <dt className="text-sm text-muted-foreground">Сумма займа</dt>
                      <dd className="font-semibold text-foreground text-lg">
                        {mfo.minAmount?.toLocaleString('ru-RU')} - {mfo.maxAmount?.toLocaleString('ru-RU')} ₽
                      </dd>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <dt className="text-sm text-muted-foreground">Срок займа</dt>
                      <dd className="font-semibold text-foreground text-lg">
                        {mfo.minTerm} - {mfo.maxTerm} дней
                      </dd>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <dt className="text-sm text-muted-foreground">Ставка</dt>
                      <dd className="font-semibold text-foreground text-lg">
                        от {mfo.firstLoanRate ?? mfo.baseRate}% в день
                      </dd>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <dt className="text-sm text-muted-foreground">Время решения</dt>
                      <dd className="font-semibold text-foreground text-lg">
                        {mfo.decisionTime} мин
                      </dd>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <dt className="text-sm text-muted-foreground">Возраст</dt>
                      <dd className="font-semibold text-foreground text-lg">
                        от {mfo.minAge} лет
                      </dd>
                    </div>
                    <div className="bg-background rounded-lg p-3 border">
                      <dt className="text-sm text-muted-foreground">Одобрение</dt>
                      <dd className="font-semibold text-foreground text-lg">
                        ~{mfo.approvalRate}%
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Features */}
                {features.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-4">Особенности</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <Shield className="h-4 w-4 text-green-600 dark:text-green-500" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Requirements */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Требования к заёмщику</h2>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-green-600 dark:text-green-500">✓</span>
                      <span>Гражданство РФ</span>
                    </li>
                    <li className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-green-600 dark:text-green-500">✓</span>
                      <span>Возраст от {mfo.minAge} лет</span>
                    </li>
                    <li className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <span className="text-green-600 dark:text-green-500">✓</span>
                      <span>Паспорт гражданина РФ</span>
                    </li>
                    {mfo.badCreditOk && (
                      <li className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-green-600 dark:text-green-500">✓</span>
                        <span className="text-green-800 dark:text-green-300">Плохая кредитная история — OK</span>
                      </li>
                    )}
                    {mfo.noCalls && (
                      <li className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                        <span className="text-green-600 dark:text-green-500">✓</span>
                        <span className="text-green-800 dark:text-green-300">Без звонков и подтверждений</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* FAQ */}
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">Часто задаваемые вопросы</h2>
                  <div className="space-y-4">
                    {getMfoFaq(mfo.name).map((item, i) => (
                      <details key={i} className="group bg-muted rounded-lg">
                        <summary className="flex items-center justify-between cursor-pointer p-4 font-medium">
                          {item.question}
                          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                        </summary>
                        <p className="px-4 pb-4 text-muted-foreground">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <aside>
                <div className="sticky top-24 space-y-6">
                  {/* Quick CTA */}
                  <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-6 border border-primary/10">
                    <h3 className="font-semibold text-foreground mb-3">Быстрая заявка</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Заполните заявку за 5 минут и получите деньги на карту
                    </p>
                    <Button className="w-full gap-2" asChild>
                      <a href={mfo.affiliateUrl || '#'} target="_blank" rel="noopener noreferrer nofollow">
                        Получить {mfo.maxAmount?.toLocaleString('ru-RU')} ₽
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>

                  {/* Stats */}
                  <div className="bg-muted rounded-xl p-6">
                    <h3 className="font-semibold text-foreground mb-3">Статистика</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Рейтинг</span>
                        <span className="font-semibold">{mfo.rating}/5</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Одобрение</span>
                        <span className="font-semibold text-green-600 dark:text-green-500">~{mfo.approvalRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Время</span>
                        <span className="font-semibold">{mfo.decisionTime} мин</span>
                      </div>
                    </div>
                  </div>

                  {/* Documents */}
                  {documents.length > 0 && (
                    <div className="bg-muted rounded-xl p-6">
                      <h3 className="font-semibold text-foreground mb-3">Документы</h3>
                      <ul className="space-y-2">
                        {documents.map((doc, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="text-primary">•</span>
                            {doc}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
