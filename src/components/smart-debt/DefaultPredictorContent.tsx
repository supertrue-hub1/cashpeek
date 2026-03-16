'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  Shield,
  TrendingDown,
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface DefaultPrediction {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    name: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }>;
  prediction: string;
  recommendations: string[];
}

const RISK_CONFIG = {
  low: {
    label: 'Низкий риск',
    color: 'text-green-500',
    bg: 'bg-green-500',
    gradient: 'from-green-500 to-emerald-500',
  },
  medium: {
    label: 'Средний риск',
    color: 'text-yellow-500',
    bg: 'bg-yellow-500',
    gradient: 'from-yellow-500 to-orange-500',
  },
  high: {
    label: 'Высокий риск',
    color: 'text-orange-500',
    bg: 'bg-orange-500',
    gradient: 'from-orange-500 to-red-500',
  },
  critical: {
    label: 'Критический риск',
    color: 'text-red-500',
    bg: 'bg-red-500',
    gradient: 'from-red-500 to-rose-500',
  },
};

export function DefaultPredictorContent() {
  const [isLoading, setIsLoading] = useState(false);
  const [monthlyIncome, setMonthlyIncome] = useState('50000');
  const [prediction, setPrediction] = useState<DefaultPrediction | null>(null);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/predict-default', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyIncome: parseFloat(monthlyIncome) }),
      });

      const data = await res.json();
      setPrediction(data);
      toast.success('Прогноз готов');
    } catch (error) {
      toast.error('Ошибка прогнозирования');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-border bg-gradient-to-br from-orange-500/10 to-red-500/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold">Предиктор дефолта</h2>
              <p className="text-sm text-muted-foreground mt-1">
                AI анализирует ваши долги и оценивает риск просрочки платежей
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
              onClick={handlePredict}
              disabled={isLoading}
              className="gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Shield className="h-4 w-4" />
              )}
              Оценить риск
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prediction Result */}
      {prediction && (
        <div className="space-y-4">
          {/* Risk Score Card */}
          <Card className={`border-border bg-gradient-to-br ${RISK_CONFIG[prediction.riskLevel].gradient.replace('from-', 'from-').replace('to-', 'to-')}/10`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Риск дефолта</p>
                  <p className="text-4xl font-bold">{prediction.riskScore}%</p>
                </div>
                <Badge className={`${RISK_CONFIG[prediction.riskLevel].bg} text-white`}>
                  {RISK_CONFIG[prediction.riskLevel].label}
                </Badge>
              </div>
              <Progress value={prediction.riskScore} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Низкий</span>
                <span>Средний</span>
                <span>Высокий</span>
                <span>Критический</span>
              </div>
            </CardContent>
          </Card>

          {/* Prediction Text */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className={`h-5 w-5 mt-0.5 ${RISK_CONFIG[prediction.riskLevel].color}`} />
                <div>
                  <h4 className="font-medium">Прогноз</h4>
                  <p className="text-sm text-muted-foreground mt-1">{prediction.prediction}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Factors */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm">Факторы анализа</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {prediction.factors.map((factor, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                    {factor.impact === 'positive' ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : factor.impact === 'negative' ? (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted-foreground/20" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{factor.name}</p>
                      <p className="text-xs text-muted-foreground">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {prediction.recommendations.map((rec, i) => (
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
      {!prediction && (
        <Card className="border-border border-dashed">
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Оцените свой риск</h3>
            <p className="text-sm text-muted-foreground">
              Добавьте долги и нажмите "Оценить риск" для получения прогноза
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
