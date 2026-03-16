"use client"

import * as React from "react"
import { Settings, Globe, Bell, Shield, Database, Palette, Save, Loader2 } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface Settings {
  // General
  siteName: string
  siteUrl: string
  adminEmail: string
  
  // SEO
  metaTitle: string
  metaDescription: string
  indexationEnabled: boolean
  
  // API
  leadsApiKey: string
  admitadApiKey: string
  testMode: boolean
  
  // Notifications
  emailNotifications: boolean
  syncErrors: boolean
  newConversions: boolean
  weeklyReport: boolean
  
  // Security
  twoFactorAuth: boolean
  sessionDuration: string
  actionLogging: boolean
  
  // Appearance
  defaultTheme: string
  accentColor: string
  compactMode: boolean
}

const defaultSettings: Settings = {
  siteName: "cashpeek",
  siteUrl: "https://cashpeek.ru",
  adminEmail: "admin@cashpeek.ru",
  metaTitle: "cashpeek — Сравнить займы онлайн",
  metaDescription: "Сравните условия проверенных МФО. Займы онлайн под 0% для новых клиентов.",
  indexationEnabled: true,
  leadsApiKey: "",
  admitadApiKey: "",
  testMode: false,
  emailNotifications: true,
  syncErrors: true,
  newConversions: true,
  weeklyReport: false,
  twoFactorAuth: false,
  sessionDuration: "24h",
  actionLogging: true,
  defaultTheme: "system",
  accentColor: "primary",
  compactMode: false,
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = React.useState<Settings>(defaultSettings)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState<string | null>(null)

  // Load settings on mount
  React.useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings')
        if (res.ok) {
          const data = await res.json()
          // Parse boolean values
          const parsed: Partial<Settings> = {}
          Object.keys(data).forEach(key => {
            const value = data[key]
            if (value === 'true') parsed[key as keyof Settings] = true as any
            else if (value === 'false') parsed[key as keyof Settings] = false as any
            else parsed[key as keyof Settings] = value
          })
          setSettings(prev => ({ ...prev, ...parsed }))
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [])

  // Save settings by category
  const saveSettings = async (category: string, keys: (keyof Settings)[]) => {
    setSaving(category)
    try {
      const settingsToSave: Record<string, { value: string; category: string }> = {}
      keys.forEach(key => {
        const value = settings[key]
        settingsToSave[key] = {
          value: String(value),
          category,
        }
      })

      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsToSave }),
      })

      if (res.ok) {
        toast({
          title: "Сохранено",
          description: "Настройки успешно обновлены",
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить настройки",
        variant: "destructive",
      })
    } finally {
      setSaving(null)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки</h1>
        <p className="text-muted-foreground">
          Управление настройками агрегатора
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Общие настройки */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Общие настройки</CardTitle>
            </div>
            <CardDescription>
              Основные параметры сайта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Название сайта</Label>
              <Input 
                id="site-name" 
                value={settings.siteName}
                onChange={(e) => updateSetting('siteName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site-url">URL сайта</Label>
              <Input 
                id="site-url" 
                value={settings.siteUrl}
                onChange={(e) => updateSetting('siteUrl', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email администратора</Label>
              <Input 
                id="admin-email" 
                type="email" 
                value={settings.adminEmail}
                onChange={(e) => updateSetting('adminEmail', e.target.value)}
              />
            </div>
            <Button 
              onClick={() => saveSettings('general', ['siteName', 'siteUrl', 'adminEmail'])}
              disabled={saving === 'general'}
            >
              {saving === 'general' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        {/* SEO настройки */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <CardTitle>SEO настройки</CardTitle>
            </div>
            <CardDescription>
              Мета-теги и индексация
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meta-title">Meta Title</Label>
              <Input 
                id="meta-title" 
                value={settings.metaTitle}
                onChange={(e) => updateSetting('metaTitle', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea 
                id="meta-description" 
                value={settings.metaDescription}
                onChange={(e) => updateSetting('metaDescription', e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Индексация поисковиками</Label>
                <p className="text-sm text-muted-foreground">
                  Разрешить индексацию сайта
                </p>
              </div>
              <Switch 
                checked={settings.indexationEnabled}
                onCheckedChange={(checked) => updateSetting('indexationEnabled', checked)}
              />
            </div>
            <Button 
              onClick={() => saveSettings('seo', ['metaTitle', 'metaDescription', 'indexationEnabled'])}
              disabled={saving === 'seo'}
            >
              {saving === 'seo' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        {/* API интеграции */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <CardTitle>API интеграции</CardTitle>
            </div>
            <CardDescription>
              Ключи доступа к внешним API
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="leads-api">Leads.su API Key</Label>
              <Input 
                id="leads-api" 
                type="password" 
                value={settings.leadsApiKey}
                onChange={(e) => updateSetting('leadsApiKey', e.target.value)}
                placeholder="Введите API ключ"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admitad-api">Admitad API Key</Label>
              <Input 
                id="admitad-api" 
                type="password" 
                value={settings.admitadApiKey}
                onChange={(e) => updateSetting('admitadApiKey', e.target.value)}
                placeholder="Введите API ключ"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Режим тестирования</Label>
                <p className="text-sm text-muted-foreground">
                  Использовать тестовый API
                </p>
              </div>
              <Switch 
                checked={settings.testMode}
                onCheckedChange={(checked) => updateSetting('testMode', checked)}
              />
            </div>
            <Button 
              onClick={() => saveSettings('api', ['leadsApiKey', 'admitadApiKey', 'testMode'])}
              disabled={saving === 'api'}
            >
              {saving === 'api' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        {/* Уведомления */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Уведомления</CardTitle>
            </div>
            <CardDescription>
              Настройка оповещений
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email уведомления</Label>
                <p className="text-sm text-muted-foreground">
                  Получать уведомления на email
                </p>
              </div>
              <Switch 
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Ошибки синхронизации</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомлять об ошибках API
                </p>
              </div>
              <Switch 
                checked={settings.syncErrors}
                onCheckedChange={(checked) => updateSetting('syncErrors', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Новые конверсии</Label>
                <p className="text-sm text-muted-foreground">
                  Уведомлять о новых конверсиях
                </p>
              </div>
              <Switch 
                checked={settings.newConversions}
                onCheckedChange={(checked) => updateSetting('newConversions', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Еженедельный отчёт</Label>
                <p className="text-sm text-muted-foreground">
                  Получать сводку каждую неделю
                </p>
              </div>
              <Switch 
                checked={settings.weeklyReport}
                onCheckedChange={(checked) => updateSetting('weeklyReport', checked)}
              />
            </div>
            <Button 
              onClick={() => saveSettings('notifications', ['emailNotifications', 'syncErrors', 'newConversions', 'weeklyReport'])}
              disabled={saving === 'notifications'}
            >
              {saving === 'notifications' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>

        {/* Безопасность */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Безопасность</CardTitle>
            </div>
            <CardDescription>
              Настройки безопасности панели
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Двухфакторная аутентификация</Label>
                <p className="text-sm text-muted-foreground">
                  Дополнительная защита аккаунта
                </p>
              </div>
              <Switch 
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => updateSetting('twoFactorAuth', checked)}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Срок действия сессии</Label>
              <Select 
                value={settings.sessionDuration}
                onValueChange={(value) => updateSetting('sessionDuration', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 час</SelectItem>
                  <SelectItem value="6h">6 часов</SelectItem>
                  <SelectItem value="24h">24 часа</SelectItem>
                  <SelectItem value="7d">7 дней</SelectItem>
                  <SelectItem value="30d">30 дней</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Логирование действий</Label>
                <p className="text-sm text-muted-foreground">
                  Записывать все действия в лог
                </p>
              </div>
              <Switch 
                checked={settings.actionLogging}
                onCheckedChange={(checked) => updateSetting('actionLogging', checked)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => saveSettings('security', ['twoFactorAuth', 'sessionDuration', 'actionLogging'])}
                disabled={saving === 'security'}
              >
                {saving === 'security' ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Сохранить
              </Button>
              <Button variant="destructive">Сменить пароль</Button>
            </div>
          </CardContent>
        </Card>

        {/* Внешний вид */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Внешний вид</CardTitle>
            </div>
            <CardDescription>
              Настройки отображения
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Тема по умолчанию</Label>
              <Select 
                value={settings.defaultTheme}
                onValueChange={(value) => updateSetting('defaultTheme', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Светлая</SelectItem>
                  <SelectItem value="dark">Тёмная</SelectItem>
                  <SelectItem value="system">Системная</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Акцентный цвет</Label>
              <div className="flex gap-2">
                <button 
                  className={`w-8 h-8 rounded-full bg-primary cursor-pointer ${settings.accentColor === 'primary' ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => updateSetting('accentColor', 'primary')}
                />
                <button 
                  className={`w-8 h-8 rounded-full bg-blue-500 cursor-pointer ${settings.accentColor === 'blue' ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                  onClick={() => updateSetting('accentColor', 'blue')}
                />
                <button 
                  className={`w-8 h-8 rounded-full bg-green-500 cursor-pointer ${settings.accentColor === 'green' ? 'ring-2 ring-green-500 ring-offset-2' : ''}`}
                  onClick={() => updateSetting('accentColor', 'green')}
                />
                <button 
                  className={`w-8 h-8 rounded-full bg-purple-500 cursor-pointer ${settings.accentColor === 'purple' ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
                  onClick={() => updateSetting('accentColor', 'purple')}
                />
                <button 
                  className={`w-8 h-8 rounded-full bg-orange-500 cursor-pointer ${settings.accentColor === 'orange' ? 'ring-2 ring-orange-500 ring-offset-2' : ''}`}
                  onClick={() => updateSetting('accentColor', 'orange')}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Компактный режим</Label>
                <p className="text-sm text-muted-foreground">
                  Уменьшить отступы в таблицах
                </p>
              </div>
              <Switch 
                checked={settings.compactMode}
                onCheckedChange={(checked) => updateSetting('compactMode', checked)}
              />
            </div>
            <Button 
              onClick={() => saveSettings('appearance', ['defaultTheme', 'accentColor', 'compactMode'])}
              disabled={saving === 'appearance'}
            >
              {saving === 'appearance' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Сохранить изменения
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
