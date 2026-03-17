'use client'

import { useState, useCallback } from 'react'
import { 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Star,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'

interface Offer {
  id: string
  name: string
  logo: string | null
  slug: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  baseRate: number
  firstLoanRate: number | null
  decisionTime: number
  approvalRate: number
  features: string | null
  affiliateUrl: string | null
  isFeatured: boolean
  rate: number
  totalRepayment: number
}

interface QuizResponse {
  offers: Offer[]
  total: number
  params: {
    amount: number
    term: number
    sort: string
  }
}

// Форматирование суммы
function formatAmount(amount: number): string {
  return amount.toLocaleString('ru-RU')
}

// Расчёт суммы к возврату
function calculateRepayment(amount: number, rate: number, term: number): number {
  return Math.round(amount + (amount * rate / 100) * term)
}

// Получение цвета ставки
function getRateBadge(rate: number) {
  if (rate === 0) {
    return { label: '0%', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  }
  if (rate <= 0.8) {
    return { label: '0.8%', className: 'bg-blue-100 text-blue-700 border-blue-200' }
  }
  return { label: `${rate}%`, className: 'bg-gray-100 text-gray-700 border-gray-200' }
}

// Шаг 1: Выбор суммы (компактный)
function StepAmount({ 
  amount, 
  setAmount, 
  onNext 
}: { 
  amount: number
  setAmount: (value: number) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-3">
    >
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold">Сколько вам нужно?</h2>
        <p className="text-xs text-muted-foreground">Выберите сумму займа</p>
      </div>

      <div className="text-center py-1">
        <div className="text-4xl font-bold text-primary">
          {formatAmount(amount)} ₽
        </div>
      </div>

      <div className="px-2">
        <Slider
          value={[amount]}
          onValueChange={([value]) => setAmount(value)}
          min={1000}
          max={30000}
          step={1000}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1 000</span>
          <span>30 000</span>
        </div>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        {[5000, 10000, 15000, 20000, 25000].map((val) => (
          <Button
            key={val}
            variant={amount === val ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAmount(val)}
            className="h-8 text-xs px-3"
          >
            {formatAmount(val)}
          </Button>
        ))}
      </div>

      <Button 
        onClick={onNext}
        className="w-full h-10 text-sm"
        size="sm"
      >
        Далее
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

// Шаг 2: Выбор срока (компактный)
function StepTerm({ 
  term, 
  setTerm, 
  amount,
  onNext,
  onBack 
}: { 
  term: number
  setTerm: (value: number) => void
  amount: number
  onNext: () => void
  onBack: () => void
}) {
  // Расчёт при ставке 0,8%
  const repayment = Math.round(amount + (amount * 0.8 / 100) * term)
  
  return (
    <div className="space-y-3">
    >
      <div className="text-center space-y-1">
        <h2 className="text-lg font-bold">На какой срок?</h2>
        <p className="text-xs text-muted-foreground">Выберите количество дней</p>
      </div>

      <div className="text-center py-1">
        <div className="text-4xl font-bold text-primary">
          {term} {term === 1 ? 'день' : term <= 4 ? 'дня' : 'дней'}
        </div>
      </div>

      <div className="px-2">
        <Slider
          value={[term]}
          onValueChange={([value]) => setTerm(value)}
          min={1}
          max={30}
          step={1}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>1 день</span>
          <span>30 дней</span>
        </div>
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">К возврату (0,8%):</span>
          <span className="text-xs font-bold text-green-600">(Первый займ 0%)</span>
        </div>
        <div className="text-xl font-bold text-emerald-600">
          {formatAmount(repayment)} ₽
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={onBack}
          className="flex-1 h-10 text-sm"
          size="sm"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Назад
        </Button>
        <Button 
          onClick={onNext}
          className="flex-1 h-10 text-sm"
          size="sm"
        >
          Подобрать
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// Шаг 3: Поиск (компактный)
function StepLoading({ amount, term }: { amount: number; term: number }) {
  return (
    <div className="text-center py-6 space-y-3">
      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
      
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Подбираем займы</h2>
        <p className="text-xs text-muted-foreground">
          {formatAmount(amount)} ₽ на {term} дней
        </p>
      </div>
    </div>
  )
}

// Шаг 4: Результаты (компактный список)
function StepResults({ 
  offers, 
  amount, 
  term,
  onReset 
}: { 
  offers: Offer[]
  amount: number
  term: number
  onReset: () => void
}) {
  if (offers.length === 0) {
    return (
      <div className="text-center py-6 space-y-3">
        <h2 className="text-lg font-bold">Ничего не найдено</h2>
        <p className="text-xs text-muted-foreground">
          Попробуйте изменить параметры
        </p>
        <Button onClick={onReset} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-3 w-3" />
          Изменить
        </Button>
      </div>
    )
  }

  // Ограничиваем 3 предложениями для компактности
  const displayOffers = offers.slice(0, 3)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="font-medium">Найдено: {offers.length}</span>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-6 text-xs text-primary hover:text-primary">
          Изменить
        </Button>
      </div>

      <div className="space-y-2">
        {displayOffers.map((offer, index) => {
          const rateBadge = getRateBadge(offer.rate)
          const isTop = index === 0
          
          return (
            <div
              key={offer.id}
              className={`flex items-center gap-2 p-2 rounded-lg border transition-shadow ${
                isTop 
                  ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800' 
                  : 'bg-card hover:shadow-sm'
              }`}
            >
                {/* Логотип */}
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                  isTop ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-muted'
                }`}>
                  {offer.logo ? (
                    <img src={offer.logo} alt={offer.name} className="w-10 h-10 object-contain" />
                  ) : (
                    <span className={`text-lg font-bold ${isTop ? 'text-orange-600' : 'text-primary'}`}>
                      {offer.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className={`font-semibold truncate ${isTop ? 'text-orange-700 dark:text-orange-400' : ''}`}>
                      {offer.name}
                    </span>
                    {isTop && (
                      <Badge className="bg-orange-500 text-white text-[10px] py-0 h-5">
                        Лучшая ставка
                      </Badge>
                    )}
                    <Badge variant="outline" className={`text-[10px] py-0 h-5 ${rateBadge.className}`}>
                      {offer.rate === 0 && <Star className="w-2.5 h-2.5 mr-0.5" />}
                      {rateBadge.label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{offer.approvalRate}% одобр.</span>
                    <span>•</span>
                    <span>{offer.decisionTime === 0 ? 'Мгновенно' : `${offer.decisionTime} мин`}</span>
                    <span>•</span>
                    <span className="font-medium text-foreground">{formatAmount(calculateRepayment(amount, offer.rate, term))} ₽</span>
                  </div>
                </div>

                {/* Кнопка */}
                <a
                  href={offer.affiliateUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`shrink-0 px-4 py-2 rounded-lg font-semibold text-sm ${
                    isTop
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
                  }`}
                >
                  Получить
                </a>
              </div>
            )
          })}
      </div>

      {offers.length > 3 && (
        <p className="text-center text-xs text-muted-foreground">
          + ещё {offers.length - 3}
        </p>
      )}
    </div>
  )
}

// Основной компонент квиза (компактный)
export default function LoanQuiz() {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState(15000)
  const [term, setTerm] = useState(14)
  const [isLoading, setIsLoading] = useState(false)
  const [offers, setOffers] = useState<Offer[]>([])
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = useCallback(async () => {
    setError(null)

    // Сначала переключаем на загрузку без анимации
    setStep(3)
    setIsLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))

      const response = await fetch(`/api/offers/quiz?amount=${amount}&term=${term}`)
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки')
      }

      const data: QuizResponse = await response.json()
      setOffers(data.offers)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка')
      setStep(2)
    } finally {
      setIsLoading(false)
    }
  }, [amount, term])

  const handleReset = () => {
    setStep(1)
    setOffers([])
    setError(null)
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-2">
        <CardContent className="p-3 sm:p-4">
          {/* Прогресс */}
          {step < 4 && (
            <div className="flex items-center gap-1.5 mb-3">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Фиксированная высота контента */}
          <div style={{ height: '300px' }}>
            {step === 1 && (
              <StepAmount
                amount={amount}
                setAmount={setAmount}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepTerm
                term={term}
                setTerm={setTerm}
                amount={amount}
                onNext={fetchOffers}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepLoading
                amount={amount}
                term={term}
              />
            )}
            {step === 4 && (
              <StepResults
                offers={offers}
                amount={amount}
                term={term}
                onReset={handleReset}
              />
            )}
          </div>

          {/* Ошибка */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs text-center">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
