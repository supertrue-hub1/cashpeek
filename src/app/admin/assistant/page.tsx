'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, Sparkles, Palette, MessageSquare, Zap } from 'lucide-react';

interface AssistantSettings {
  id: string;
  systemPrompt: string;
  welcomeMessage: string;
  autoOpenDelay: number;
  enableSound: boolean;
  enableAutoOpen: boolean;
  maxLoanResults: number;
  assistantName: string;
  assistantSubtitle: string;
  primaryColor: string;
  showQuickActions: boolean;
  quickActionButtons: { label: string; action: string }[];
}

const COLORS = [
  { value: 'emerald', label: 'Изумрудный' },
  { value: 'blue', label: 'Синий' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'orange', label: 'Оранжевый' },
];

export default function AssistantSettingsPage() {
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Загрузка настроек
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/assistant/settings');
        const data = await res.json();
        if (data.success) {
          setSettings(data.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // Сохранение настроек
  const saveSettings = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const res = await fetch('/api/assistant/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Настройки сохранены');
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8">Загрузка...</div>;
  }

  if (!settings) {
    return <div className="p-8">Ошибка загрузки настроек</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ИИ-ассистент</h1>
          <p className="text-muted-foreground">
            Настройка чат-бота для подбора займов
          </p>
        </div>
        <Button onClick={saveSettings} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>

      <Tabs defaultValue="behavior" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="behavior" className="gap-2">
            <Zap className="w-4 h-4" />
            Поведение
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Вид
          </TabsTrigger>
          <TabsTrigger value="prompts" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Промпты
          </TabsTrigger>
          <TabsTrigger value="quick" className="gap-2">
            <Sparkles className="w-4 h-4" />
            Кнопки
          </TabsTrigger>
        </TabsList>

        {/* Поведение */}
        <TabsContent value="behavior" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Основные настройки</CardTitle>
              <CardDescription>
                Управление поведением ассистента
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Автозапуск</Label>
                  <p className="text-sm text-muted-foreground">
                    Показывать подсказку через N секунд
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={settings.enableAutoOpen}
                    onCheckedChange={(checked) => 
                      setSettings({ ...settings, enableAutoOpen: checked })
                    }
                  />
                  {settings.enableAutoOpen && (
                    <Input
                      type="number"
                      className="w-20"
                      value={settings.autoOpenDelay}
                      onChange={(e) => 
                        setSettings({ ...settings, autoOpenDelay: parseInt(e.target.value) || 6 })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Звуковые уведомления</Label>
                  <p className="text-sm text-muted-foreground">
                    Воспроизводить звук при ответе
                  </p>
                </div>
                <Switch
                  checked={settings.enableSound}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, enableSound: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Быстрые кнопки</Label>
                  <p className="text-sm text-muted-foreground">
                    Показывать кнопки быстрого выбора суммы
                  </p>
                </div>
                <Switch
                  checked={settings.showQuickActions}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, showQuickActions: checked })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Задержка автозапуска (сек)</Label>
                  <Input
                    type="number"
                    value={settings.autoOpenDelay}
                    onChange={(e) => 
                      setSettings({ ...settings, autoOpenDelay: parseInt(e.target.value) || 6 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Макс. результатов поиска</Label>
                  <Input
                    type="number"
                    value={settings.maxLoanResults}
                    onChange={(e) => 
                      setSettings({ ...settings, maxLoanResults: parseInt(e.target.value) || 4 })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Внешний вид */}
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Внешний вид</CardTitle>
              <CardDescription>
                Настройка оформления виджета
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Название ассистента</Label>
                  <Input
                    value={settings.assistantName}
                    onChange={(e) => 
                      setSettings({ ...settings, assistantName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Подзаголовок</Label>
                  <Input
                    value={settings.assistantSubtitle}
                    onChange={(e) => 
                      setSettings({ ...settings, assistantSubtitle: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Цвет кнопки</Label>
                <div className="flex gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color.value}
                      className={`w-10 h-10 rounded-full border-2 ${
                        settings.primaryColor === color.value 
                          ? 'border-primary ring-2 ring-primary/30' 
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color.value === 'emerald' ? '#10b981' : color.value === 'blue' ? '#3b82f6' : color.value === 'purple' ? '#a855f7' : '#f97316' }}
                      onClick={() => setSettings({ ...settings, primaryColor: color.value })}
                      title={color.label}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Текущий: {COLORS.find(c => c.value === settings.primaryColor)?.label}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Промпты */}
        <TabsContent value="prompts" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Промпты</CardTitle>
              <CardDescription>
                Настройка текстов ассистента
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Системный промпт</Label>
                <Textarea
                  className="min-h-[150px]"
                  value={settings.systemPrompt}
                  onChange={(e) => 
                    setSettings({ ...settings, systemPrompt: e.target.value })
                  }
                  placeholder="Инструкции для ИИ..."
                />
                <p className="text-sm text-muted-foreground">
                  Основные инструкции, которые получает ИИ при каждом запросе
                </p>
              </div>

              <div className="space-y-2">
                <Label>Приветственное сообщение</Label>
                <Textarea
                  className="min-h-[100px]"
                  value={settings.welcomeMessage}
                  onChange={(e) => 
                    setSettings({ ...settings, welcomeMessage: e.target.value })
                  }
                  placeholder="Здравствуйте! 👋 ..."
                />
                <p className="text-sm text-muted-foreground">
                  Сообщение, которое видит пользователь при первом открытии чата
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Быстрые кнопки */}
        <TabsContent value="quick" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Быстрые кнопки</CardTitle>
              <CardDescription>
                Кнопки для быстрого выбора суммы и срока
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {settings.quickActionButtons.map((btn, index) => (
                  <Badge key={index} variant="secondary" className="gap-2">
                    {btn.label}
                    <button
                      onClick={() => {
                        const newButtons = [...settings.quickActionButtons];
                        newButtons.splice(index, 1);
                        setSettings({ ...settings, quickActionButtons: newButtons });
                      }}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Например: 5 тыс на неделю"
                  id="newButtonLabel"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    const input = document.getElementById('newButtonLabel') as HTMLInputElement;
                    if (input?.value) {
                      setSettings({
                        ...settings,
                        quickActionButtons: [
                          ...settings.quickActionButtons,
                          { label: input.value, action: input.value }
                        ]
                      });
                      input.value = '';
                    }
                  }}
                >
                  Добавить
                </Button>
              </div>

              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Готовые шаблоны:</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        quickActionButtons: [
                          ...settings.quickActionButtons,
                          { label: '5 тыс. на неделю', action: '5000 на 7 дней' }
                        ]
                      });
                    }}
                  >
                    5 тыс. на неделю
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        quickActionButtons: [
                          ...settings.quickActionButtons,
                          { label: '10 тыс. на 2 недели', action: '10000 на 14 дней' }
                        ]
                      });
                    }}
                  >
                    10 тыс. на 2 недели
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSettings({
                        ...settings,
                        quickActionButtons: [
                          ...settings.quickActionButtons,
                          { label: '15 тыс. на месяц', action: '15000 на 30 дней' }
                        ]
                      });
                    }}
                  >
                    15 тыс. на месяц
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
