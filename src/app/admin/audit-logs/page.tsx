"use client"

import * as React from "react"
import {
  Activity,
  Search,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Rocket,
  FileText,
  Tag,
  AlertTriangle,
  Loader2,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

// Типы для audit logs
interface AuditLogItem {
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
  duration?: string
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
  logs: AuditLogItem[]
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

const actionConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  CREATE: { label: "Создан", icon: Plus, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  UPDATE: { label: "Обновлён", icon: Edit, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  DELETE: { label: "Удалён", icon: Trash2, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
  SYNC: { label: "Синхронизация", icon: RefreshCw, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  BULK_ACTIVATE: { label: "Массовая активация", icon: CheckSquare, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  BULK_DEACTIVATE: { label: "Массовая деактивация", icon: CheckSquare, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
  BULK_TAG_ADD: { label: "Добавление тега", icon: Tag, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  BULK_TAG_REMOVE: { label: "Удаление тега", icon: Tag, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
  BULK_UPDATE: { label: "Массовое обновление", icon: Edit, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  PUBLISH: { label: "Опубликован", icon: Rocket, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  UNPUBLISH: { label: "Снят с публикации", icon: FileText, color: "text-yellow-600", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" },
  MARK_REVIEW: { label: "Требует проверки", icon: AlertTriangle, color: "text-orange-600", bgColor: "bg-orange-100 dark:bg-orange-900/30" },
  RESOLVE_REVIEW: { label: "Проверка завершена", icon: CheckSquare, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
}

const fieldLabels: Record<string, string> = {
  name: "Название",
  slug: "URL Slug",
  rating: "Рейтинг",
  status: "Статус",
  isFeatured: "Рекомендуемый",
  isNew: "Новый",
  isPopular: "Популярный",
  baseRate: "Ставка",
  minAmount: "Мин. сумма",
  maxAmount: "Макс. сумма",
  minTerm: "Мин. срок",
  maxTerm: "Макс. срок",
  metaTitle: "Meta Title",
  metaDescription: "Meta Description",
  customDescription: "Описание",
  affiliateUrl: "Партнёрская ссылка",
  requiresReview: "Требует проверки",
}

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogItem[]>([])
  const [stats, setStats] = React.useState({ total: 0, info: 0, success: 0, warning: 0, error: 0 })
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  const [searchQuery, setSearchQuery] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")

  // Загрузка данных
  const fetchLogs = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (actionFilter !== "all") params.set("level", actionFilter)
      if (sourceFilter !== "all") params.set("source", sourceFilter)
      if (searchQuery) params.set("search", searchQuery)
      params.set("limit", "100")
      
      const response = await fetch(`/api/admin/logs?${params}`)
      
      if (!response.ok) {
        throw new Error("Ошибка загрузки данных")
      }
      
      const data: LogsResponse = await response.json()
      setLogs(data.logs)
      setStats(data.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неизвестная ошибка")
    } finally {
      setLoading(false)
    }
  }, [actionFilter, sourceFilter, searchQuery])

  React.useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Группировка по дате
  const groupedLogs = React.useMemo(() => {
    const groups: Record<string, AuditLogItem[]> = {}
    
    logs.forEach((log) => {
      const date = new Date(log.timestamp).toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(log)
    })

    return groups
  }, [logs])

  const formatDateHeader = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Сегодня"
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return "Вчера"
    }
    return date.toLocaleDateString("ru-RU", { day: "numeric", month: "long" })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
  }

  // Получить конфигурацию для лога
  const getLogConfig = (log: AuditLogItem) => {
    if (log.type === 'sync') {
      return {
        label: log.status === 'success' ? 'Успешно' : log.status === 'error' ? 'Ошибка' : 'Синхронизация',
        icon: RefreshCw,
        color: log.status === 'success' ? 'text-green-600' : log.status === 'error' ? 'text-red-600' : 'text-purple-600',
        bgColor: log.status === 'success' ? 'bg-green-100 dark:bg-green-900/30' : log.status === 'error' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-purple-100 dark:bg-purple-900/30'
      }
    }
    
    const action = log.action || 'UPDATE'
    return actionConfig[action] || actionConfig.UPDATE
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">
            История всех изменений в системе
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchLogs()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Обновить
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Edit className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.info}</div>
                <div className="text-sm text-muted-foreground">Обновлений</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{logs.filter(l => l.type === 'sync').length}</div>
                <div className="text-sm text-muted-foreground">Синхронизаций</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Rocket className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.success}</div>
                <div className="text-sm text-muted-foreground">Успешных</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.error}</div>
                <div className="text-sm text-muted-foreground">Ошибок</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по офферу или пользователю..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[170px]">
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
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Источник" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все источники</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="api">API Sync</SelectItem>
                  <SelectItem value="leads">Leads.su</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ошибка */}
          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Загрузка */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Нет записей
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              {Object.entries(groupedLogs).map(([date, dateLogs]) => (
                <div key={date}>
                  <div className="sticky top-0 bg-muted/80 backdrop-blur px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                    {formatDateHeader(new Date(date))}
                  </div>
                  <div className="divide-y">
                    {dateLogs.map((log) => {
                      const config = getLogConfig(log)
                      const Icon = config.icon

                      return (
                        <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center shrink-0`}>
                              <Icon className={`h-5 w-5 ${config.color}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className={config.bgColor}>
                                  {config.label}
                                </Badge>
                                <span className="font-medium">{log.offerName || log.source}</span>
                                {log.details && (
                                  <span className="text-muted-foreground text-sm">
                                    {log.details}
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm mt-1">{log.message}</p>
                              
                              {log.stats && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {log.stats.processed > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      Обработано: {log.stats.processed}
                                    </Badge>
                                  )}
                                  {log.stats.updated > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                      Обновлено: {log.stats.updated}
                                    </Badge>
                                  )}
                                  {log.stats.added > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                      Добавлено: {log.stats.added}
                                    </Badge>
                                  )}
                                  {log.stats.errors > 0 && (
                                    <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">
                                      Ошибок: {log.stats.errors}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="text-right shrink-0">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{log.user || 'Система'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                {formatTime(log.timestamp)}
                              </div>
                              {log.duration && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {log.duration}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
