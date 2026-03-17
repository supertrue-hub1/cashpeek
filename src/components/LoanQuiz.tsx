'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, 
  ArrowLeft,
  Loader2,
  Star,
  Clock,
  TrendingUp,
  Sparkles,
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
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-3"
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
    </motion.div>
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
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-3"
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

      <div className="flex gap-2 justify-center">
        {[7, 14, 21, 30].map((val) => (
          <Button
            key={val}
            variant={term === val ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTerm(val)}
            className="h-8 text-xs px-3"
          >
            {val} дн.
          </Button>
        ))}
      </div>

      <div className="bg-muted/50 rounded-lg p-2 text-center text-sm">
        К возврату: <span className="font-bold">{formatAmount(amount)} ₽</span>
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
    </motion.div>
  )
}

// Шаг 3: Поиск (компактный)
function StepLoading({ amount, term }: { amount: number; term: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-6 space-y-3"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
      
      <div className="space-y-1">
        <h2 className="text-lg font-bold">Подбираем займы</h2>
        <p className="text-xs text-muted-foreground">
          {formatAmount(amount)} ₽ на {term} дней
        </p>
      </div>
    </motion.div>
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-6 space-y-3"
      >
        <h2 className="text-lg font-bold">Ничего не найдено</h2>
        <p className="text-xs text-muted-foreground">
          Попробуйте изменить параметры
        </p>
        <Button onClick={onReset} size="sm" variant="outline">
          <RefreshCw className="mr-2 h-3 w-3" />
          Изменить
        </Button>
      </motion.div>
    )
  }

  // Ограничиваем 5 предложениями для компактности
  const displayOffers = offers.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium">Найдено: {offers.length} предложений</span>
        <Button variant="ghost" size="sm" onClick={onReset} className="h-6 text-xs">
          Изменить
        </Button>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
        <AnimatePresence>
          {displayOffers.map((offer, index) => {
            const rateBadge = getRateBadge(offer.rate)
            
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2 p-2 rounded-lg border bg-card hover:shadow-sm transition-shadow"
              >
                {/* Логотип */}
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  {offer.logo ? (
                    <img src={offer.logo} alt={offer.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-sm font-bold text-primary">
                      {offer.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="font-semibold text-sm truncate">{offer.name}</span>
                    <Badge variant="outline" className={`text-[10px] py-0 h-5 ${rateBadge.className}`}>
                      {offer.rate === 0 && <Star className="w-2.5 h-2.5 mr-0.5" />}
                      {rateBadge.label}
                    </Badge>
                    {offer.isFeatured && (
                      <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-200 text-[10px] py-0 h-5">
                        <Sparkles className="w-2.5 h-2.5 mr-0.5" />
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>{offer.approvalRate}% одобр.</span>
                    <span>•</span>
                    <span>{offer.decisionTime === 0 ? 'Мгновенно' : `${offer.decisionTime} мин`}</span>
                    <span>•</span>
                    <span className="font-medium">{formatAmount(calculateRepayment(amount, offer.rate, term))} ₽</span>
                  </div>
                </div>

                {/* Кнопка */}
                <a
                  href={offer.affiliateUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 px-3 py-1.5 rounded-lg font-semibold text-xs bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                >
                  Получить
                </a>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {offers.length > 5 && (
        <p className="text-center text-xs text-muted-foreground">
          + ещё {offers.length - 5} предложений
        </p>
      )}
    </motion.div>
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
    setIsLoading(true)
    setStep(3)
    setError(null)

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

          {/* Фиксированная минимальная высота для предотвращения дёргания */}
          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <StepAmount
                  key="step-1"
                  amount={amount}
                  setAmount={setAmount}
                  onNext={() => setStep(2)}
                />
              )}
              {step === 2 && (
                <StepTerm
                  key="step-2"
                  term={term}
                  setTerm={setTerm}
                  amount={amount}
                  onNext={fetchOffers}
                  onBack={() => setStep(1)}
                />
              )}
              {step === 3 && (
                <StepLoading
                  key="step-3"
                  amount={amount}
                  term={term}
                />
              )}
              {step === 4 && (
                <StepResults
                  key="step-4"
                  offers={offers}
                  amount={amount}
                  term={term}
                  onReset={handleReset}
                />
              )}
            </AnimatePresence>
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
