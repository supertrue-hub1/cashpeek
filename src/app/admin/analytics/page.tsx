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
} from "lucide-react"

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
import { Bar, BarChart, XAxis, YAxis, Line, LineChart, Pie, PieChart, Cell, ResponsiveContainer } from "recharts"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Мок данные для графиков
const dailyData = [
  { date: "10 дек", clicks: 145, conversions: 8, revenue: 2450 },
  { date: "11 дек", clicks: 189, conversions: 12, revenue: 3680 },
  { date: "12 дек", clicks: 167, conversions: 9, revenue: 2755 },
  { date: "13 дек", clicks: 234, conversions: 15, revenue: 4590 },
  { date: "14 дек", clicks: 278, conversions: 18, revenue: 5510 },
  { date: "15 дек", clicks: 312, conversions: 22, revenue: 6738 },
  { date: "16 дек", clicks: 289, conversions: 19, revenue: 5819 },
]

const offerPerformance = [
  { name: "Займер", clicks: 892, conversions: 67, revenue: 20523, color: "#2563eb" },
  { name: "MoneyMan", clicks: 756, conversions: 54, revenue: 16542, color: "#16a34a" },
  { name: "еКапуста", clicks: 634, conversions: 48, revenue: 14694, color: "#9333ea" },
  { name: "Lime", clicks: 512, conversions: 38, revenue: 11634, color: "#ea580c" },
  { name: "Турбозайм", clicks: 423, conversions: 31, revenue: 9491, color: "#dc2626" },
]

const conversionFunnel = [
  { stage: "Посещения", count: 15420, percentage: 100 },
  { stage: "Просмотр оффера", count: 4285, percentage: 27.8 },
  { stage: "Клик по кнопке", count: 1247, percentage: 8.1 },
  { stage: "Заявка", count: 398, percentage: 2.6 },
  { stage: "Одобрение", count: 286, percentage: 1.9 },
]

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

export default function AnalyticsPage() {
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
          <Select defaultValue="7d">
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Последние 24 часа</SelectItem>
              <SelectItem value="7d">Последние 7 дней</SelectItem>
              <SelectItem value="30d">Последние 30 дней</SelectItem>
              <SelectItem value="90d">Последние 90 дней</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
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
            <div className="text-2xl font-bold">12,847</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +12.5% с прошлой недели
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Конверсии</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">486</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +8.2% с прошлой недели
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CR</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.78%</div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingDown className="mr-1 h-3 w-3" />
              -0.4% с прошлой недели
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Доход</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₽328,450</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="mr-1 h-3 w-3" />
              +23.1% с прошлой недели
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="offers">По офферам</TabsTrigger>
          <TabsTrigger value="funnel">Воронка</TabsTrigger>
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
                  <LineChart data={dailyData}>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="var(--color-clicks)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-clicks)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="conversions"
                      stroke="var(--color-conversions)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-conversions)" }}
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
                  <BarChart data={dailyData}>
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
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
                {offerPerformance.map((offer, index) => {
                  const cr = ((offer.conversions / offer.clicks) * 100).toFixed(2)
                  const epc = (offer.revenue / offer.clicks).toFixed(2)
                  
                  return (
                    <div key={offer.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: offer.color }}
                          />
                          <span className="font-medium">{offer.name}</span>
                          {index === 0 && (
                            <Badge variant="default" className="text-xs">
                              Топ
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-right">
                            <div className="text-muted-foreground">Клики</div>
                            <div className="font-medium">{offer.clicks.toLocaleString()}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground">Конверсии</div>
                            <div className="font-medium">{offer.conversions}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground">CR</div>
                            <div className="font-medium">{cr}%</div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground">EPC</div>
                            <div className="font-medium">₽{epc}</div>
                          </div>
                          <div className="text-right min-w-[100px]">
                            <div className="text-muted-foreground">Доход</div>
                            <div className="font-medium">₽{offer.revenue.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${(offer.revenue / offerPerformance[0].revenue) * 100}%`,
                            backgroundColor: offer.color,
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
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
                {conversionFunnel.map((stage, index) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <span className="font-medium">{stage.stage}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{stage.count.toLocaleString()}</span>
                        <Badge variant="outline">{stage.percentage}%</Badge>
                      </div>
                    </div>
                    <div className="h-10 rounded-lg bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary/80 rounded-lg transition-all flex items-center px-3"
                        style={{
                          width: `${stage.percentage}%`,
                        }}
                      >
                        {stage.percentage > 15 && (
                          <span className="text-xs font-medium text-primary-foreground">
                            {stage.count.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {index < conversionFunnel.length - 1 && (
                      <div className="flex justify-center py-2">
                        <div className="text-xs text-muted-foreground">
                          ↓ {((conversionFunnel[index + 1].count / stage.count) * 100).toFixed(1)}% переходят на следующий этап
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
