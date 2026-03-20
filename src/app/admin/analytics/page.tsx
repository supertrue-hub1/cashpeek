"use client"

import * as React from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  MousePointerClick,
  Users,
  Target,
  Calendar,
  Download,
  Loader2,
  RefreshCw,
  AlertCircle,
  BarChart3,
} from "lucide-react"
import { MetricaStats } from "@/components/admin/metrica-stats"
import { GA4Stats } from "@/components/admin/ga4-stats"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Line, LineChart, ResponsiveContainer } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Типы для данных аналитики
interface AnalyticsData {
  kpi: {
    clicks: number
    conversions: number
    cr: string
    revenue: number
    views: number
  }
  topOffers: Array<{
    rank: number
    id: string
    name: string
    clicks: number
    conversions: number
    cr: number
    epc: number
    revenue: number
    isFeatured: boolean
    rating: number
  }>
  distribution: {
    byStatus: Array<{ status: string; count: number }>
    newOffers: number
    featuredOffers: number
    totalOffers: number
    totalTags: number
    totalUsers: number
  }
  dailyData: Array<{
    date: string
    dateISO: string
    clicks: number
    conversions: number
    revenue: number
  }>
  funnel: {
    visits: number
    offerViews: number
    clicks: number
    applications: number
    approvals: number
  }
  meta: {
    period: number
    lastSync: {
      source: string
      startedAt: string
      offersUpdated: number
    } | null
  }
}

