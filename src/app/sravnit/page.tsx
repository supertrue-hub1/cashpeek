import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { SmartCalculator } from '@/components/calculator/smart-calculator';
import { Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Умный калькулятор займов — сравнение МФО онлайн',
  description: 'Инновационный калькулятор для подбора микрозаймов. Сравните условия от проверенных МФО, рассчитайте переплату и найдите лучшее предложение.',
  alternates: {
    canonical: '/sravnit',
  },
  openGraph: {
    title: 'Умный калькулятор займов — cashpeek.ru',
    description: 'Найдите лучший займ с помощью ИИ-калькулятора. Сравнение условий, расчёт переплаты, персональные рекомендации.',
  },
};

export default function ComparePage() {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-background to-muted/30 border-b">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Умный подбор займов
              </div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Найдите идеальный займ
                <span className="text-primary"> за 30 секунд</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Введите сумму и срок — мы подберём лучшие предложения от проверенных МФО
                с учётом шанса одобрения и вашей выгоды
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border">
                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Безопасно</p>
                  <p className="text-xs text-muted-foreground">Проверенные МФО</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Быстро</p>
                  <p className="text-xs text-muted-foreground">За 30 секунд</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border">
                <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Выгодно</p>
                  <p className="text-xs text-muted-foreground">0% первый займ</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 rounded-xl bg-background border">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">Умно</p>
                  <p className="text-xs text-muted-foreground">AI-подбор</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculator Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SmartCalculator />
        </section>

        {/* Info Section */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-muted/50 rounded-2xl p-6 lg:p-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Как работает умный калькулятор?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold mb-3">
                  1
                </div>
                <h3 className="font-medium text-foreground mb-2">Введите параметры</h3>
                <p className="text-sm text-muted-foreground">
                  Укажите нужную сумму и срок займа. Выберите цель — это поможет точнее подобрать предложения.
                </p>
              </div>
              
              <div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold mb-3">
                  2
                </div>
                <h3 className="font-medium text-foreground mb-2">Получите анализ</h3>
                <p className="text-sm text-muted-foreground">
                  Калькулятор рассчитает шанс одобрения, переплату и покажет лучшие предложения с учётом ваших условий.
                </p>
              </div>
              
              <div>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold mb-3">
                  3
                </div>
                <h3 className="font-medium text-foreground mb-2">Выберите лучшее</h3>
                <p className="text-sm text-muted-foreground">
                  Сравните до 3 предложений и оформите займ в выбранной МФО прямо на сайте.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

