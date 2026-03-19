"use client"

import * as React from "react"
import Link from "next/link"
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Settings,
  ExternalLink,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Мок данные истории синхронизаций
const syncHistory = [
  {
    id: 1,
    source: "Сервер: api-traffic-handler.click2.money",
    status: "success",
    timestamp: "2024-12-16T14:30:00",
    duration: "2m 34s",
    offersUpdated: 8,
    offersAdded: 0,
    errors: 0,
  },
  {
    id: 2,
    source: "Сервер: api-traffic-handler.click2.money",
    status: "success",
    timestamp: "2024-12-16T10:00:00",
    duration: "2m 12s",
    offersUpdated: 6,
    offersAdded: 1,
    errors: 0,
  },
  {
    id: 3,
    source: "Сервер: api-traffic-handler.click2.money",
    status: "partial",
    timestamp: "2024-12-15T18:00:00",
    duration: "3m 45s",
    offersUpdated: 5,
    offersAdded: 0,
    errors: 3,
  },
  {
    id: 4,
    source: "Сервер: api-traffic-handler.click2.money",
    status: "error",
    timestamp: "2024-12-15T12:00:00",
    duration: "0m 15s",
    offersUpdated: 0,
    offersAdded: 0,
    errors: 8,
  },
  {
    id: 5,
    source: "Сервер: api-traffic-handler.click2.money",
    status: "success",
    timestamp: "2024-12-15T06:00:00",
    duration: "1m 58s",
    offersUpdated: 8,
    offersAdded: 0,
    errors: 0,
  },
]

// API источники
const apiSources = [
  {
    name: "Leads.su",
    status: "disconnected",
    lastSync: "—",
    nextSync: "—",
    interval: "Не настроено",
    offers: 0,
  },
  {
    name: "Сервер: api-traffic-handler.click2.money",
    status: "disconnected",
    lastSync: "—",
    nextSync: "—",
    interval: "Не настроено",
    offers: 0,
  },
  {
    name: "Где дыньги?",
    status: "available",
    lastSync: "—",
    nextSync: "—",
    interval: "Доступно",
    offers: 0,
  },
]

function SyncStatusBadge({ status }: { status: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: React.ElementType }> = {
    success: { variant: "default", label: "Успешно", icon: CheckCircle2 },
    partial: { variant: "secondary", label: "Частично", icon: AlertTriangle },
    error: { variant: "destructive", label: "Ошибка", icon: XCircle },
  }

  const { variant, label, icon: Icon } = config[status] || config.error

  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}

function ConnectionStatus({ status }: { status: string }) {
  const config: Record<string, { color: string; label: string }> = {
    connected: { color: "bg-green-500", label: "Подключено" },
    disconnected: { color: "bg-gray-400", label: "Отключено" },
    available: { color: "bg-blue-500", label: "Доступно" },
  }

  const { color, label } = config[status] || config.disconnected

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export default function SyncPage() {
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [syncProgress, setSyncProgress] = React.useState(0)

  const handleSync = () => {
    setIsSyncing(true)
    setSyncProgress(0)
    
    // Имитация синхронизации
    const interval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSyncing(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Синхронизация</h1>
          <p className="text-muted-foreground">
            Управление синхронизацией офферов с API партнёров
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Синхронизация...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Запустить синхронизацию
            </>
          )}
        </Button>
      </div>

      {/* Прогресс синхронизации */}
      {isSyncing && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Синхронизация с api-traffic-handler.click2.money</span>
              <span className="text-sm text-muted-foreground">{syncProgress}%</span>
            </div>
            <Progress value={syncProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Обновление данных офферов...
            </p>
          </CardContent>
        </Card>
      )}

      {/* API источники */}
      <div className="grid gap-4 md:grid-cols-3">
        {apiSources.map((source) => (
          <Card key={source.name}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{source.name}</CardTitle>
                <ConnectionStatus status={source.status} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Офферов</span>
                  <span className="font-medium">{source.offers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Интервал</span>
                  <span className="font-medium">{source.interval}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Последняя</span>
                  <span className="font-medium">{source.lastSync}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Следующая</span>
                  <span className="font-medium">{source.nextSync}</span>
                </div>
                <Separator />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href="/admin/sync/settings">
                      <Settings className="mr-2 h-3 w-3" />
                      Настройки
                    </Link>
                  </Button>
                  {source.status === "available" && (
                    <Button size="sm" className="flex-1">
                      Подключить
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* История синхронизаций */}
      <Card>
        <CardHeader>
          <CardTitle>История синхронизаций</CardTitle>
          <CardDescription>
            Последние запуски синхронизации с API партнёров
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Источник</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Время</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead className="text-center">Обновлено</TableHead>
                <TableHead className="text-center">Добавлено</TableHead>
                <TableHead className="text-center">Ошибки</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncHistory.map((sync) => (
                <TableRow key={sync.id}>
                  <TableCell className="font-medium">{sync.source}</TableCell>
                  <TableCell>
                    <SyncStatusBadge status={sync.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(sync.timestamp).toLocaleString("ru-RU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{sync.duration}</TableCell>
                  <TableCell className="text-center">{sync.offersUpdated}</TableCell>
                  <TableCell className="text-center">{sync.offersAdded}</TableCell>
                  <TableCell className="text-center">
                    {sync.errors > 0 ? (
                      <span className="text-destructive font-medium">{sync.errors}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Расписание */}
      <Card>
        <CardHeader>
          <CardTitle>Расписание автоматической синхронизации</CardTitle>
          <CardDescription>
            Настройте автоматический запуск синхронизации
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-medium">Автосинхронизация</div>
                <div className="text-sm text-muted-foreground">
                  Каждые 4 часа: 00:00, 04:00, 08:00, 12:00, 16:00, 20:00
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-green-600">Активно</Badge>
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Изменить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