const chartConfig = {
  clicks: {
    label: "Клики",
    color: "hsl(var(--primary))",
  },
  conversions: {
    label: "Конверсии",
    color: "hsl(var(--chart-2))",
  },
  revenue: {
    label: "Доход",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

// Форматирование числа с разделителями
function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}

// Форматирование валюты
function formatCurrency(num: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(num)
}

// Цвета для офферов
const offerColors = [
  "#2563eb", "#16a34a", "#9333ea", "#ea580c", "#dc2626",
  "#0891b2", "#7c3aed", "#059669", "#d97706", "#db2777"
];

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [period, setPeriod] = React.useState("7")

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`)
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных")
      }
      
      const result: AnalyticsData = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }, [period])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Рассчитываем макс. значение для прогресс-баров
  const getMaxRevenue = () => {
    if (!data?.topOffers.length) return 100
    return Math.max(...data.topOffers.map(o => o.revenue), 1)
  }
  const maxRevenue = getMaxRevenue()

  const handlePeriodChange = (value: string) => {
    setPeriod(value)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-500 font-medium">{error}</p>
        <Button onClick={fetchData}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Повторить
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Аналитика</h1>
          <p className="text-muted-foreground">
            Статистика и показатели эффективности
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Последние 7 дней</SelectItem>
              <SelectItem value="14">Последние 14 дней</SelectItem>
              <SelectItem value="30">Последние 30 дней</SelectItem>
              <SelectItem value="90">Последние 90 дней</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      {/* KPI карточки */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего кликов</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data?.kpi.clicks || 0)}</div>
            <div className="text-xs text-muted-foreground">
              За последние {period} дней
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data?.kpi.conversions || 0)}</div>
            <div className="text-xs text-muted-foreground">
              За последние {period} дней
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CR</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.kpi.cr || '0'}%</div>
            <div className="text-xs text-muted-foreground">
              Конверсия из клика в заявку
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Оценочный доход</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data?.kpi.revenue || 0)}</div>
            <div className="text-xs text-muted-foreground">
              ~500₽ за конверсию
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="offers">По офферам</TabsTrigger>
          <TabsTrigger value="funnel">Воронка</TabsTrigger>
          <TabsTrigger value="metrica">
            <BarChart3 className="mr-2 h-4 w-4" />
            Метрика
          </TabsTrigger>
          <TabsTrigger value="ga4">
            <LineChart className="mr-2 h-4 w-4" />
            GA4
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* График кликов и конверсий */}
            <Card>
              <CardHeader>
                <CardTitle>Активность</CardTitle>
                <CardDescription>
                  Клики и конверсии за период
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={data?.dailyData || []}>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="var(--color-clicks)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-clicks)", r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="var(--color-conversions)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-conversions)", r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* График дохода */}
            <Card>
              <CardHeader>
                <CardTitle>Доход</CardTitle>
                <CardDescription>
                  Динамика дохода по дням
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <BarChart data={data?.dailyData || []}>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `₽${value}`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="revenue"
                      fill="var(--color-revenue)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Эффективность офферов</CardTitle>
              <CardDescription>
                Сравнение показателей по офферам
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {data?.topOffers.map((offer, index) => (
                  <div key={offer.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: offerColors[index % offerColors.length] }}
                        />
                        <span className="font-medium">{offer.name}</span>
                        {offer.isFeatured && (
                          <Badge variant="outline" className="text-xs">
                            ★
                          </Badge>
                        )}
                        {index === 0 && (
                          <Badge variant="default" className="text-xs bg-yellow-500">
                            Топ
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <div className="text-muted-foreground text-xs">Клики</div>
                          <div className="font-medium">{formatNumber(offer.clicks)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground text-xs">Конв.</div>
                          <div className="font-medium">{offer.conversions}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground text-xs">CR</div>
                          <div className="font-medium">{offer.cr.toFixed(2)}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground text-xs">EPC</div>
                          <div className="font-medium">₽{offer.epc.toFixed(2)}</div>
                        </div>
                        <div className="text-right min-w-[100px]">
                          <div className="text-muted-foreground text-xs">Доход</div>
                          <div className="font-medium">{formatCurrency(offer.revenue)}</div>
                        </div>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(offer.revenue / maxRevenue) * 100}%`,
                          backgroundColor: offerColors[index % offerColors.length],
                        }}
                      />
                    </div>
                  </div>
                ))}
                {(!data?.topOffers || data.topOffers.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    Нет данных об офферах
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Воронка конверсии</CardTitle>
              <CardDescription>
                Анализ пути пользователя
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.funnel && (
                  <>
                    {[
                      { stage: "Посещения", count: data.funnel.visits, percentage: 100 },
                      { stage: "Просмотр оффера", count: data.funnel.offerViews, percentage: (data.funnel.offerViews / data.funnel.visits) * 100 },
                      { stage: "Клик по кнопке", count: data.funnel.clicks, percentage: (data.funnel.clicks / data.funnel.visits) * 100 },
                      { stage: "Заявка", count: data.funnel.applications, percentage: (data.funnel.applications / data.funnel.visits) * 100 },
                      { stage: "Одобрение", count: data.funnel.approvals, percentage: (data.funnel.approvals / data.funnel.visits) * 100 },
                    ].map((stage, index) => (
                      <div key={stage.stage} className="relative">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium">{stage.stage}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{formatNumber(stage.count)}</span>
                            <Badge variant="outline">{stage.percentage.toFixed(1)}%</Badge>
                          </div>
                        </div>
                        <div className="h-10 rounded-lg bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary/80 rounded-lg transition-all flex items-center px-3"
                            style={{
                              width: `${Math.max(stage.percentage, 5)}%`,
                            }}
                          >
                            {stage.percentage > 15 && (
                              <span className="text-xs font-medium text-primary-foreground">
                                {formatNumber(stage.count)}
                              </span>
                            )}
                          </div>
                        </div>
                        {index < 4 && stage.count > 0 && (
                          <div className="flex justify-center py-2">
                            <div className="text-xs text-muted-foreground">
                              ↓ {((stage.count > 0 ? (stage.count / (index === 0 ? data.funnel.visits : [data.funnel.visits, data.funnel.offerViews, data.funnel.clicks, data.funnel.applications][index - 1])) : 0) * 100).toFixed(1)}% переходят
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrica" className="space-y-4">
          <MetricaStats />
        </TabsContent>

        <TabsContent value="ga4" className="space-y-4">
          <GA4Stats />
        </TabsContent>
      </Tabs>
    </div>
  )
}
