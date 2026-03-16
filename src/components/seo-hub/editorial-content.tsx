import { FileText, CheckCircle, AlertTriangle, Lightbulb, Clock, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { CategoryInfo, CityInfo } from '@/lib/seo-hub/types';

interface EditorialContentProps {
  category: CategoryInfo;
  city: CityInfo;
}

export function EditorialContent({ category, city }: EditorialContentProps) {
  // Генерируем контент на основе категории и города
  const content = generateEditorialContent(category, city);
  
  return (
    <section className="py-8 lg:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-bold text-foreground">
              Как выбрать {category.namePrepositional} {city.preposition}
            </h2>
          </div>
          
          {/* Main Content */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <p className="lead text-muted-foreground">
              {content.intro}
            </p>
            
            {/* Steps */}
            <div className="space-y-6 my-8">
              {content.steps.map((step, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                        <p className="text-muted-foreground text-sm">{step.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Tips */}
            <Card className="bg-primary/5 border-primary/20 my-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-6 w-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-3">Советы экспертов</h3>
                    <ul className="space-y-2">
                      {content.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Warning */}
            <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 my-8">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Важно помнить</h3>
                    <p className="text-sm text-muted-foreground">
                      {content.warning}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-8">
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <Clock className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">5-15</p>
                <p className="text-xs text-muted-foreground">минут на заявку</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <Shield className="h-5 w-5 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-foreground">95%</p>
                <p className="text-xs text-muted-foreground">одобрение</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <CreditCard className="h-5 w-5 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-foreground">0%</p>
                <p className="text-xs text-muted-foreground">новым клиентам</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-muted/50">
                <Badge variant="outline" className="mb-2">24/7</Badge>
                <p className="text-xs text-muted-foreground">круглосуточно</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================
// Генерация контента
// ============================================

function generateEditorialContent(category: CategoryInfo, city: CityInfo) {
  return {
    intro: `Выбор ${category.namePrepositional} ${city.preposition} требует внимательного подхода. На этой странице собраны лучшие предложения от проверенных МФО с высоким процентом одобрения. ${category.description}`,
    
    steps: [
      {
        title: 'Определите нужную сумму и срок',
        description: `Рассчитайте, сколько денег вам нужно и на какой срок. Не берите больше, чем сможете вернуть вовремя. ${city.name ? `Жители ${city.genitive} обычно берут займы на срок до 14-30 дней.` : ''}`,
      },
      {
        title: 'Сравните условия МФО',
        description: 'Обратите внимание на процентную ставку, срок одобрения и требования к заёмщику. Некоторые МФО предлагают первый займ под 0%.',
      },
      {
        title: 'Проверьте лицензию и отзывы',
        description: 'Убедитесь, что МФО включена в реестр ЦБ РФ. Почитайте отзывы других заёмщиков на независимых площадках.',
      },
      {
        title: 'Оформите онлайн-заявку',
        description: 'Заполните анкету на сайте выбранной МФО. Обычно это занимает 5-10 минут. Деньги поступят на карту после одобрения.',
      },
    ],
    
    tips: [
      'Первый займ под 0% доступен новым клиентам в большинстве МФО',
      'Погасите займ досрочно — это снизит переплату',
      'Не берите несколько займов одновременно',
      'Сохраните чеки и подтверждения платежей',
      'При просрочке свяжитесь с МФО для пролонгации',
    ],
    
    warning: `Микрозаймы — это финансовый инструмент для краткосрочных нужд. Процентная ставка может достигать 0.8% в день (292% годовых). Внимательно читайте договор перед подписанием. При невозможности вернуть займ вовремя вы можете столкнуться с ростом задолженности.`,
  };
}
