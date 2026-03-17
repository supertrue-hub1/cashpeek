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
  Loader2,
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

// Типы для логов
interface LogEntry {
  id: string
  type: 'audit' | 'sync'
  level: 'info' | 'success' | 'warning' | 'error'
  source: string
  message: string
  details: string | null
  timestamp: string
  user?: string
  offerName?: string
  action?: string
  ipAddress?: string
  completedAt?: string
  duration?: string | null
  status?: string
  stats?: {
    processed: number
    updated: number
    added: number
    unchanged: number
    errors: number
  }
}

interface LogsResponse {
  logs: LogEntry[]
  sources: string[]
  stats: {
    total: number
    info: number
    success: number
    warning: number
    error: number
  }
  total: number
}

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
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [sources, setSources] = React.useState<string[]>([])
  const [stats, setStats] = React.useState({ total: 0, info: 0, success: 0, warning: 0, error: 0 })
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [levelFilter, setLevelFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")
  const [typeFilter, setTypeFilter] = React.useState("all")

  // Загрузка логов
  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (typeFilter !== 'all') params.set('type', typeFilter)
      if (levelFilter !== 'all') params.set('level', levelFilter)
      if (sourceFilter !== 'all') params.set('source', sourceFilter)
      if (searchQuery) params.set('search', searchQuery)
      params.set('limit', '200')

      const response = await fetch(`/api/admin/logs?${params.toString()}`)
      const data: LogsResponse = await response.json()
      
      if (response.ok) {
        setLogs(data.logs)
        setSources(data.sources)
        setStats(data.stats)
      } else {
        console.error('Failed to fetch logs:', data)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }, [typeFilter, levelFilter, sourceFilter, searchQuery])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Экспорт логов
  const handleExport = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logs-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Логи системы</h1>
          <p className="text-muted-foreground">
            Мониторинг системных событий, синхронизаций и действий администраторов
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Обновить
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={logs.length === 0}>
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
                <div className="text-2xl font-bold">{stats.info}</div>
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
                <div className="text-2xl font-bold">{stats.success}</div>
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
                <div className="text-2xl font-bold">{stats.warning}</div>
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
                <div className="text-2xl font-bold">{stats.error}</div>
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
            <div className="flex gap-2 flex-wrap">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Тип" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все типы</SelectItem>
                  <SelectItem value="audit">Аудит</SelectItem>
                  <SelectItem value="sync">Синхронизация</SelectItem>
                </SelectContent>
              </Select>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Логи не найдены
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="divide-y">
                {logs.map((log) => {
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
                            <Badge variant="outline" className="text-xs">
                              {log.type === 'audit' ? 'Аудит' : 'Синхронизация'}
                            </Badge>
                            <span className="text-sm font-medium text-muted-foreground">
                              {log.source}
                            </span>
                            {log.user && (
                              <span className="text-xs text-muted-foreground">
                                • {log.user}
                              </span>
                            )}
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
                          {log.duration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Длительность: {log.duration}
                            </p>
                          )}
                          {log.stats && (
                            <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                              <span>Обработано: {log.stats.processed}</span>
                              <span>Обновлено: {log.stats.updated}</span>
                              <span>Добавлено: {log.stats.added}</span>
                              {log.stats.errors > 0 && (
                                <span className="text-red-500">Ошибок: {log.stats.errors}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
