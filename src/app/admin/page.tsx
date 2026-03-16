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
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts"

// Мок данные для графиков
const weeklyData = [
  { day: "Пн", clicks: 245, conversions: 12 },
  { day: "Вт", clicks: 312, conversions: 18 },
  { day: "Ср", clicks: 289, conversions: 15 },
  { day: "Чт", clicks: 378, conversions: 22 },
  { day: "Пт", clicks: 445, conversions: 28 },
  { day: "Сб", clicks: 267, conversions: 14 },
  { day: "Вс", clicks: 198, conversions: 9 },
]

const monthlyData = [
  { month: "Янв", revenue: 45000, users: 120 },
  { month: "Фев", revenue: 52000, users: 145 },
  { month: "Мар", revenue: 48000, users: 132 },
  { month: "Апр", revenue: 61000, users: 168 },
  { month: "Май", revenue: 55000, users: 155 },
  { month: "Июн", revenue: 67000, users: 189 },
]

// Мок последние транзиции
const recentTransactions = [
  { id: 1, offer: "Займер", status: "approved", amount: 15000, time: "2 мин назад" },
  { id: 2, offer: "MoneyMan", status: "pending", amount: 30000, time: "5 мин назад" },
  { id: 3, offer: "еКапуста", status: "approved", amount: 5000, time: "12 мин назад" },
  { id: 4, offer: "Lime", status: "rejected", amount: 50000, time: "25 мин назад" },
  { id: 5, offer: "Турбозайм", status: "approved", amount: 20000, time: "32 мин назад" },
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
  value: string
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

// Статус транзакции
function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
    approved: { variant: "default", icon: CheckCircle2 },
    pending: { variant: "secondary", icon: Clock },
    rejected: { variant: "destructive", icon: XCircle },
  }

  const labels: Record<string, string> = {
    approved: "Одобрено",
    pending: "В ожидании",
    rejected: "Отклонено",
  }

  const { variant, icon: Icon } = variants[status] || variants.pending

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {labels[status]}
    </Badge>
  )
}

export default function AdminDashboard() {
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
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            За последние 7 дней
          </Button>
          <Button size="sm">
            Экспорт
          </Button>
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Всего переходов"
          value="12,847"
          description="за месяц"
          icon={MousePointerClick}
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          title="Конверсии"
          value="486"
          description="за месяц"
          icon={TrendingUp}
          trend="+8.2%"
          trendUp={true}
        />
        <StatCard
          title="Доход"
          value="₽328,450"
          description="за месяц"
          icon={DollarSign}
          trend="+23.1%"
          trendUp={true}
        />
        <StatCard
          title="Активных офферов"
          value="8"
          description="из 8 подключённых"
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
              {[
                { name: "Займер", conversions: 89, percentage: 100 },
                { name: "MoneyMan", conversions: 72, percentage: 81 },
                { name: "еКапуста", conversions: 65, percentage: 73 },
                { name: "Lime", conversions: 54, percentage: 61 },
                { name: "Турбозайм", conversions: 41, percentage: 46 },
              ].map((offer, index) => (
                <div key={offer.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-muted-foreground w-4">
                        {index + 1}
                      </span>
                      <span className="font-medium">{offer.name}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {offer.conversions} конверсий
                    </span>
                  </div>
                  <Progress value={offer.percentage} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Последние транзакции */}
      <Card>
        <CardHeader>
          <CardTitle>Последние заявки</CardTitle>
          <CardDescription>
            Последние 5 заявок через ваш агрегатор
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Оффер</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="text-right">Сумма</TableHead>
                <TableHead className="text-right">Время</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.offer}</TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    ₽{tx.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {tx.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Статистика синхронизации */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Синхронизация Leads.su</CardTitle>
              <Badge variant="default" className="bg-green-600">
                Активно
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Последняя синхронизация</span>
                <span className="font-medium">15 мин назад</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Обновлено офферов</span>
                <span className="font-medium">8 из 8</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Статус API</span>
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  Работает
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <TrendingUp className="mr-2 h-4 w-4" />
              Запустить синхронизацию
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Добавить новый оффер
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Users className="mr-2 h-4 w-4" />
              Экспорт отчёта
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
