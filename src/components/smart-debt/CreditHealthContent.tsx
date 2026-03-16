'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  Loader2,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertCircle,
  Minus,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface CreditHealthScore {
  score: number;
  level: 'poor' | 'fair' | 'good' | 'excellent';
  metrics: {
    paymentDiscipline: number;
    debtLoad: number;
    creditHistory: number;
    creditMix: number;
    creditUtilization: number;
    newCredit: number;
    accountAge: number;
    totalDebt: number;
    incomeToDebt: number;
    savingsRate: number;
  };
  recommendations: string[];
  previousScore?: number;
  scoreChange?: number;
}

const LEVEL_CONFIG = {
  poor: { label: 'Плохо', color: 'text-red-500', bg: 'bg-red-500', range: '300-549' },
  fair: { label: 'Удовлетворительно', color: 'text-yellow-500', bg: 'bg-yellow-500', range: '550-649' },
  good: { label: 'Хорошо', color: 'text-blue-500', bg: 'bg-blue-500', range: '650-749' },
  excellent: { label: 'Отлично', color: 'text-green-500', bg: 'bg-green-500', range: '750-850' },
};

const METRIC_LABELS: Record<string, string> = {
  paymentDiscipline: 'Платёжная дисциплина',
  debtLoad: 'Долговая нагрузка',
  creditHistory: 'Кредитная история',
  creditMix: 'Кредитный микс',
  creditUtilization: 'Использование кредита',
  newCredit: 'Новые кредиты',
  accountAge: 'Возраст счетов',
  totalDebt: 'Общий долг',
  incomeToDebt: 'Доход к долгу',
  savingsRate: 'Норма сбережений',
};

export function CreditHealthContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('50000');
  const [healthData, setHealthData] = useState<CreditHealthScore | null>(null);

  const handleCalculate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/credit-health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyIncome: parseFloat(monthlyIncome) }),
      });

      const data = await res.json();
      setHealthData(data);
      toast.success('Оценка готова');
    } catch (error) {
      toast.error('Ошибка расчёта');
    } finally {
      setIsLoading(false);
    }
  };

  // Radar chart data
  const radarData = healthData
    ? Object.entries(healthData.metrics).map(([key, value]) => ({
        metric: METRIC_LABELS[key] || key,
        value: Math.round(value),
        fullMark: 100,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-border bg-gradient-to-br from-rose-500/10 to-orange-500/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center">
              <Heart className="h-6 w-6 text-rose-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Кредитное здоровье</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Скоринг по 10 параметрам с визуализацией и рекомендациями
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="income">Ежемесячный доход</Label>
              <Input
                id="income"
                type="number"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="50000"
              />
            </div>
            <Button
              onClick={handleCalculate}
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Heart className="h-4 w-4" />
              )}
              Оценить здоровье
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {healthData && (
        <div className="space-y-4">
          {/* Score Card */}
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Кредитный скоринг</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-bold">{healthData.score}</p>
                    {healthData.scoreChange !== undefined && healthData.scoreChange !== 0 && (
                      <span className={`text-sm flex items-center gap-1 ${healthData.scoreChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {healthData.scoreChange > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {Math.abs(healthData.scoreChange)} пунктов
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={`${LEVEL_CONFIG[healthData.level].bg} text-white text-base px-4 py-1`}>
                  {LEVEL_CONFIG[healthData.level].label}
                </Badge>
              </div>

              <div className="space-y-2">
                <Progress value={(healthData.score - 300) / 5.5} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>300 (Плохо)</span>
                  <span>550</span>
                  <span>650</span>
                  <span>750</span>
                  <span>850 (Отлично)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Анализ по параметрам</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Radar
                    name="Оценка"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Metrics Detail */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Детализация параметров</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(healthData.metrics).map(([key, value]) => {
                  const getMetricStatus = (v: number) => {
                    if (v >= 80) return { icon: CheckCircle, color: 'text-green-500' };
                    if (v >= 50) return { icon: Minus, color: 'text-yellow-500' };
                    return { icon: AlertCircle, color: 'text-red-500' };
                  };
                  const status = getMetricStatus(value);
                  const Icon = status.icon;

                  return (
                    <div key={key} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <Icon className={`h-4 w-4 ${status.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm truncate">{METRIC_LABELS[key]}</p>
                          <p className="text-sm font-medium">{Math.round(value)}</p>
                        </div>
                        <Progress value={value} className="h-1 mt-1" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Рекомендации по улучшению
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {healthData.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="text-primary">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!healthData && (
        <Card className="border-border border-dashed">
          <CardContent className="p-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Оцените кредитное здоровье</h3>
            <p className="text-sm text-muted-foreground">
              Укажите доход и нажмите "Оценить здоровье" для получения детального анализа
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
