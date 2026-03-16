'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Loader2,
  Lightbulb,
  Target,
  Flame,
  Snowflake,
  Calendar,
  Wallet,
  ArrowDown,
  ArrowUp,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface Debt {
  id: string;
  name: string;
  creditor?: string;
  amount: number;
  interestRate: number;
  monthlyPayment?: number;
  remainingAmount?: number;
  type: string;
  status: string;
  dueDate?: Date;
  notes?: string;
  createdAt: Date;
}

interface AnalysisResult {
  plan: string;
  method: string;
  recommendations: string[];
  consolidationOpportunity: boolean;
  monthlySavings: number;
  totalInterestSaved: number;
  payoffOrder: Array<{
    debtId: string;
    debtName: string;
    priority: number;
    reason: string;
  }>;
}

const DEBT_TYPES = [
  { value: 'mfo', label: 'МФО', color: 'bg-red-500' },
  { value: 'bank', label: 'Банк', color: 'bg-blue-500' },
  { value: 'credit_card', label: 'Кредитная карта', color: 'bg-purple-500' },
  { value: 'personal', label: 'Частный займ', color: 'bg-orange-500' },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active: { label: 'Активен', color: 'bg-blue-500' },
  overdue: { label: 'Просрочен', color: 'bg-red-500' },
  paid: { label: 'Погашен', color: 'bg-green-500' },
};

const COLORS = ['#3b82f6', '#ef4444', '#a855f7', '#f97316', '#22c55e', '#eab308'];

