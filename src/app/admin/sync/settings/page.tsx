/**
 * API Settings Page
 * 
 * Настройки подключения к API партнёров:
 * - Leads.su
 * - Admitad
 * - Другие источники
 */

"use client"

import * as React from "react"
import { 
  Save, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  TestTube,
  RefreshCw,
  Key,
  Clock,
  Zap,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// ============================================
// Types
// ============================================

interface ApiSettings {
  id: string;
  name: string;
  enabled: boolean;
  apiKey: string;
  apiSecret?: string;
  affiliateId?: string;
  interval: number; // в часах
  lastTest?: string;
  testStatus?: 'success' | 'error' | 'pending';
}

interface SyncSettings {
  autoSync: boolean;
  interval: number;
  timeouts: string[];
}

// ============================================
// Default Settings
// ============================================

const DEFAULT_API_SETTINGS: ApiSettings[] = [
  {
    id: 'leads-su',
    name: 'Leads.su',
    enabled: true,
    apiKey: '',
    apiSecret: '',
    affiliateId: '',
    interval: 4,
  },
  {
    id: 'admitad',
    name: 'Admitad',
    enabled: false,
    apiKey: '',
    apiSecret: '',
    affiliateId: '',
    interval: 6,
  },
];

const DEFAULT_SYNC_SETTINGS: SyncSettings = {
  autoSync: true,
  interval: 4,
  timeouts: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
};

// ============================================
// Components
// ============================================

function ApiKeyInput({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (value: string) => void;
  label: string;
}) {
  const [showKey, setShowKey] = React.useState(false);
  
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id={label}
            type={showKey ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Введите ключ..."
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function TestConnectionButton({ 
  apiId, 
  onTest 
}: { 
  apiId: string;
  onTest: (id: string) => void;
}) {
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={() => onTest(apiId)}
    >
      <TestTube className="mr-2 h-4 w-4" />
      Проверить
    </Button>
  );
}

function ConnectionStatus({ status }: { status?: 'success' | 'error' | 'pending' }) {
  if (!status) return null;
  
  const config = {
    success: { icon: CheckCircle2, variant: 'default' as const, label: 'Подключено' },
    error: { icon: XCircle, variant: 'destructive' as const, label: 'Ошибка' },
    pending: { icon: AlertTriangle, variant: 'secondary' as const, label: 'Проверка...' },
  };
  
  const { icon: Icon, variant, label } = config[status];
  
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}

// ============================================
// Main Component
// ============================================

export default function ApiSettingsPage() {
  // State
  const [apiSettings, setApiSettings] = React.useState<ApiSettings[]>(DEFAULT_API_SETTINGS);
  const [syncSettings, setSyncSettings] = React.useState<SyncSettings>(DEFAULT_SYNC_SETTINGS);
  const [saving, setSaving] = React.useState(false);
  const [testingId, setTestingId] = React.useState<string | null>(null);
  
  // Сохранение настроек
  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Сохраняем в localStorage (в реальном проекте — API)
      localStorage.setItem('api-settings', JSON.stringify(apiSettings));
      localStorage.setItem('sync-settings', JSON.stringify(syncSettings));
      
      toast.success('Настройки сохранены', {
        description: 'Настройки API успешно обновлены',
      });
    } catch (error) {
      toast.error('Ошибка сохранения', {
        description: 'Не удалось сохранить настройки',
      });
    } finally {
      setSaving(false);
    }
  };
  
  // Тестирование подключения
  const handleTestConnection = async (apiId: string) => {
    setTestingId(apiId);
    
    // Имитация проверки
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const settings = apiSettings.find(s => s.id === apiId);
    if (settings?.apiKey) {
      setApiSettings(prev => prev.map(s => 
        s.id === apiId 
          ? { ...s, testStatus: 'success' as const, lastTest: new Date().toISOString() }
          : s
      ));
      toast.success('Подключение успешно', {
        description: `API ${settings.name} работает корректно`,
      });
    } else {
      setApiSettings(prev => prev.map(s => 
        s.id === apiId 
          ? { ...s, testStatus: 'error' as const }
          : s
      ));
      toast.error('Ошибка подключения', {
        description: 'Проверьте правильность API ключа',
      });
    }
    
    setTestingId(null);
  };
  
  // Обновление настроек API
  const updateApiSetting = (id: string, updates: Partial<ApiSettings>) => {
    setApiSettings(prev => prev.map(s => 
      s.id === id ? { ...s, ...updates } : s
    ));
  };
  
  // Загрузка настроек при монтировании
  React.useEffect(() => {
    const savedApi = localStorage.getItem('api-settings');
    const savedSync = localStorage.getItem('sync-settings');
    
    if (savedApi) {
      try {
        setApiSettings(JSON.parse(savedApi));
      } catch {}
    }
    
    if (savedSync) {
      try {
        setSyncSettings(JSON.parse(savedSync));
      } catch {}
    }
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Настройки API</h1>
          <p className="text-muted-foreground">
            Подключение к API партнёрских программ
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Сохранение...' : 'Сохранить изменения'}
        </Button>
      </div>
      
      <Tabs defaultValue="leads-su" className="space-y-4">
        <TabsList className="flex flex-wrap">
          {apiSettings.map(api => (
            <TabsTrigger key={api.id} value={api.id} className="gap-2">
              {api.name}
              {api.enabled && <CheckCircle2 className="h-3 w-3 text-green-500" />}
            </TabsTrigger>
          ))}
          <TabsTrigger value="schedule">Расписание</TabsTrigger>
        </TabsList>
        
        {/* Leads.su */}
        {apiSettings.map(api => (
          <TabsContent key={api.id} value={api.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="h-5 w-5" />
                      {api.name}
                    </CardTitle>
                    <CardDescription>
                      Настройки подключения к API {api.name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <ConnectionStatus status={api.testStatus} />
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={api.enabled}
                        onCheckedChange={(checked) => updateApiSetting(api.id, { enabled: checked })}
                      />
                      <Label className="text-sm">Включено</Label>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Credentials */}
                <div className="grid gap-4 md:grid-cols-2">
                  <ApiKeyInput
                    label="API Key"
                    value={api.apiKey}
                    onChange={(value) => updateApiSetting(api.id, { apiKey: value })}
                  />
                  <ApiKeyInput
                    label="API Secret"
                    value={api.apiSecret || ''}
                    onChange={(value) => updateApiSetting(api.id, { apiSecret: value })}
                  />
                </div>
                
                {/* Affiliate ID */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor={`aff-${api.id}`}>Affiliate ID</Label>
                    <Input
                      id={`aff-${api.id}`}
                      value={api.affiliateId || ''}
                      onChange={(e) => updateApiSetting(api.id, { affiliateId: e.target.value })}
                      placeholder="Ваш ID в партнёрке"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`int-${api.id}`}>Интервал синхронизации</Label>
                    <Select
                      value={api.interval.toString()}
                      onValueChange={(value) => updateApiSetting(api.id, { interval: parseInt(value) })}
                    >
                      <SelectTrigger id={`int-${api.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Каждый час</SelectItem>
                        <SelectItem value="2">Каждые 2 часа</SelectItem>
                        <SelectItem value="4">Каждые 4 часа</SelectItem>
                        <SelectItem value="6">Каждые 6 часов</SelectItem>
                        <SelectItem value="12">Каждые 12 часов</SelectItem>
                        <SelectItem value="24">Раз в сутки</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Test Button */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {api.lastTest && (
                      <>Последняя проверка: {new Date(api.lastTest).toLocaleString('ru-RU')}</>
                    )}
                  </div>
                  <TestConnectionButton
                    apiId={api.id}
                    onTest={handleTestConnection}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        
        {/* Расписание */}
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Расписание синхронизации
              </CardTitle>
              <CardDescription>
                Настройка автоматической синхронизации офферов
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auto Sync Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <div className="font-medium">Автоматическая синхронизация</div>
                  <div className="text-sm text-muted-foreground">
                    Автоматически запускать синхронизацию по расписанию
                  </div>
                </div>
                <Switch
                  checked={syncSettings.autoSync}
                  onCheckedChange={(checked) => setSyncSettings(s => ({ ...s, autoSync: checked }))}
                />
              </div>
              
              {/* Interval */}
              <div className="space-y-2">
                <Label>Интервал синхронизации</Label>
                <Select
                  value={syncSettings.interval.toString()}
                  onValueChange={(value) => setSyncSettings(s => ({ ...s, interval: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Каждый час</SelectItem>
                    <SelectItem value="2">Каждые 2 часа</SelectItem>
                    <SelectItem value="4">Каждые 4 часа</SelectItem>
                    <SelectItem value="6">Каждые 6 часов</SelectItem>
                    <SelectItem value="12">Каждые 12 часов</SelectItem>
                    <SelectItem value="24">Раз в сутки</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Timeouts */}
              <div className="space-y-2">
                <Label>Время запуска</Label>
                <div className="flex flex-wrap gap-2">
                  {syncSettings.timeouts.map((time) => (
                    <Badge key={time} variant="outline" className="px-3 py-1">
                      {time}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Время указано в часовом поясе сервера (UTC)
                </p>
              </div>
              
              {/* Sync Status */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-medium">Статус cron-задачи</div>
                    <div className="text-sm text-muted-foreground">
                      Следующий запуск: через 2 часа 15 минут
                    </div>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-600">Активно</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
