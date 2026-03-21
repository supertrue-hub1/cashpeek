'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calculator, 
  Sparkles, 
  Sliders, 
  Filter, 
  RefreshCcw,
  AlertCircle,
} from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { FinancialRadar } from './financial-radar';
import { TrustScore } from './trust-score';
import { TopCategories } from './top-categories';
import { MFOCard } from './mfo-card';
import { ComparisonPanel } from './comparison-panel';
import { Quiz } from './quiz';

// ============================================
// Types
// ============================================

interface MFOResult {
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
  psk: number | null;
  approvalRate: number;
  decisionTime: number;
  firstLoanFree: boolean;
  badCreditOk: boolean;
  noCalls: boolean;
  roundTheClock: boolean;
  isAvailable: boolean;
  unavailableReason?: string;
  calculatedRate: number;
  totalRepayment: number;
  overpayment: number;
  approvalChance: number;
  smartScore: number;
  badges: string[];
  affiliateUrl: string | null;
}

interface CalculatorResponse {
  success: boolean;
  data: {
    results: MFOResult[];
    trustScore: {
      approvalChance: number;
      riskLevel: 'low' | 'medium' | 'high';
      riskColor: string;
      recommendation: string;
    };
    overpaymentIndex: number;
    smartTip: string;
    optimalDays: number;
    potentialSaving: number;
    purposes: {
      id: string;
      name: string;
      slug: string;
      icon: string;
    }[];
  };
}

// ============================================
// Component
// ============================================

