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
  Loader2,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Типы
interface SyncSource {
  name: string
  status: "available" | "connected" | "disconnected"
  lastSync: string
  nextSync: string
  interval: string
  offers: number
  apiUrl?: string
  apiKey?: string
  enabled?: boolean
}

interface SyncHistoryItem {
  id: string
  source: string
  status: string
  startedAt: string
  durationMs: number
  offersProcessed: number
  offersUpdated: number
  offersAdded: number
  errors: number
}

// Функция форматирования времени
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

// Функция для получения истории синхронизаций
async function fetchSyncHistory(): Promise<SyncHistoryItem[]> {
  try {
    const response = await fetch("/api/sync?action=history&limit=20");
    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();
    
    return data.map((item: any) => ({
      id: item.id,
      source: item.source,
      status: item.status,
      startedAt: item.startedAt,
      durationMs: item.durationMs || 0,
      offersProcessed: item.offersProcessed || 0,
      offersUpdated: item.offersUpdated || 0,
      offersAdded: item.offersAdded || 0,
      errors: item.errors || 0,
    }));
  } catch (error) {
    console.error("Error fetching sync history:", error);
    return [];
  }
}

// Функция для получения статистики источников
async function fetchSourceStats(): Promise<Record<string, number>> {
  try {
    const response = await fetch("/api/sync?action=stats");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching source stats:", error);
    return {};
  }
}

// Функция для получения настроек источников
async function fetchSources(): Promise<Record<string, any>> {
  try {
    const response = await fetch("/api/sync/sources");
    if (!response.ok) throw new Error("Failed to fetch");
    return await response.json();
  } catch (error) {
    console.error("Error fetching sources:", error);
    return {};
  }
}

// Функция для сохранения настроек источника
async function saveSource(source: string, apiUrl: string, apiKey: string, enabled: boolean): Promise<boolean> {
  try {
    const response = await fetch("/api/sync/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source, apiUrl, apiKey, enabled }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error saving source:", error);
    return false;
  }
}

// Функция для запуска синхронизации
async function runSync(source?: string): Promise<any> {
  try {
    const response = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source }),
    });
    return await response.json();
  } catch (error) {
    console.error("Error running sync:", error);
    return { success: false, error: "Sync failed" };
  }
}

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
  const [syncSource, setSyncSource] = React.useState<string>("")
  const [sources, setSources] = React.useState<SyncSource[]>([])
  const [history, setHistory] = React.useState<SyncHistoryItem[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [selectedSource, setSelectedSource] = React.useState<SyncSource | null>(null)
  const [apiUrl, setApiUrl] = React.useState("")
  const [apiKey, setApiKey] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)

  // Загрузка данных при mount
  React.useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setIsLoading(true)
    try {
      const [historyData, statsData, sourcesData] = await Promise.all([
        fetchSyncHistory(),
        fetchSourceStats(),
        fetchSources(),
      ])
      
      setHistory(historyData)
      
      // Формируем список источников
      const sourcesList: SyncSource[] = [
        {
          name: "Leads.su",
          status: sourcesData['leads.su']?.enabled ? "connected" : "available",
          lastSync: "—",
          nextSync: "—",
          interval: sourcesData['leads.su']?.enabled ? "4 часа" : "Доступно",
          offers: statsData['Leads.su'] || 0,
          apiUrl: sourcesData['leads.su']?.apiUrl || "",
          apiKey: sourcesData['leads.su']?.apiKey || "",
          enabled: sourcesData['leads.su']?.enabled || false,
        },
        {
          name: "Сервер: api-traffic-handler.click2.money",
          status: sourcesData['click2money']?.enabled ? "connected" : "available",
          lastSync: "—",
          nextSync: "—",
          interval: sourcesData['click2money']?.enabled ? "4 часа" : "Доступно",
          offers: statsData['api-traffic-handler.click2.money'] || 0,
          apiUrl: sourcesData['click2money']?.apiUrl || "https://api-traffic-handler.click2.money/api/v1",
          apiKey: sourcesData['click2money']?.apiKey || "",
          enabled: sourcesData['click2money']?.enabled || false,
        },
      ]
      
      setSources(sourcesList)
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Ошибка загрузки данных")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    setSyncSource("api-traffic-handler.click2.money")
    
    // Имитация прогресса
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 15
      })
    }, 300)
    
    try {
      const result = await runSync()
      
      if (result.success || result.results?.some((r: any) => r.success)) {
        toast.success("Синхронизация завершена")
      } else {
        toast.error("Синхронизация завершена с ошибками")
      }
      
      // Перезагружаем данные
      await loadData()
    } catch (error) {
      console.error("Sync error:", error)
      toast.error("Ошибка синхронизации")
    } finally {
      clearInterval(progressInterval)
      setSyncProgress(100)
      setTimeout(() => {
        setIsSyncing(false)
        setSyncProgress(0)
      }, 1000)
    }
  }

  const openSettings = (source: SyncSource) => {
    setSelectedSource(source)
    setApiUrl(source.apiUrl || "")
    setApiKey(source.apiKey || "")
    setSettingsOpen(true)
  }

  const handleSaveSettings = async () => {
    if (!selectedSource) return
    
    setIsSaving(true)
    try {
      const sourceKey = selectedSource.name.includes("click2money") ? "click2money" : "leads.su"
      const success = await saveSource(sourceKey, apiUrl, apiKey, true)
      
      if (success) {
        toast.success("Настройки сохранены")
        setSettingsOpen(false)
        await loadData()
      } else {
        toast.error("Ошибка сохранения")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error("Ошибка сохранения")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
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
              <span className="text-sm font-medium">Синхронизация с {syncSource}</span>
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
        {sources.map((source) => (
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
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => openSettings(source)}
                  >
                    <Settings className="mr-2 h-3 w-3" />
                    Настройки
                  </Button>
                  {source.status === "available" && (
                    <Button size="sm" className="flex-1" onClick={() => openSettings(source)}>
                      Подключить
                    </Button>
                  )}
                  {source.status === "connected" && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={async () => {
                        const sourceKey = source.name.includes("click2money") ? "click2money" : "leads.su"
                        await saveSource(sourceKey, source.apiUrl, "", false)
                        await loadData()
                        toast.success("Источник отключён")
                      }}
                    >
                      Отключить
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
          {history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Источник</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Время</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead className="text-center">Обработано</TableHead>
                  <TableHead className="text-center">Обновлено</TableHead>
                  <TableHead className="text-center">Добавлено</TableHead>
                  <TableHead className="text-center">Ошибки</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((sync) => (
                  <TableRow key={sync.id}>
                    <TableCell className="font-medium">{sync.source}</TableCell>
                    <TableCell>
                      <SyncStatusBadge status={sync.status} />
                    </TableCell>
                    <TableCell>
                      {new Date(sync.startedAt).toLocaleString("ru-RU", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>{formatDuration(sync.durationMs)}</TableCell>
                    <TableCell className="text-center">{sync.offersProcessed}</TableCell>
                    <TableCell className="text-center">{sync.offersUpdated}</TableCell>
                    <TableCell className="text-center">{sync.offersAdded}</TableCell>
                    <TableCell className="text-center">
                      {sync.errors > 0 ? (
                        <span className="text-destructive font-medium">{sync.errors}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              История синхронизаций пуста
            </div>
          )}
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

      {/* Диалог настроек */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Настройки подключения</DialogTitle>
            <DialogDescription>
              {selectedSource?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiUrl">API URL</Label>
              <Input
                id="apiUrl"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/v1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Введите API ключ"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettingsOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить и подключить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
