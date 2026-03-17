'use client'

import { useState } from 'react'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Clock, Shield, CheckCircle, Percent, FileText, HelpCircle } from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqItems: FAQItem[] = [
  {
    id: 'what-is-microloan',
    question: 'Что такое микрозайм и чем он отличается от кредита?',
    answer: 'Микрозайм — это краткосрочный кредит на небольшую сумму (обычно до 30 000 ₽) сроком до 30 дней. В отличие от банковского кредита, микрозайм выдаётся быстрее (от 5 минут), с минимальным пакетом документов и чаще всего без проверки кредитной истории. Это идеальный вариант, когда деньги нужны срочно и на короткий срок.',
    category: 'Основы'
  },
  {
    id: 'how-to-get-loan',
    question: 'Как получить займ онлайн на карту?',
    answer: 'Для получения займа онлайн: 1) Выберите МФО на нашем сайте; 2) Укажите сумму и срок займа; 3) Заполните заявку с паспортными данными; 4) Дождитесь решения (обычно 5-15 минут); 5) Подпишите договор и получите деньги на карту. Весь процесс занимает 10-20 минут.',
    category: 'Оформление'
  },
  {
    id: 'documents-required',
    question: 'Какие документы нужны для оформления займа?',
    answer: 'Для оформления микрозайма обычно требуется только паспорт гражданина РФ. Некоторые МФО могут дополнительно запросить СНИЛС или ИНН. Для получения займа на карту достаточно смартфона и банковской карты. Никаких справок о доходах или поручителей не требуется.',
    category: 'Оформление'
  },
  {
    id: 'bad-credit',
    question: 'Можно ли получить займ с плохой кредитной историей?',
    answer: 'Да, многие МФО выдают займы с плохой кредитной историей или без проверки КИ. Однако условия могут быть менее выгодными — выше процентная ставка или меньше сумма. На нашем сайте есть специальный раздел «Займы без проверки КИ» с проверенными предложениями.',
    category: 'Кредитная история'
  },
  {
    id: 'first-loan-zero',
    question: 'Что такое первый займ под 0%?',
    answer: 'Первый займ под 0% — это акция большинства МФО для новых клиентов. Вы берёте займ и возвращаете только ту сумму, которую получили, без начисления процентов. Обычно это суммы до 15 000 ₽ на срок до 7-15 дней. Это отличный способ познакомиться с сервисом без финансовых рисков.',
    category: 'Акции'
  },
  {
    id: 'how-to-choose',
    question: 'Как выбрать лучший займ?',
    answer: 'При выборе займа обращайте внимание на: процентную ставку (для первого займа — 0%), сумму и срок, время рассмотрения, процент одобрения, отзывы других клиентов. Используйте наш сервис для сравнения условий разных МФО в одном месте. Также учитывайте репутацию компании и наличие лицензии ЦБ.',
    category: 'Советы'
  },
  {
    id: 'is-safe',
    question: 'Безопасно ли брать займ онлайн?',
    answer: 'Да, при соблюдении простых правил: 1) Используйте только проверенные МФО из нашего рейтинга; 2) Проверяйте лицензию ЦБ РФ на сайте регулятора; 3) Читайте условия договора перед подписанием; 4) Не передавайте данные карты третьим лицам. Все надёжные МФО используют защищённое соединение.',
    category: 'Безопасность'
  },
  {
    id: 'early-repayment',
    question: 'Как погасить займ досрочно?',
    answer: 'Большинство МФО допускают досрочное погашение без штрафов и комиссий. Для этого нужно: 1) В личном кабинете выбрать «Досрочное погашение»; 2) Перевести точную сумму на счёт МФО; 3) Дождаться подтверждения. При досрочном погашении вы платите только за фактические дни использования займа.',
    category: 'Погашение'
  },
  {
    id: 'late-payment',
    question: 'Что будет, если не вернуть займ в срок?',
    answer: 'При просрочке МФО начисляет штрафные проценты (обычно в двойном размере), могут начисляться пени за каждый день просрочки. Также информация о просрочке передаётся в бюро кредитных историй, что негативно влияет на вашу КИ. При длительной просрочке МФО может обратиться в суд. Рекомендуем всегда погашать займы вовремя.',
    category: 'Погашение'
  },
  {
    id: 'max-rate',
    question: 'Какой максимальный процент по займу?',
    answer: 'По закону максимальная ставка по микрозаймам ограничена ЦБ РФ. С 2024 года максимальная суточная ставка составляет 0,8% в день (292% годовых). Для первых займов многие МФО предлагают 0%. Средняя ставка по повторным займам — 0,5-0,8% в день. Все ставки указаны в договоре.',
    category: 'Тарифы'
  }
]

const categories = ['Все', 'Основы', 'Оформление', 'Кредитная история', 'Акции', 'Советы', 'Безопасность', 'Погашение', 'Тарифы']

export function FAQContent() {
  const [activeCategory, setActiveCategory] = useState('Все')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'Все' || item.category === activeCategory
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            Вопросы и ответы
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Часто задаваемые вопросы о займах
          </h1>
          <p className="text-muted-foreground text-lg">
            Отвечаем на популярные вопросы о микрозаймах, кредитах онлайн и МФО
          </p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto mb-10">
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">5-15 мин</span>
            </div>
            <p className="text-xs text-muted-foreground">Время рассмотрения</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Percent className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold">0%</span>
            </div>
            <p className="text-xs text-muted-foreground">Первый займ</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">Паспорт</span>
            </div>
            <p className="text-xs text-muted-foreground">Документы</p>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border border-border">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold">18+</span>
            </div>
            <p className="text-xs text-muted-foreground">Возраст</p>
          </div>
        </div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-8">
          <input
            type="text"
            placeholder="Поиск по вопросам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-colors',
                activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-3">
            {filteredItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className="rounded-2xl border border-border bg-card px-5 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                      {item.category}
                    </Badge>
                    <span>{item.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">По вашему запросу ничего не найдено</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="max-w-2xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 rounded-2xl p-6 sm:p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">
              Не нашли ответ на свой вопрос?
            </h3>
            <p className="text-muted-foreground mb-4">
              Свяжитесь с нами, и мы поможем разобраться
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="mailto:support@cashpeek.ru"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Написать нам
              </a>
              <a
                href="/sravnit"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-border bg-card text-foreground font-medium hover:bg-accent transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Подобрать займ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
