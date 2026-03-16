"use client"

import * as React from "react"
import {
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
  Search,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

// Мок логи
const logs = [
  {
    id: 1,
    level: "info",
    source: "Leads.su API",
    message: "Синхронизация успешно завершена. Обновлено 8 офферов.",
    timestamp: "2024-12-16T14:32:45",
    details: "Duration: 2m 34s, Requests: 12",
  },
  {
    id: 2,
    level: "success",
    source: "Offer Update",
    message: "Оффер 'Займер' обновлён: изменена ставка с 0.8% на 0.63%",
    timestamp: "2024-12-16T14:31:12",
    details: null,
  },
  {
    id: 3,
    level: "warning",
    source: "API Rate Limit",
    message: "Приближение к лимиту запросов API Leads.su (85/100)",
    timestamp: "2024-12-16T14:30:58",
    details: "Reset at: 15:00",
  },
  {
    id: 4,
    level: "error",
    source: "Leads.su API",
    message: "Ошибка при получении данных оффера ID=12345: 404 Not Found",
    timestamp: "2024-12-16T14:30:45",
    details: "Response: {\"error\": \"Offer not found\"}",
  },
  {
    id: 5,
    level: "info",
    source: "Click Tracking",
    message: "Переход по офферу 'MoneyMan' зарегистрирован",
    timestamp: "2024-12-16T14:25:33",
    details: "IP: 192.168.1.1, User-Agent: Chrome/120",
  },
  {
    id: 6,
    level: "success",
    source: "Conversion",
    message: "Конверсия по офферу 'еКапуста': займ одобрен на 15 000 ₽",
    timestamp: "2024-12-16T14:20:15",
    details: "Click ID: clk_abc123",
  },
  {
    id: 7,
    level: "error",
    source: "Webhook",
    message: "Не удалось отправить webhook на https://example.com/hook",
    timestamp: "2024-12-16T14:15:00",
    details: "Error: ECONNREFUSED",
  },
  {
    id: 8,
    level: "info",
    source: "System",
    message: "Плановая очистка кэша завершена. Освобождено 128 MB.",
    timestamp: "2024-12-16T12:00:00",
    details: null,
  },
  {
    id: 9,
    level: "warning",
    source: "Offer Validation",
    message: "Оффер 'До зарплаты' не прошёл валидацию: отсутствует affiliateUrl",
    timestamp: "2024-12-16T10:30:22",
    details: null,
  },
  {
    id: 10,
    level: "success",
    source: "Sync Schedule",
    message: "Автосинхронизация запущена по расписанию",
    timestamp: "2024-12-16T10:00:00",
    details: null,
  },
  {
    id: 11,
    level: "info",
    source: "Admin Action",
    message: "Пользователь admin@cashpeek.ru изменил статус оффера 'Lime' на 'active'",
    timestamp: "2024-12-16T09:45:12",
    details: null,
  },
  {
    id: 12,
    level: "error",
    source: "Database",
    message: "Таймаут подключения к базе данных (30s)",
    timestamp: "2024-12-16T09:30:00",
    details: "Retrying... Attempt 1/3",
  },
]

const levelConfig = {
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    label: "Info",
  },
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    label: "Success",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    label: "Warning",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    label: "Error",
  },
}

function LogLevelBadge({ level }: { level: string }) {
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig.info
  const Icon = config.icon

  return (
    <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 gap-1`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [levelFilter, setLevelFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")

  // Фильтрация логов
  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesSource = sourceFilter === "all" || log.source.includes(sourceFilter)
    return matchesSearch && matchesLevel && matchesSource
  })

  // Получаем уникальные источники
  const sources = [...new Set(logs.map(log => log.source.split(" ")[0]))]

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Логи API</h1>
          <p className="text-muted-foreground">
            Мониторинг системных событий и ошибок
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Обновить
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Info className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {logs.filter(l => l.level === "info").length}
                </div>
                <div className="text-sm text-muted-foreground">Info</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {logs.filter(l => l.level === "success").length}
                </div>
                <div className="text-sm text-muted-foreground">Success</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {logs.filter(l => l.level === "warning").length}
                </div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {logs.filter(l => l.level === "error").length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по логам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Уровень" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все уровни</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Источник" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все источники</SelectItem>
                  {sources.map(source => (
                    <SelectItem key={source} value={source}>{source}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <div className="divide-y">
              {filteredLogs.map((log) => {
                const config = levelConfig[log.level as keyof typeof levelConfig] || levelConfig.info
                const Icon = config.icon

                return (
                  <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <LogLevelBadge level={log.level} />
                          <span className="text-sm font-medium text-muted-foreground">
                            {log.source}
                          </span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(log.timestamp).toLocaleString("ru-RU", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{log.message}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted p-2 rounded">
                            {log.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
