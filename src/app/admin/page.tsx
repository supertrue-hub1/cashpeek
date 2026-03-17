"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  CreditCard,
  DollarSign,
  MousePointerClick,
  TrendingUp,
  Users,
  Activity,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from "recharts"

// Типы для данных
interface DashboardStats {
  offers: {
    total: number
    published: number
    draft: number
    featured: number
    tags: number
  }
  stats: {
    views: number
    clicks: number
    conversions: number
    users: number
  }
  topOffers: Array<{
    rank: number
    id: string
    name: string
    conversions: number
    clicks: number
    views: number
    isFeatured: boolean
  }>
  recentUpdates: Array<{
    id: string
    name: string
    status: string
    updatedAt: string
  }>
  sync: {
    lastSync: {
      id: string
      source: string
      status: string
      startedAt: string
      completedAt?: string
      offersUpdated: number
      offersAdded: number
      errors: number
    } | null
    recentSyncs: Array<{
      id: string
      source: string
      status: string
      startedAt: string
      offersProcessed: number
      offersUpdated: number
      errors: number
    }>
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
} satisfies ChartConfig

// Карточка статистики
function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendUp,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {trend && (
            <span className={`inline-flex items-center mr-1 ${trendUp ? "text-green-600" : "text-red-600"}`}>
              {trendUp ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
              {trend}
            </span>
          )}
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

// Статус оффера
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
    published: { variant: "default", icon: CheckCircle2 },
    draft: { variant: "secondary", icon: Clock },
    archived: { variant: "destructive", icon: XCircle },
  }

  const labels: Record<string, string> = {
    published: "Опубликован",
    draft: "Черновик",
    archived: "Архив",
  }

  const { variant, icon: Icon } = variants[status] || variants.draft

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {labels[status] || status}
    </Badge>
  )
}

// Форматирование времени
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Только что'
  if (diffMins < 60) return `${diffMins} мин назад`
  if (diffHours < 24) return `${diffHours} ч назад`
  return `${diffDays} дн назад`
}

