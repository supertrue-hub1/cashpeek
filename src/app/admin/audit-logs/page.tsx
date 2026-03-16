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

// Mock данные для audit logs
const mockAuditLogs = [
  {
    id: "1",
    action: "UPDATE",
    fieldName: "baseRate",
    oldValue: "0.8",
    newValue: "0.63",
    userEmail: "admin@cashpeek.ru",
    offerName: "Займер",
    offerId: "1",
    source: "admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: "2",
    action: "PUBLISH",
    fieldName: "status",
    oldValue: "draft",
    newValue: "published",
    userEmail: "editor@cashpeek.ru",
    offerName: "MoneyMan",
    offerId: "2",
    source: "admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "3",
    action: "SYNC",
    fieldName: null,
    oldValue: null,
    newValue: null,
    userEmail: "system@cashpeek.ru",
    offerName: "еКапуста",
    offerId: "3",
    source: "api_sync",
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    metadata: { changes: [{ field: "maxAmount", from: 25000, to: 30000 }] },
  },
  {
    id: "4",
    action: "BULK_ACTIVATE",
    fieldName: "isFeatured",
    oldValue: "false",
    newValue: "true",
    userEmail: "admin@cashpeek.ru",
    offerName: "4 оффера",
    offerId: "bulk",
    source: "bulk_action",
    createdAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "5",
    action: "CREATE",
    fieldName: null,
    oldValue: null,
    newValue: null,
    userEmail: "system@cashpeek.ru",
    offerName: "Новый Оффер",
    offerId: "9",
    source: "api_sync",
    createdAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "6",
    action: "MARK_REVIEW",
    fieldName: "requiresReview",
    oldValue: "false",
    newValue: "true",
    userEmail: "system@cashpeek.ru",
    offerName: "Lime",
    offerId: "8",
    source: "api_sync",
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
    metadata: { reason: "Ставка изменилась на 45.2%" },
  },
  {
    id: "7",
    action: "RESOLVE_REVIEW",
    fieldName: "requiresReview",
    oldValue: "true",
    newValue: "false",
    userEmail: "admin@cashpeek.ru",
    offerName: "Турбозайм",
    offerId: "4",
    source: "admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 120),
  },
  {
    id: "8",
    action: "UPDATE",
    fieldName: "customDescription",
    oldValue: null,
    newValue: "Займер — надёжный сервис...",
    userEmail: "editor@cashpeek.ru",
    offerName: "Займер",
    offerId: "1",
    source: "admin",
    createdAt: new Date(Date.now() - 1000 * 60 * 150),
  },
]

const actionConfig: Record<string, { label: string; icon: React.ElementType; color: string; bgColor: string }> = {
  CREATE: { label: "Создан", icon: Plus, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  UPDATE: { label: "Обновлён", icon: Edit, color: "text-blue-600", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  DELETE: { label: "Удалён", icon: Trash2, color: "text-red-600", bgColor: "bg-red-100 dark:bg-red-900/30" },
  SYNC: { label: "Синхронизация", icon: RefreshCw, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  BULK_ACTIVATE: { label: "Массовая активация", icon: CheckSquare, color: "text-green-600", bgColor: "bg-green-100 dark:bg-green-900/30" },
  BULK_DEACTIVATE: { label: "Массовая деактивация", icon: CheckSquare, color: "text-gray-600", bgColor: "bg-gray-100 dark:bg-gray-900/30" },
  BULK_TAG_ADD: { label: "Добавление тега", icon: Tag, color: "text-purple-600", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
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
  const [searchQuery, setSearchQuery] = React.useState("")
  const [actionFilter, setActionFilter] = React.useState("all")
  const [sourceFilter, setSourceFilter] = React.useState("all")

  // Фильтрация
  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch = searchQuery === "" ||
      log.offerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesSource = sourceFilter === "all" || log.source === sourceFilter

    return matchesSearch && matchesAction && matchesSource
  })

  // Группировка по дате
  const groupedLogs = React.useMemo(() => {
    const groups: Record<string, typeof mockAuditLogs> = {}
    
    filteredLogs.forEach((log) => {
      const date = log.createdAt.toDateString()
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(log)
    })

    return groups
  }, [filteredLogs])

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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
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
          <Button variant="outline" size="sm">
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
                <Edit className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {mockAuditLogs.filter(l => l.action === "UPDATE").length}
                </div>
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
                <div className="text-2xl font-bold">
                  {mockAuditLogs.filter(l => l.action === "SYNC").length}
                </div>
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
                <div className="text-2xl font-bold">
                  {mockAuditLogs.filter(l => l.action === "PUBLISH").length}
                </div>
                <div className="text-sm text-muted-foreground">Публикаций</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {mockAuditLogs.filter(l => l.action === "MARK_REVIEW").length}
                </div>
                <div className="text-sm text-muted-foreground">Требуют проверки</div>
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
                  <SelectValue placeholder="Действие" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все действия</SelectItem>
                  <SelectItem value="CREATE">Создание</SelectItem>
                  <SelectItem value="UPDATE">Обновление</SelectItem>
                  <SelectItem value="SYNC">Синхронизация</SelectItem>
                  <SelectItem value="PUBLISH">Публикация</SelectItem>
                  <SelectItem value="MARK_REVIEW">Требуют проверки</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Источник" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все источники</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="api_sync">API Sync</SelectItem>
                  <SelectItem value="bulk_action">Bulk Action</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="h-[500px]">
            {Object.entries(groupedLogs).map(([date, logs]) => (
              <div key={date}>
                <div className="sticky top-0 bg-muted/80 backdrop-blur px-4 py-2 text-sm font-medium text-muted-foreground border-b">
                  {formatDateHeader(new Date(date))}
                </div>
                <div className="divide-y">
                  {logs.map((log) => {
                    const config = actionConfig[log.action] || actionConfig.UPDATE
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
                              <span className="font-medium">{log.offerName}</span>
                              {log.fieldName && (
                                <>
                                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">
                                    {fieldLabels[log.fieldName] || log.fieldName}
                                  </span>
                                </>
                              )}
                            </div>
                            
                            {log.oldValue && log.newValue && (
                              <div className="flex items-center gap-2 mt-2 text-sm">
                                <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  {log.oldValue}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  {log.newValue}
                                </Badge>
                              </div>
                            )}
                            
                            {"metadata" in log && log.metadata && "reason" in log.metadata && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {log.metadata.reason}
                              </p>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{log.userEmail}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Clock className="h-3 w-3" />
                              {formatTime(log.createdAt)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
