"use client"

import * as React from "react"
import {
  TrendingUp,
  Users,
  MousePointerClick,
  Eye,
  Clock,
  RefreshCw,
  AlertCircle,
  BarChart3,
  Globe,
  Target,
  ExternalLink,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { Badge } from "@/components/ui/badge"

// ============================================
// Types
// ============================================

interface OverviewStats {
  users: number
  newUsers: number
  sessions: number
  pageviews: number
  avgSessionDuration: number
  bounceRate: number
  events: number
}

interface DailyData {
  date: string
  users: number
  sessions: number
  pageviews: number
  events: number
}

interface TopPage {
  path: string
  title?: string
  pageviews: number
  users: number
  avgTimeOnPage: number
  bounceRate: number
  share: number
}

interface GA4Event {
  eventName: string
  eventCount: number
  eventUsers: number
  avgEventValue: number
  share: number
}

interface TrafficSource {
  source: string
  medium: string
  sourceMedium: string
  users: number
  sessions: number
  newUsers: number
  share: number
}

interface GA4DashboardReport {
  overview: OverviewStats
  dailyData: DailyData[]
  topPages: TopPage[]
  events: GA4Event[]
  trafficSources: TrafficSource[]
  mfoClicks: {
    totalClicks: number
    clicksByPage: Array<{ page: string; clicks: number }>
  }
  period: { startDate: string; endDate: string }
  lastUpdated: string
  hasData: boolean
}

// ============================================
// Chart Config
// ============================================

const chartConfig = {
  users: { label: "Пользователи", color: "hsl(var(--primary))" },
  sessions: { label: "Сессии", color: "hsl(var(--chart-2))" },
  pageviews: { label: "Просмотры", color: "hsl(var(--chart-3))" },
  events: { label: "События", color: "hsl(var(--chart-4))" },
} satisfies ChartConfig

const COLORS = [
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

function truncatePath(path: string, maxLength = 40): string {
  if (path.length <= maxLength) return path
  return path.substring(0, maxLength) + '...'
}

// ============================================
// Component
// ============================================

interface GA4StatsProps {
  className?: string
}

export function GA4Stats({ className }: GA4StatsProps) {
  const [data, setData] = React.useState<GA4DashboardReport | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [period, setPeriod] = React.useState("7daysAgo")

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/ga4?startDate=${period}&endDate=yesterday`)

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
          <p className="text-muted-foreground">Загрузка данных из Google Analytics...</p>
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
          <p>Данные из Google Analytics 4 недоступны. Проверьте настройки:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            <li>Убедитесь, что GA4_PROPERTY_ID настроен в .env</li>
            <li>Проверьте, что GA4_CREDENTIALS содержит валидный JSON</li>
            <li>Убедитесь, что Service Account имеет доступ к GA4</li>
            <li>Проверьте, что gtag.js установлен на сайте</li>
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
            Google Analytics 4
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
              <SelectItem value="yesterday">Вчера</SelectItem>
              <SelectItem value="7daysAgo">Последние 7 дней</SelectItem>
              <SelectItem value="14daysAgo">Последние 14 дней</SelectItem>
              <SelectItem value="30daysAgo">Последние 30 дней</SelectItem>
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
            <CardTitle className="text-sm font-medium">Пользователи</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.users)}</div>
            <p className="text-xs text-muted-foreground">
              Новых: {formatNumber(data.overview.newUsers)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Просмотры</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.pageviews)}</div>
            <p className="text-xs text-muted-foreground">
              Сессий: {formatNumber(data.overview.sessions)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">События</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.overview.events)}</div>
            <p className="text-xs text-muted-foreground">
              Кликов MFO: {formatNumber(data.mfoClicks.totalClicks)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ср. сессия</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.overview.avgSessionDuration)}</div>
            <p className="text-xs text-muted-foreground">
              Показатель отказов: {formatPercent(data.overview.bounceRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="pages">Топ страниц</TabsTrigger>
          <TabsTrigger value="events">События</TabsTrigger>
          <TabsTrigger value="traffic">Источники</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Daily Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Трафик по дням</CardTitle>
                <CardDescription>Пользователи и просмотры за период</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={data.dailyData}>
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
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="var(--color-users)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-users)", r: 3 }}
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

            {/* MFO Clicks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Клики по MFO
                </CardTitle>
                <CardDescription>Событие click_mfo_button</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold text-primary">
                      {formatNumber(data.mfoClicks.totalClicks)}
                    </div>
                    <p className="text-muted-foreground mt-2">кликов за период</p>
                  </div>
                </div>
                {data.mfoClicks.clicksByPage.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-muted-foreground">По страницам:</p>
                    {data.mfoClicks.clicksByPage.slice(0, 5).map((item, index) => (
                      <div key={item.page} className="flex items-center justify-between text-sm">
                        <span className="truncate flex-1 mr-4">{truncatePath(item.page)}</span>
                        <Badge variant="secondary">{formatNumber(item.clicks)}</Badge>
                      </div>
                    ))}
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
              <CardTitle>Топ страниц по просмотрам</CardTitle>
              <CardDescription>Самые популярные страницы сайта</CardDescription>
            </CardHeader>
            <CardContent>
              {data.topPages.length > 0 ? (
                <div className="space-y-4">
                  {data.topPages.map((page, index) => (
                    <div key={page.path} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div className="min-w-0 flex-1">
                            <a
                              href={page.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-sm hover:underline truncate block"
                              title={page.path}
                            >
                              {page.title || truncatePath(page.path)}
                            </a>
                            <p className="text-xs text-muted-foreground truncate">
                              {truncatePath(page.path, 60)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm flex-shrink-0">
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Просмотры</div>
                            <div className="font-medium">{formatNumber(page.pageviews)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Пользователи</div>
                            <div className="font-medium">{formatNumber(page.users)}</div>
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
                  Нет данных о страницах
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>События</CardTitle>
              <CardDescription>Все события, отслеживаемые на сайте</CardDescription>
            </CardHeader>
            <CardContent>
              {data.events.length > 0 ? (
                <div className="space-y-4">
                  {data.events.map((event, index) => (
                    <div key={event.eventName} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <span className="font-medium font-mono text-sm">{event.eventName}</span>
                            {event.eventName === 'click_mfo_button' && (
                              <Badge variant="default" className="ml-2 text-xs">MFO</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Количество</div>
                            <div className="font-medium">{formatNumber(event.eventCount)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Пользователи</div>
                            <div className="font-medium">{formatNumber(event.eventUsers)}</div>
                          </div>
                          <div className="text-right min-w-[60px]">
                            <div className="text-muted-foreground text-xs">Доля</div>
                            <div className="font-medium">{formatPercent(event.share)}</div>
                          </div>
                        </div>
                      </div>
                      <Progress value={event.share} className="h-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  Нет данных о событиях
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
              <CardDescription>Откуда приходят посетители</CardDescription>
            </CardHeader>
            <CardContent>
              {data.trafficSources.length > 0 ? (
                <div className="space-y-4">
                  {data.trafficSources.map((source, index) => (
                    <div key={source.sourceMedium} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <div>
                            <span className="font-medium">{source.source}</span>
                            <span className="text-muted-foreground text-sm"> / {source.medium}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Пользователи</div>
                            <div className="font-medium">{formatNumber(source.users)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">Новые</div>
                            <div className="font-medium">{formatNumber(source.newUsers)}</div>
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
      </Tabs>
    </div>
  )
}
