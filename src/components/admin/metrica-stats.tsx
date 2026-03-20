"use client"

import * as React from "react"
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  MousePointer,
  Clock,
  BarChart3,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Globe,
  Target,
  Layers,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

// ============================================
// Types
// ============================================

interface VisitsStats {
  visits: number
  pageviews: number
  visitors: number
  newVisitors: number
  bounceRate: number
  pageDepth: number
  avgVisitDurationSeconds: number
  period: {
    date1: string
    date2: string
  }
}

interface TopPage {
  url: string
  title?: string
  views: number
  visits: number
  avgTime: number
  bounceRate: number
  share: number
}

interface TrafficSource {
  source: string
  name: string
  visits: number
  pageviews: number
  visitors: number
  bounceRate: number
  share: number
}

interface DailyStats {
  date: string
  visits: number
  pageviews: number
  visitors: number
}

interface GoalConversion {
  goalId: string
  goalName: string
  reaches: number
  conversions: number
  visits: number
}

interface MetricaDashboardReport {
  visits: VisitsStats
  topPages: TopPage[]
  trafficSources: TrafficSource[]
  dailyStats: DailyStats[]
  goalConversions: GoalConversion[]
  lastUpdated: string
  hasData: boolean
}

// ============================================
// Chart Config
// ============================================