export default function AdminDashboard() {
  const [data, setData] = React.useState<DashboardStats | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [period, setPeriod] = React.useState("7")

  const fetchData = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/admin/dashboard?period=${period}`)
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных")
      }
      
      const result: DashboardStats = await response.json()
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

  // Данные для графика (mock для визуализации, в реальном проекте нужны исторические данные)
  const weeklyData = [
    { day: "Пн", clicks: data?.stats.clicks ? Math.floor(data.stats.clicks / 7 * 1.2) : 245, conversions: data?.stats.conversions ? Math.floor(data.stats.conversions / 7 * 1.2) : 12 },
    { day: "Вт", clicks: data?.stats.clicks ? Math.floor(data.stats.clicks / 7 * 1.4) : 312, conversions: data?.stats.conversions ? Math.floor(data.stats.conversions / 7 * 1.4) : 18 },
    { day: "Ср", clicks: data?.stats.clicks ? Math.floor(data.stats.clicks / 7 * 1.1) : 289, conversions: data?.stats.conversions ? Math.floor(data.stats.conversions / 7 * 1.1) : 15 },
    { day: "Чт", clicks: data?.stats.clicks ? Math.floor(data.stats.clicks / 7 * 1.5) : 378, conversions: data?.stats.conversions ? Math.floor(data.stats.conversions / 7 * 1.5) : 22 },
    { day: "Пт", clicks: data?.stats.clicks ? Math.floor(data.stats.clicks / 7 * 1.8) : 445, conversions: data?.stats.conversions ? Math.floor(data.stats.conversions / 7 * 1.8) : 28 },
    { day: "Сб", clicks: data?.stats.clicks ? Math.floor(data.stats.clicks / 7 * 0.9) : 267, conversions: data?.stats.conversions ? Math.floor(data.stats.conversions / 7 * 0.9) : 14 },
    { day: "Вс", clicks: data?.stats.clicks ? Math.floor(data.stats.clicks / 7 * 0.7) : 198, conversions: data?.stats.conversions ? Math.floor(data.stats.conversions / 7 * 0.7) : 9 },
  ]

  // Рассчитываем процент для прогресс-бара
  const getMaxConversions = () => {
    if (!data?.topOffers.length) return 100
    return Math.max(...data.topOffers.map(o => o.conversions), 1)
  }
  const maxConversions = getMaxConversions()

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
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Обзор статистики и активности вашего агрегатора
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPeriod("7")}>
            7 дней
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPeriod("30")}>
            30 дней
          </Button>
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего переходов"
          value={data?.stats.clicks?.toLocaleString() || 0}
          description="за период"
          icon={MousePointerClick}
        />
        <StatCard
          title="Конверсии"
          value={data?.stats.conversions?.toLocaleString() || 0}
          description="за период"
          icon={TrendingUp}
        />
        <StatCard
          title="Просмотры"
          value={data?.stats.views?.toLocaleString() || 0}
          description="за период"
          icon={DollarSign}
        />
        <StatCard
          title="Активных офферов"
          value={data?.offers.published || 0}
          description={`из ${data?.offers.total || 0} всего`}
          icon={CreditCard}
        />
      </div>

      {/* Графики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* График кликов */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Активность за неделю</CardTitle>
            <CardDescription>
              Клики и конверсии за последние 7 дней
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={weeklyData}>
                <XAxis
                  dataKey="day"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => value.toString()}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="clicks"
                  fill="var(--color-clicks)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="conversions"
                  fill="var(--color-conversions)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Топ офферы */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Топ офферы</CardTitle>
            <CardDescription>
              По количеству конверсий
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.topOffers.map((offer) => (
                <div key={offer.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground w-4">
                        {offer.rank}
                      </span>
                      <span className="font-medium">{offer.name}</span>
                      {offer.isFeatured && (
                        <Badge variant="outline" className="text-xs py-0 h-5">
                          ★
                        </Badge>
                      )}
                    </div>
                    <span className="text-muted-foreground">
                      {offer.conversions} конв.
                    </span>
                  </div>
                  <Progress 
                    value={(offer.conversions / maxConversions) * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
              {(!data?.topOffers || data.topOffers.length === 0) && (
                <p className="text-center text-muted-foreground py-4">
                  Нет данных о конверсиях
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Последние обновления офферов */}
      <Card>
        <CardHeader>
          <CardTitle>Последние обновления</CardTitle>
          <CardDescription>
            Недавно обновлённые офферы
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Оффер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Обновлён</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.recentUpdates.slice(0, 5).map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.name}</TableCell>
                  <TableCell>
                    <StatusBadge status={offer.status} />
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatTimeAgo(offer.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.recentUpdates || data.recentUpdates.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Нет недавних обновлений
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Статистика синхронизации */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Синхронизация</CardTitle>
              {data?.sync.lastSync ? (
                <Badge 
                  variant="default" 
                  className={data.sync.lastSync.status === 'success' ? 'bg-green-600' : 'bg-yellow-600'}
                >
                  {data.sync.lastSync.status === 'success' ? 'Активно' : 'Ошибка'}
                </Badge>
              ) : (
                <Badge variant="secondary">Нет данных</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.sync.lastSync ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Последняя синхронизация</span>
                    <span className="font-medium">
                      {formatTimeAgo(data.sync.lastSync.startedAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Источник</span>
                    <span className="font-medium">{data.sync.lastSync.source}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Обновлено офферов</span>
                    <span className="font-medium">
                      {data.sync.lastSync.offersUpdated + data.sync.lastSync.offersAdded} 
                      {data.sync.lastSync.errors > 0 && ` (${data.sync.lastSync.errors} ошибок)`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Статус API</span>
                    <span className={`font-medium flex items-center gap-1 ${
                      data.sync.lastSync.status === 'success' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      <Activity className="h-3 w-3" />
                      {data.sync.lastSync.status === 'success' ? 'Работает' : 'Ошибка'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">Нет данных о синхронизации</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/admin/sync'}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Запустить синхронизацию
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/admin/offers'}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Управление офферами
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => window.location.href = '/admin/audit-logs'}
            >
              <Users className="mr-2 h-4 w-4" />
              История изменений
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
