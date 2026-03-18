import { Metadata } from 'next';
import Link from 'next/link';
import { 
  Compass, 
  ShieldCheck, 
  Scale, 
  Eye, 
  RefreshCw, 
  Users, 
  Search, 
  FileCheck,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'О проекте | CashPeek — Как мы помогаем выбирать займы',
  description: 'Узнайте о миссии CashPeek: честный подбор займов, объективное сравнение МФО, безопасность данных. Мы не кредитуем — мы помогаем выбрать.',
  robots: 'index, follow',
  openGraph: {
    title: 'О проекте | CashPeek',
    description: 'Честный подбор займов, объективное сравнение МФО, безопасность данных',
    type: 'website',
  },
};

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'CashPeek';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cashpeek.ru';

// Schema.org BreadcrumbList
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Главная",
      "item": SITE_URL
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "О проекте",
      "item": `${SITE_URL}/about`
    }
  ]
};

// Schema.org AboutPage
const aboutPageSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  "name": "О проекте CashPeek",
  "description": "Информация о сервисе подбора микрозаймов CashPeek",
  "url": `${SITE_URL}/about`,
  "isPartOf": {
    "@type": "WebSite",
    "name": SITE_NAME,
    "url": SITE_URL
  },
  "mainEntity": {
    "@type": "Organization",
    "name": "ООО «Кэшпик»",
    "url": SITE_URL
  }
};

// Принципы
const principles = [
  {
    icon: Scale,
    title: 'Объективность',
    description: 'Сравниваем предложения без предвзятости. Рейтинг формируется на основе реальных условий, а не коммерческих интересов.',
  },
  {
    icon: ShieldCheck,
    title: 'Безопасность',
    description: 'Проверяем лицензии всех партнёров. Работаем только с МФО из реестра Центрального банка РФ.',
  },
  {
    icon: Eye,
    title: 'Честность',
    description: 'Показываем не только преимущества, но и ограничения. Указываем полную стоимость займа (ПСК).',
  },
];

// Этапы работы
const steps = [
  {
    icon: Search,
    title: 'Собираем данные',
    description: 'Агрегируем информацию из официальных источников и API микрофинансовых организаций.',
  },
  {
    icon: RefreshCw,
    title: 'Обновляем ежедневно',
    description: 'Условия МФО меняются. Мы следим за актуальностью ставок, сроков и требований.',
  },
  {
    icon: Users,
    title: 'Помогаем выбрать',
    description: 'Предоставляем инструменты для сравнения, но окончательное решение — за вами.',
  },
];

// Преимущества
const benefits = [
  'Экономим время на поиск и сравнение условий',
  'Показываем полную стоимость (ПСК), а не только ставку',
  'Не требуем оплату за использование сервиса',
  'Не передаём данные без вашего согласия',
  'Работаем только с лицензированными МФО',
];

export default function AboutPage() {
  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageSchema) }}
      />

      <div className="min-h-screen bg-background">
        {/* Breadcrumbs */}
        <nav className="container max-w-5xl mx-auto px-4 py-4 text-sm text-muted-foreground">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-primary transition-colors">
                Главная
              </Link>
            </li>
            <li className="text-muted-foreground/50">/</li>
            <li className="text-foreground font-medium">О проекте</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <section className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4 text-xs">
              О сервисе
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
              Навигатор в мире финансовых решений
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {SITE_NAME} — независимый сервис сравнения микрофинансовых предложений. 
              Мы помогаем пользователям принимать взвешенные решения, предоставляя 
              объективную информацию о условиях займов.
            </p>
          </div>
        </section>

        {/* Disclaimer Banner */}
        <section className="container max-w-5xl mx-auto px-4 pb-12">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 md:p-6 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <FileCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">Важно:</strong> Мы не выдаём займы и не принимаем решения о кредитовании. 
                {SITE_NAME} — это информационный сервис. Все финансовые решения вы принимаете самостоятельно.
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="container max-w-5xl mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Compass className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Наша миссия
              </h2>
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Микрофинансовый рынок перенасыщен предложениями. Десятки МФО, разные условия, 
                скрытые комиссии и запутанные договоры. Пользователю сложно разобраться 
                в этом многообразии за короткое время.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Мы создали {SITE_NAME}, чтобы <strong className="text-foreground">сэкономить время пользователей</strong> и 
                предоставить инструмент для объективного сравнения условий. Вместо того чтобы 
                открывать десятки вкладок и вручную сравнивать ставки, сроки и требования — 
                можно сделать это в одном месте.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Наша цель — не «продать» займ, а помочь вам найти оптимальное решение 
                среди проверенных предложений.
              </p>
            </div>
          </div>
        </section>

        <Separator className="max-w-5xl mx-auto" />

        {/* How We Work Section */}
        <section className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Как мы работаем
            </h2>
            <p className="text-muted-foreground mb-8">
              Прозрачность — основа доверия. Вот как устроен наш сервис.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {steps.map((step, index) => (
                <Card key={index} className="border-border/50 bg-card/50">
                  <CardContent className="p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <step.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Key point */}
            <div className="mt-8 p-4 rounded-lg bg-muted/50 border border-border/50">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Ключевой принцип:</strong> Мы не получаем комиссию 
                за «продажу» займа. Наша задача — предоставить информацию для сравнения. 
                Решение о займе всегда остаётся за вами.
              </p>
            </div>
          </div>
        </section>

        <Separator className="max-w-5xl mx-auto" />

        {/* Principles Section */}
        <section className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Наши принципы
            </h2>
            <p className="text-muted-foreground mb-8">
              Три столпа, на которых строится наша работа.
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {principles.map((principle, index) => (
                <div 
                  key={index} 
                  className="group p-6 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                    <principle.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="max-w-5xl mx-auto" />

        {/* Benefits Section */}
        <section className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Что вы получаете
            </h2>
            <p className="text-muted-foreground mb-8">
              Используя {SITE_NAME}, вы экономите время и получаете объективную информацию.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/30"
                >
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator className="max-w-5xl mx-auto" />

        {/* Legal Section */}
        <section className="container max-w-5xl mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Юридическая информация
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed">
                Сервис {SITE_NAME} принадлежит и управляется <strong className="text-foreground">ООО «Кэшпик»</strong>.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 my-4 text-sm">
                <p className="text-muted-foreground mb-2">
                  <strong className="text-foreground">Реквизиты:</strong>
                </p>
                <ul className="text-muted-foreground space-y-1">
                  <li>ОГРНИП: 326700000015242</li>
                  <li>ИНН: 702406362100</li>
                  <li>Email: <a href="mailto:support@cashpeek.ru" className="text-primary hover:underline">support@cashpeek.ru</a></li>
                </ul>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Мы соблюдаем законодательство РФ в области защиты персональных данных 
                (152-ФЗ) и не передаём информацию третьим лицам без вашего согласия.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Политика конфиденциальности
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Пользовательское соглашение
              </Link>
              <Link 
                href="/disclaimer" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline"
              >
                Отказ от ответственности
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container max-w-5xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  Готовы подобрать займ?
                </h2>
                <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                  Сравните условия проверенных МФО и выберите оптимальное предложение. 
                  Это бесплатно и занимает пару минут.
                </p>
                <Button asChild size="lg" className="gap-2">
                  <Link href="/#offers">
                    Подобрать займ
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </>
  );
}