const chartConfig = {
  visits: {
    label: "Визиты",
    color: "hsl(var(--primary))",
  },
  pageviews: {
    label: "Просмотры",
    color: "hsl(var(--chart-2))",
  },
  visitors: {
    label: "Посетители",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

// Цвета для Pie Chart
const TRAFFIC_COLORS = [
  "#2563eb", "#16a34a", "#9333ea", "#ea580c", "#dc2626",
  "#0891b2", "#7c3aed", "#059669", "#d97706", "#db2777"
]

// ============================================
// Helpers
// ============================================

function formatNumber(num: number): string {
  return num.toLocaleString('ru-RU')
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return mins > 0 ? `${mins}м ${secs}с` : `${secs}с`
}

function formatPercent(num: number): string {
  return `${num.toFixed(1)}%`
}

function truncateUrl(url: string, maxLength = 50): string {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

// ============================================
// Components
// ============================================

interface MetricaStatsProps {
  className?: string
}

export function MetricaStats({ className }: MetricaStatsProps) {
  const [data, setData] = React.useState<MetricaDashboardReport | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [period, setPeriod] = React.useState("7")

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/metrics?days=${period}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Ошибка загрузки данных")
      }

      const result = await response.json()
      setData(result.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }, [period])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Загрузка данных из Яндекс.Метрики...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Ошибка загрузки данных</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error}</p>
          <Button variant="outline" size="sm" onClick={fetchData} className="w-fit">
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  // No data state
  if (!data || !data.hasData) {
    return (
      <Alert className={className}>
        <BarChart3 className="h-4 w-4" />
        <AlertTitle>Нет данных</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>Данные из Яндекс.Метрики недоступны. Проверьте настройки:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Убедитесь, что METRICA_TOKEN настроен в .env</li>
            <li>Проверьте, что NEXT_PUBLIC_YM_ID совпадает с ID счетчика</li>
            <li>Убедитесь, что у токена есть права на чтение статистики</li>
          </ul>
          <Button variant="outline" size="sm" onClick={fetchData} className="w-fit mt-2">
            <RefreshCw className="mr-2 h-4 w-4" />
            Повторить
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Яндекс.Метрика
          </h2>
          <p className="text-muted-foreground text-sm">
            Данные обновлены: {new Date(data.lastUpdated).toLocaleString('ru-RU')}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Сегодня</SelectItem>
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

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Визиты</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.visits.visits)}</div>
            <p className="text-xs text-muted-foreground">
              За {period === '1' ? 'сегодня' : `последние ${period} дней`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.visits.pageviews)}</div>
            <p className="text-xs text-muted-foreground">
              Глубина: {data.visits.pageDepth.toFixed(1)} стр.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Посетители</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.visits.visitors)}</div>
            <p className="text-xs text-muted-foreground">
              Новых: {formatNumber(data.visits.newVisitors)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Отказы</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercent(data.visits.bounceRate)}</div>
            <p className="text-xs text-muted-foreground">
              Ср. время: {formatDuration(data.visits.avgVisitDurationSeconds)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="pages">Топ страниц</TabsTrigger>
          <TabsTrigger value="traffic">Источники</TabsTrigger>
          <TabsTrigger value="goals">Цели</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Daily Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Динамика визитов</CardTitle>
                <CardDescription>
                  Визиты и просмотры по дням
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={data.dailyStats}>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
                      }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="visits"
                      stroke="var(--color-visits)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-visits)", r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pageviews"
                      stroke="var(--color-pageviews)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-pageviews)", r: 3 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Traffic Sources Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Источники трафика</CardTitle>
                <CardDescription>
                  Распределение по источникам
                </CardDescription>
              </CardHeader>
              <CardContent>
                {data.trafficSources.length > 0 ? (
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <PieChart>
                      <Pie
                        data={data.trafficSources.map((source, index) => ({
                          name: source.name,
                          value: source.visits,
                          fill: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length],
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {data.trafficSources.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={TRAFFIC_COLORS[index % TRAFFIC_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    Нет данных об источниках трафика
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Pages Tab */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Топ страниц по посещаемости</CardTitle>
              <CardDescription>
                Самые популярные страницы сайта
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPages.length > 0 ? (
                <div className="space-y-4">
                  {data.topPages.map((page, index) => (
                    <div key={page.url} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length] }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <a
                                href={page.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-sm hover:underline truncate"
                                title={page.url}
                              >
                                {page.title || truncateUrl(page.url)}
                              </a>
                              <ExternalLink className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {truncateUrl(page.url, 70)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm flex-shrink-0">
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Просмотры</div>
                            <div className="font-medium">{formatNumber(page.views)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Отказы</div>
                            <div className="font-medium">{formatPercent(page.bounceRate)}</div>
                          </div>
                          <div className="text-right min-w-[60px]">
                            <div className="text-muted-foreground text-xs">Доля</div>
                            <div className="font-medium">{formatPercent(page.share)}</div>
                          </div>
                        </div>
                      </div>
                      <Progress value={page.share} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Нет данных о популярных страницах
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Traffic Sources Tab */}
        <TabsContent value="traffic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Источники трафика</CardTitle>
              <CardDescription>
                Откуда приходят посетители
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.trafficSources.length > 0 ? (
                <div className="space-y-4">
                  {data.trafficSources.map((source, index) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length] }}
                          />
                          <div>
                            <span className="font-medium">{source.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Визиты</div>
                            <div className="font-medium">{formatNumber(source.visits)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Посетители</div>
                            <div className="font-medium">{formatNumber(source.visitors)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Отказы</div>
                            <div className="font-medium">{formatPercent(source.bounceRate)}</div>
                          </div>
                          <div className="text-right min-w-[60px]">
                            <div className="text-muted-foreground text-xs">Доля</div>
                            <div className="font-medium">{formatPercent(source.share)}</div>
                          </div>
                        </div>
                      </div>
                      <Progress value={source.share} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Нет данных об источниках трафика
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Конверсии по целям
              </CardTitle>
              <CardDescription>
                Достижения целей и конверсии
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.goalConversions.length > 0 ? (
                <div className="space-y-4">
                  {data.goalConversions.map((goal, index) => (
                    <div key={goal.goalId} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: TRAFFIC_COLORS[index % TRAFFIC_COLORS.length] }}
                          />
                          <span className="font-medium">{goal.goalName}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Достижения</div>
                            <div className="font-medium">{formatNumber(goal.reaches)}</div>
                          </div>
                          <div className="text-right min-w-[80px]">
                            <div className="text-muted-foreground text-xs">Конверсия</div>
                            <div className="font-medium text-green-600">{formatPercent(goal.conversions)}</div>
                          </div>
                        </div>
                      </div>
                      <Progress value={goal.conversions} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <Alert>
                  <Target className="h-4 w-4" />
                  <AlertTitle>Нет данных о целях</AlertTitle>
                  <AlertDescription>
                    <p>Для отслеживания конверсий необходимо:</p>
                    <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                      <li>Настроить цели в Яндекс.Метрике</li>
                      <li>Добавить ID целей в запрос API</li>
                      <li>Убедиться, что за период были достижения целей</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