export function SmartCalculator() {
  // State
  const [amount, setAmount] = React.useState(15000);
  const [days, setDays] = React.useState(14);
  const [purpose, setPurpose] = React.useState<string>('any');
  const [isLoading, setIsLoading] = React.useState(false);
  const [response, setResponse] = React.useState<CalculatorResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  
  // Quiz state
  const [showQuiz, setShowQuiz] = React.useState(false);
  const [quizCompleted, setQuizCompleted] = React.useState(false);
  
  // Comparison state
  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  
  // Filters
  const [filters, setFilters] = React.useState({
    onlyFree: false,
    onlyFast: false,
    onlyHighApproval: false,
  });

  // Fetch results
  const fetchResults = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          days, 
          purpose: purpose && purpose !== 'any' ? purpose : undefined 
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setResponse(data);
        console.log('[Calculator] Results:', data.data?.results?.length);
        // Ошибка только если результатов действительно нет
        if (!data.data?.results || data.data.results.length === 0) {
          setError('Нет доступных предложений. Попробуйте изменить параметры.');
        }
      } else {
        setError(data.error || 'Ошибка при расчёте');
      }
    } catch (err) {
      console.error('[Calculator] Error:', err);
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  }, [amount, days, purpose]);

  // Initial load
  React.useEffect(() => {
    fetchResults();
  }, []);

  // Показываем квиз через 5 секунд, если не пройден
  React.useEffect(() => {
    if (quizCompleted) return;
    
    const timer = setTimeout(() => {
      setShowQuiz(true);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [quizCompleted]);

  // Handlers
  const handleAmountChange = (value: number[]) => {
    setAmount(value[0]);
  };

  const handleDaysChange = (value: number[]) => {
    setDays(value[0]);
  };

  const handleCalculate = () => {
    fetchResults();
  };

  const handleQuizComplete = (answers: Record<string, string>) => {
    setQuizCompleted(true);
    setShowQuiz(false);
    
    // Применяем фильтры на основе ответов
    if (answers.experience === 'newbie') {
      setFilters(prev => ({ ...prev, onlyFree: true }));
    }
    if (answers.urgency === 'urgent') {
      setFilters(prev => ({ ...prev, onlyFast: true }));
    }
    if (answers.priority === 'speed') {
      setFilters(prev => ({ ...prev, onlyFast: true }));
    }
    if (answers.priority === 'rate') {
      setFilters(prev => ({ ...prev, onlyFree: true }));
    }
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, id];
    });
  };

  const handleGetLoan = (mfo: MFOResult) => {
    if (mfo.affiliateUrl) {
      const params = new URLSearchParams({
        amount: amount.toString(),
        term: days.toString(),
      });
      const url = mfo.affiliateUrl.includes('?')
        ? `${mfo.affiliateUrl}&${params.toString()}`
        : `${mfo.affiliateUrl}?${params.toString()}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filtered results - показываем все, фильтруем только по явным фильтрам
  const filteredResults = React.useMemo(() => {
    if (!response?.data.results) return [];
    
    return response.data.results.filter(mfo => {
      // Показываем все МФО, даже недоступные (они будут помечены)
      if (filters.onlyFree && !mfo.firstLoanFree) return false;
      if (filters.onlyFast && mfo.decisionTime > 10) return false;
      if (filters.onlyHighApproval && mfo.approvalChance < 85) return false;
      return true;
    });
  }, [response?.data.results, filters]);

  // Количество доступных предложений
  const availableCount = filteredResults.filter(mfo => mfo.isAvailable).length;

  // Selected MFOS for comparison
  const selectedMfos = React.useMemo(() => {
    return filteredResults.filter(mfo => compareIds.includes(mfo.id));
  }, [filteredResults, compareIds]);

  // Amount zones for visual
  const getAmountZone = (val: number) => {
    if (val <= 30000) return 'green';
    if (val <= 70000) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Quiz Popup */}
      <Quiz
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        onComplete={handleQuizComplete}
      />

      {/* Calculator Controls */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Умный калькулятор</CardTitle>
              <p className="text-sm text-muted-foreground">
                Подберите лучший займ под ваши условия
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Сумма займа */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Сумма займа
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {amount.toLocaleString('ru-RU')}
                </span>
                <span className="text-muted-foreground">₽</span>
              </div>
            </div>
            
            {/* Цветовая полоса */}
            <div className="h-2 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
              <motion.div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary shadow-lg"
                style={{ left: `${(amount / 100000) * 100}%`, transform: 'translateX(-50%) translateY(-50%)' }}
              />
            </div>
            
            <Slider
              value={[amount]}
              onValueChange={handleAmountChange}
              min={1000}
              max={100000}
              step={1000}
              className="py-2"
            />
            
            {/* Легенда */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                До 30 000 ₽
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                30 000 - 70 000 ₽
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                70 000+ ₽
              </span>
            </div>
          </div>

          {/* Срок займа */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">
                Срок займа
              </label>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">
                  {days}
                </span>
                <span className="text-muted-foreground">дней</span>
              </div>
            </div>
            
            <Slider
              value={[days]}
              onValueChange={handleDaysChange}
              min={1}
              max={30}
              step={1}
              className="py-2"
            />
            
            {/* Маркеры оптимальных сроков */}
            <div className="flex justify-between text-xs">
              {[7, 14, 21, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={cn(
                    'px-2 py-1 rounded transition-colors',
                    days === d 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {d} дн.
                </button>
              ))}
            </div>
            
            {days >= 10 && days <= 20 && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Оптимальный срок до зарплаты
              </p>
            )}
          </div>

          {/* Цель займа */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Цель займа (опционально)
            </label>
            <Select value={purpose} onValueChange={setPurpose}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите цель" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Любая цель</SelectItem>
                {response?.data.purposes.map(p => (
                  <SelectItem key={p.slug} value={p.slug}>
                    {p.icon} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Кнопка расчёта */}
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={handleCalculate}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="h-4 w-4 animate-spin" />
                Расчёт...
              </>
            ) : (
              <>
                <Calculator className="h-4 w-4" />
                Рассчитать
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && !response && (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCcw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Загрузка предложений...</p>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {response && !error && !isLoading && (
        <div className="space-y-6">
          {/* Financial Radar & Trust Score */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <FinancialRadar
                amount={amount}
                maxAmount={100000}
                riskLevel={response.data.trustScore.riskLevel}
                approvalChance={response.data.trustScore.approvalChance}
              />
            </div>
            <div>
              <TrustScore
                approvalChance={response.data.trustScore.approvalChance}
                riskColor={response.data.trustScore.riskColor}
                recommendation={response.data.trustScore.recommendation}
              />
            </div>
          </div>

          {/* Smart Tip */}
          {response.data.smartTip && (
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  {response.data.smartTip}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Индекс переплаты</p>
              <p className="text-xl font-bold text-foreground">
                {response.data.overpaymentIndex}%
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Рекомендуемый срок</p>
              <p className="text-xl font-bold text-foreground">
                {response.data.optimalDays} дней
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Потенциальная экономия</p>
              <p className="text-xl font-bold text-green-600">
                {response.data.potentialSaving.toLocaleString('ru-RU')} ₽
              </p>
            </div>
            <div className="bg-muted/50 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Доступных предложений</p>
              <p className="text-xl font-bold text-foreground">
                {availableCount} из {filteredResults.length}
              </p>
            </div>
          </div>

          {/* Top Categories */}
          {filteredResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Лучшие в категориях
              </h3>
              <TopCategories results={filteredResults} amount={amount} />
            </div>
          )}

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Фильтры:
            </span>
            
            <Button
              variant={filters.onlyFree ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, onlyFree: !prev.onlyFree }))}
              className="gap-2"
            >
              0% первый займ
            </Button>
            
            <Button
              variant={filters.onlyFast ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, onlyFast: !prev.onlyFast }))}
              className="gap-2"
            >
              До 10 минут
            </Button>
            
            <Button
              variant={filters.onlyHighApproval ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilters(prev => ({ ...prev, onlyHighApproval: !prev.onlyHighApproval }))}
              className="gap-2"
            >
              Шанс 85%+
            </Button>
            
            {(filters.onlyFree || filters.onlyFast || filters.onlyHighApproval) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ onlyFree: false, onlyFast: false, onlyHighApproval: false })}
              >
                Сбросить
              </Button>
            )}
          </div>

          {/* Results Grid */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Все предложения ({availableCount} из {filteredResults.length} доступны)
            </h3>
            
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResults.map((mfo, index) => (
                  <MFOCard
                    key={mfo.id}
                    mfo={mfo}
                    index={index}
                    amount={amount}
                    days={days}
                    isInCompare={compareIds.includes(mfo.id)}
                    onToggleCompare={() => handleToggleCompare(mfo.id)}
                    onGetLoan={() => handleGetLoan(mfo)}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Нет предложений по выбранным фильтрам
                </p>
                <Button
                  variant="link"
                  onClick={() => setFilters({ onlyFree: false, onlyFast: false, onlyHighApproval: false })}
                >
                  Сбросить фильтры
                </Button>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Comparison Panel */}
      <ComparisonPanel
        selectedMfos={selectedMfos}
        amount={amount}
        onRemove={(id) => handleToggleCompare(id)}
        onClear={() => setCompareIds([])}
      />
    </div>
  );
}
