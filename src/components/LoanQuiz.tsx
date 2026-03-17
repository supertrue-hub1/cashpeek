'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Calculator, 
  Calendar, 
  Search, 
  ArrowRight, 
  ArrowLeft,
  Check,
  Loader2,
  Star,
  Clock,
  TrendingUp,
  BadgePercent,
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
    return { label: '0% первый займ', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' }
  }
  if (rate <= 0.5) {
    return { label: `${rate}%`, className: 'bg-blue-100 text-blue-700 border-blue-200' }
  }
  return { label: `${rate}%`, className: 'bg-gray-100 text-gray-700 border-gray-200' }
}

// Шаг 1: Выбор суммы
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
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Сколько вам нужно?</h2>
        <p className="text-muted-foreground">Выберите сумму займа</p>
      </div>

      <div className="text-center">
        <div className="text-5xl font-bold text-primary mb-2">
          {formatAmount(amount)} ₽
        </div>
        <p className="text-sm text-muted-foreground">
          от 1 000 до 30 000 ₽
        </p>
      </div>

      <div className="px-4">
        <Slider
          value={[amount]}
          onValueChange={([value]) => setAmount(value)}
          min={1000}
          max={30000}
          step={1000}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 000 ₽</span>
          <span>30 000 ₽</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        {[5000, 10000, 15000, 20000, 25000].map((val) => (
          <Button
            key={val}
            variant={amount === val ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAmount(val)}
            className="rounded-full"
          >
            {formatAmount(val)}
          </Button>
        ))}
      </div>

      <Button 
        onClick={onNext}
        className="w-full h-12 text-lg"
        size="lg"
      >
        Далее
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </motion.div>
  )
}

// Шаг 2: Выбор срока
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
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">На какой срок?</h2>
        <p className="text-muted-foreground">Выберите количество дней</p>
      </div>

      <div className="text-center">
        <div className="text-5xl font-bold text-primary mb-2">
          {term} {term === 1 ? 'день' : term <= 4 ? 'дня' : 'дней'}
        </div>
        <p className="text-sm text-muted-foreground">
          от 1 до 30 дней
        </p>
      </div>

      <div className="px-4">
        <Slider
          value={[term]}
          onValueChange={([value]) => setTerm(value)}
          min={1}
          max={30}
          step={1}
          className="py-4"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 день</span>
          <span>30 дней</span>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        {[7, 14, 21, 30].map((val) => (
          <Button
            key={val}
            variant={term === val ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTerm(val)}
            className="rounded-full"
          >
            {val} дн.
          </Button>
        ))}
      </div>

      <div className="bg-muted/50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">К возврату (при 0% ставке):</span>
          <span className="text-xl font-bold">{formatAmount(amount)} ₽</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
          size="lg"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Назад
        </Button>
        <Button 
          onClick={onNext}
          className="flex-1 h-12 text-lg"
          size="lg"
        >
          Подобрать
          <Search className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  )
}

// Шаг 3: Поиск
function StepLoading({ amount, term }: { amount: number; term: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-center py-12 space-y-6"
    >
      <div className="relative inline-block">
        <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
        <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-yellow-500 animate-pulse" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Подбираем лучшие займы</h2>
        <p className="text-muted-foreground">
          Анализируем {term} предложений за {amount.toLocaleString()} ₽
        </p>
      </div>

      <div className="flex justify-center gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-primary animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </motion.div>
  )
}

// Шаг 4: Результаты
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
        className="text-center py-12 space-y-4"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
          <Search className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold">Ничего не найдено</h2>
        <p className="text-muted-foreground">
          Попробуйте изменить параметры займа
        </p>
        <Button onClick={onReset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Начать заново
        </Button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Найдено предложений: {offers.length}</h2>
          <p className="text-sm text-muted-foreground">
            для суммы {formatAmount(amount)} ₽ на {term} дней
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          Изменить
        </Button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {offers.map((offer, index) => {
            const rateBadge = getRateBadge(offer.rate)
            const isFirstLoan = offer.rate === 0
            
            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Левая часть - логотип и название */}
                      <div className="sm:w-48 p-4 flex sm:flex-col items-center gap-3 sm:border-r bg-muted/30">
                        {offer.logo ? (
                          <img 
                            src={offer.logo} 
                            alt={offer.name}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary">
                              {offer.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="text-center sm:text-left">
                          <h3 className="font-bold">{offer.name}</h3>
                          <p className="text-xs text-muted-foreground">
                            до {formatAmount(offer.maxAmount)} ₽
                          </p>
                        </div>
                      </div>

                      {/* Центр - характеристики */}
                      <div className="flex-1 p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge 
                            variant="outline" 
                            className={rateBadge.className}
                          >
                            {isFirstLoan && <Star className="w-3 h-3 mr-1" />}
                            {rateBadge.label}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {offer.approvalRate}% одобрение
                          </Badge>
                          <Badge variant="outline" className="bg-purple-50 border-purple-200 text-purple-700">
                            <Clock className="w-3 h-3 mr-1" />
                            {offer.decisionTime === 0 ? 'Мгновенно' : `${offer.decisionTime} мин`}
                          </Badge>
                          {offer.isFeatured && (
                            <Badge className="bg-yellow-500 hover:bg-yellow-600">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Рекомендуем
                            </Badge>
                          )}
                        </div>

                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-3 mb-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">К возврату:</span>
                            <span className="text-xl font-bold text-emerald-600">
                              {formatAmount(calculateRepayment(amount, offer.rate, term))} ₽
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Правая часть - кнопка */}
                      <div className="p-4 sm:w-48 flex sm:items-center justify-center bg-muted/20">
                        <a
                          href={offer.affiliateUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all"
                        >
                          Получить займ
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <div className="text-center pt-4">
        <Button variant="ghost" onClick={onReset}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Подобрать заново
        </Button>
      </div>
    </motion.div>
  )
}

// Основной компонент квиза
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
      // Имитация поиска (минимум 2 секунды для анимации)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const response = await fetch(`/api/offers/quiz?amount=${amount}&term=${term}`)
      
      if (!response.ok) {
        throw new Error('Ошибка при загрузке предложений')
      }

      const data: QuizResponse = await response.json()
      setOffers(data.offers)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка')
      setStep(2) // Возвращаемся к выбору срока
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
    <div className="w-full max-w-3xl mx-auto">
      <Card className="border-2">
        <CardContent className="p-6 sm:p-8">
          {/* Прогресс */}
          {step < 4 && (
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    s <= step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Контент шагов */}
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

          {/* Ошибка */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