export function DebtTrackerContent() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState('50000');

  const [formData, setFormData] = useState({
    name: '',
    creditor: '',
    amount: '',
    interestRate: '',
    monthlyPayment: '',
    type: 'personal',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      const res = await fetch('/api/debts');
      const data = await res.json();
      setDebts(data || []);
    } catch (error) {
      console.error('Error loading debts:', error);
      toast.error('Ошибка загрузки долгов');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = '/api/debts';
      const method = editingDebt ? 'PATCH' : 'POST';
      const body = editingDebt ? { id: editingDebt.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(editingDebt ? 'Долг обновлён' : 'Долг добавлен');
        setIsDialogOpen(false);
        setEditingDebt(null);
        resetForm();
        loadDebts();
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить этот долг?')) return;
    try {
      const res = await fetch(`/api/debts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Долг удалён');
        loadDebts();
      }
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-debt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyIncome: parseFloat(monthlyIncome) }),
      });
      const data = await res.json();
      setAnalysis(data);
      toast.success('Анализ завершён');
    } catch (error) {
      toast.error('Ошибка анализа');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      creditor: '',
      amount: '',
      interestRate: '',
      monthlyPayment: '',
      type: 'personal',
      status: 'active',
      notes: '',
    });
  };

  const openEditDialog = (debt: Debt) => {
    setEditingDebt(debt);
    setFormData({
      name: debt.name,
      creditor: debt.creditor || '',
      amount: debt.amount.toString(),
      interestRate: debt.interestRate.toString(),
      monthlyPayment: debt.monthlyPayment?.toString() || '',
      type: debt.type,
      status: debt.status,
      notes: debt.notes || '',
    });
    setIsDialogOpen(true);
  };

  // Chart data
  const pieData = debts
    .filter(d => d.status !== 'paid')
    .map(d => ({
      name: d.name,
      value: d.amount,
      type: d.type,
    }));

  // Total stats
  const totalDebt = debts
    .filter(d => d.status !== 'paid')
    .reduce((sum, d) => sum + d.amount, 0);

  const monthlyPayments = debts
    .filter(d => d.status !== 'paid')
    .reduce((sum, d) => sum + (d.monthlyPayment || 0), 0);

  const avgRate = debts.length > 0
    ? debts.filter(d => d.status !== 'paid').reduce((sum, d) => sum + d.interestRate, 0) / debts.filter(d => d.status !== 'paid').length
    : 0;

  // Прогноз погашения по месяцам
  const payoffForecast = useMemo(() => {
    if (!analysis || debts.length === 0) return [];
    
    const activeDebts = debts.filter(d => d.status !== 'paid');
    const total = activeDebts.reduce((sum, d) => sum + d.amount, 0);
    const monthly = parseFloat(monthlyIncome) || 50000;
    const availableForDebt = monthly * 0.4; // 40% от дохода на долги
    
    const months = [];
    let remaining = total;
    
    for (let i = 0; i < 12 && remaining > 0; i++) {
      const payment = Math.min(availableForDebt, remaining);
      remaining = Math.max(0, remaining - payment);
      months.push({
        month: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'][i] || `М${i + 1}`,
        total: Math.round(remaining),
        paid: Math.round(total - remaining),
        payment: Math.round(payment),
      });
    }
    
    return months;
  }, [analysis, debts, monthlyIncome]);

  // Данные для шкал погашения
  const payoffProgress = useMemo(() => {
    if (!analysis?.payoffOrder) return [];
    
    return analysis.payoffOrder.map((item, index) => {
      const debt = debts.find(d => d.id === item.debtId);
      if (!debt) return null;
      
      const monthly = parseFloat(monthlyIncome) || 50000;
      const availableForDebt = monthly * 0.4;
      const monthsToPayoff = Math.ceil(debt.amount / availableForDebt);
      const progressPercent = Math.min(100, (debt.monthlyPayment || 0) / debt.amount * 100 * 3);
      
      return {
        ...item,
        debt,
        monthsToPayoff,
        progressPercent: Math.max(5, Math.min(95, progressPercent + index * 10)),
        color: COLORS[index % COLORS.length],
      };
    }).filter(Boolean);
  }, [analysis, debts, monthlyIncome]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Общий долг</p>
                <p className="text-2xl font-bold">{totalDebt.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Платёж/мес</p>
                <p className="text-2xl font-bold">{monthlyPayments.toLocaleString('ru-RU')} ₽</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <Target className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-orange-500/10 to-red-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Средняя ставка</p>
                <p className="text-2xl font-bold">{avgRate.toFixed(1)}%</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Активных долгов</p>
                <p className="text-2xl font-bold">{debts.filter(d => d.status !== 'paid').length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Debt Button & Income Input */}
      <div className="flex flex-wrap gap-4 items-end">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Добавить долг
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingDebt ? 'Редактировать долг' : 'Новый долг'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Например: Кредит на авто"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="creditor">Кредитор</Label>
                <Input
                  id="creditor"
                  value={formData.creditor}
                  onChange={(e) => setFormData({ ...formData, creditor: e.target.value })}
                  placeholder="Банк или МФО"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Сумма (₽) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="100000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate">Ставка (% год.) *</Label>
                  <Input
                    id="rate"
                    type="number"
                    step="0.1"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="15"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment">Платёж/мес (₽)</Label>
                  <Input
                    id="payment"
                    type="number"
                    value={formData.monthlyPayment}
                    onChange={(e) => setFormData({ ...formData, monthlyPayment: e.target.value })}
                    placeholder="5000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Тип</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DEBT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Статус</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => setFormData({ ...formData, status: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="overdue">Просрочен</SelectItem>
                    <SelectItem value="paid">Погашен</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Заметки</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Дополнительная информация"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setEditingDebt(null);
                    resetForm();
                  }}
                >
                  Отмена
                </Button>
                <Button type="submit">
                  {editingDebt ? 'Сохранить' : 'Добавить'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

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
          onClick={handleAnalyze}
          disabled={isAnalyzing || debts.length === 0}
          className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          AI-анализ
        </Button>
      </div>

      {/* Charts & Debts Grid */}
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Pie Chart */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm">Структура долгов</CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Нет данных
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debts List */}
        <div className="space-y-3">
          {debts.length === 0 ? (
            <Card className="border-border border-dashed">
              <CardContent className="p-8 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Нет долгов</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Добавьте информацию о ваших кредитах и займах
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить первый долг
                </Button>
              </CardContent>
            </Card>
          ) : (
            debts.map((debt) => {
              const typeInfo = DEBT_TYPES.find(t => t.value === debt.type);
              const statusInfo = STATUS_LABELS[debt.status];

              return (
                <Card key={debt.id} className="border-border hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{debt.name}</h3>
                          <Badge className={statusInfo?.color}>
                            {statusInfo?.label}
                          </Badge>
                        </div>
                        {debt.creditor && (
                          <p className="text-sm text-muted-foreground">{debt.creditor}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                          <span className="font-medium">{debt.amount.toLocaleString('ru-RU')} ₽</span>
                          <span className="text-muted-foreground">{debt.interestRate}% год.</span>
                          {debt.monthlyPayment && (
                            <span className="text-muted-foreground">
                              {debt.monthlyPayment.toLocaleString('ru-RU')} ₽/мес
                            </span>
                          )}
                        </div>
                        <Badge variant="outline" className="mt-2">
                          {typeInfo?.label}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(debt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(debt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* AI Analysis Result with Beautiful Visualization */}
      {analysis && (
        <div className="space-y-6">
          {/* Method Header */}
          <Card className="border-primary/30 overflow-hidden">
            <div className={cn(
              "h-1",
              analysis.method === 'snowball' 
                ? "bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500"
                : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
            )} />
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn(
                  "h-14 w-14 rounded-2xl flex items-center justify-center",
                  analysis.method === 'snowball' ? "bg-blue-500/20" : "bg-orange-500/20"
                )}>
                  {analysis.method === 'snowball' ? (
                    <Snowflake className="h-7 w-7 text-blue-500" />
                  ) : (
                    <Flame className="h-7 w-7 text-orange-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-bold">
                      {analysis.method === 'snowball' ? 'Метод снежного кома' : 'Метод лавины'}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {analysis.method === 'snowball' ? 'Быстрые победы' : 'Минимум процентов'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{analysis.plan}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payoff Timeline with Progress Bars */}
          {payoffProgress.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  План погашения по шагам
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {payoffProgress.map((item, index) => {
                  if (!item) return null;
                  const { debt, monthsToPayoff, color, reason } = item;
                  
                  return (
                    <div key={item.debtId} className="relative">
                      {/* Connector Line */}
                      {index < payoffProgress.length - 1 && (
                        <div 
                          className="absolute left-5 top-12 w-0.5 h-8 bg-gradient-to-b from-primary/50 to-transparent"
                          style={{ zIndex: 0 }}
                        />
                      )}
                      
                      <div className="relative flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-transparent border border-border/50">
                        {/* Priority Number */}
                        <div 
                          className="h-10 w-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {index + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{debt.name}</h4>
                              <p className="text-xs text-muted-foreground">{reason}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold">{debt.amount.toLocaleString('ru-RU')} ₽</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                ~{monthsToPayoff} мес.
                              </p>
                            </div>
                          </div>
                          
                          {/* Progress Bar with Animation */}
                          <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out"
                              style={{ 
                                width: `${item.progressPercent}%`,
                                background: `linear-gradient(90deg, ${color}, ${color}dd)`,
                              }}
                            >
                              {/* Shimmer Effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                            </div>
                            
                            {/* Markers */}
                            <div className="absolute inset-y-0 flex items-center">
                              <div className="w-full flex justify-between px-1">
                                {[25, 50, 75].map(marker => (
                                  <div 
                                    key={marker}
                                    className="h-1.5 w-0.5 rounded-full bg-white/30"
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Progress Labels */}
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>0%</span>
                            <span className="text-primary font-medium">
                              {Math.round(item.progressPercent)}% прогресс
                            </span>
                            <span>100%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Forecast Chart */}
          {payoffForecast.length > 0 && (
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  Прогноз погашения на 12 месяцев
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={payoffForecast}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={12}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value: number) => `${value.toLocaleString('ru-RU')} ₽`}
                    />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorTotal)"
                      name="Остаток долга"
                    />
                    <Area
                      type="monotone"
                      dataKey="paid"
                      stroke="#22c55e"
                      fillOpacity={1}
                      fill="url(#colorPaid)"
                      name="Погашено"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="border-border bg-gradient-to-br from-green-500/10 to-emerald-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Экономия/мес</p>
                    <p className="text-xl font-bold text-green-500">
                      +{analysis.monthlySavings.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <ArrowDown className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Экономия на %</p>
                    <p className="text-xl font-bold text-blue-500">
                      {analysis.totalInterestSaved.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Target className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Консолидация</p>
                    <p className="text-xl font-bold">
                      {analysis.consolidationOpportunity ? 'Доступна' : 'Не требуется'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                Рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
