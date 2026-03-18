import { Scale, Star, Shield, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface HowItWorksProps {
  showFaq?: boolean;
}

const methodology = [
  {
    icon: Star,
    title: 'Отзывы заёмщиков',
    description: 'Учитываем реальные оценки людей, которые уже получили займ',
    weight: 40,
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
  },
  {
    icon: TrendingUp,
    title: 'Процент одобрения',
    description: 'Насколько лояльна МФО к заёмщикам с разной КИ',
    weight: 25,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
  },
  {
    icon: Shield,
    title: 'Надёжность',
    description: 'Проверка регистрации в ЦБ РФ, наличие лицензии, срок работы',
    weight: 20,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    icon: Scale,
    title: 'Условия займа',
    description: 'Процентная ставка, сроки, суммы, скрытые комиссии',
    weight: 15,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

const faqItems = [
  {
    question: 'Как формируется народный рейтинг?',
    answer:
      'Народный рейтинг рассчитывается на основе оценок реальных заёмщиков. Мы учитываем средний балл отзывов, их количество и давность. Чем больше свежих положительных отзывов — тем выше позиция МФО в рейтинге.',
  },
  {
    question: 'Что значит «проверенная МФО»?',
    answer:
      'Мы проверяем наличие МФО в реестре Центрального банка РФ, изучаем отзывы на сторонних площадках и анализируем историю работы организации. Значок «Проверено» означает, что МФО официально зарегистрирована и не имеет критических нареканий.',
  },
  {
    question: 'Можно ли доверять отзывам?',
    answer:
      'Мы модерируем отзывы и удаляем явную рекламу или спам. Однако помните, что отзывы — это субъективное мнение. Рекомендуем изучать несколько источников и самостоятельно оценивать условия МФО.',
  },
  {
    question: 'Как часто обновляется рейтинг?',
    answer:
      'Рейтинг обновляется в реальном времени при появлении новых отзывов. Базовые данные (процент одобрения, условия) синхронизируются с источниками ежедневно.',
  },
];

// FAQ Schema для SEO
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
};

export function HowItWorks({ showFaq = true }: HowItWorksProps) {
  return (
    <section className="py-12 sm:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Как мы считаем рейтинг
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Прозрачная методология на основе реальных данных и отзывов заёмщиков
          </p>
        </div>

        {/* Methodology Cards */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
          {methodology.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-border bg-card/50 backdrop-blur-sm p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className={`p-3 rounded-xl ${item.bgColor} w-fit mb-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {item.description}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Вес в рейтинге</span>
                  <span className="font-semibold text-foreground">{item.weight}%</span>
                </div>
                <Progress value={item.weight} className="h-2" />
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        {showFaq && (
          <div className="max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Часто задаваемые вопросы
            </h3>
            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden"
                >
                  <summary className="flex items-center justify-between cursor-pointer p-4 sm:p-5 font-medium text-foreground hover:bg-muted/50 transition-colors">
                    {item.question}
                    <span className="ml-4 text-muted-foreground group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-muted-foreground">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
