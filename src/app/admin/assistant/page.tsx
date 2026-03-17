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
import { Save, Sparkles, Palette, MessageSquare, Zap, Building2, Plus, Trash2, GripVertical, ExternalLink } from 'lucide-react';

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

interface Mfo {
  id: string;
  name: string;
  logo: string | null;
  minAmount: number;
  maxAmount: number;
  minTerm: number;
  maxTerm: number;
  baseRate: number;
  firstLoanRate: number | null;
  decisionTime: number;
  affiliateUrl: string | null;
  features: string | null;
  sortOrder: number;
  isActive: boolean;
}

const COLORS = [
  { value: 'emerald', label: 'Изумрудный' },
  { value: 'blue', label: 'Синий' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'orange', label: 'Оранжевый' },
];

export default function AssistantSettingsPage() {
  const [settings, setSettings] = useState<AssistantSettings | null>(null);
  const [mfos, setMfos] = useState<Mfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingMfo, setEditingMfo] = useState<Mfo | null>(null);

  // Загрузка данных
  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, mfoRes] = await Promise.all([
          fetch('/api/assistant/settings'),
          fetch('/api/assistant/mfo'),
        ]);
        
        const settingsData = await settingsRes.json();
        const mfoData = await mfoRes.json();
        
        if (settingsData.success) {
          setSettings(settingsData.settings);
        }
        if (mfoData.success) {
          setMfos(mfoData.mfos);
        }
      } catch (error) {
        console.error('Failed to load:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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

  // Сохранение МФО
  const saveMfo = async (mfo: Partial<Mfo>) => {
    try {
      const url = mfo.id ? `/api/assistant/mfo/${mfo.id}` : '/api/assistant/mfo';
      const method = mfo.id ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mfo),
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(mfo.id ? 'МФО обновлено' : 'МФО добавлено');
        setEditingMfo(null);
        // Перезагружаем список
        const mfoRes = await fetch('/api/assistant/mfo');
        const mfoData = await mfoRes.json();
        if (mfoData.success) {
          setMfos(mfoData.mfos);
        }
      } else {
        toast.error('Ошибка сохранения');
      }
    } catch (error) {
      toast.error('Ошибка сохранения');
    }
  };

  // Удаление МФО
  const deleteMfo = async (id: string) => {
    if (!confirm('Удалить это МФО?')) return;
    
    try {
      const res = await fetch(`/api/assistant/mfo/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('МФО удалено');
        setMfos(mfos.filter(m => m.id !== id));
      }
    } catch (error) {
      toast.error('Ошибка удаления');
    }
  };

  // Переключение активности МФО
  const toggleMfoActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/assistant/mfo/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setMfos(mfos.map(m => m.id === id ? { ...m, isActive } : m));
      }
    } catch (error) {
      toast.error('Ошибка');
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

      <Tabs defaultValue="mfo" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-5">
          <TabsTrigger value="mfo" className="gap-2">
            <Building2 className="w-4 h-4" />
            МФО
          </TabsTrigger>
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

        {/* МФО */}
        <TabsContent value="mfo" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>МФО для чата</CardTitle>
                  <CardDescription>
                    МФО, которые ассистент будет предлагать пользователям
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setEditingMfo({
                    id: '',
                    name: '',
                    logo: null,
                    minAmount: 1000,
                    maxAmount: 30000,
                    minTerm: 7,
                    maxTerm: 30,
                    baseRate: 0.8,
                    firstLoanRate: null,
                    decisionTime: 5,
                    affiliateUrl: null,
                    features: null,
                    sortOrder: mfos.length + 1,
                    isActive: true,
                  } as Mfo)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Добавить МФО
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {mfos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Нет добавленных МФО. Нажмите "Добавить МФО" чтобы начать.
                </div>
              ) : (
                <div className="space-y-2">
                  {mfos.map((mfo) => (
                    <div
                      key={mfo.id}
                      className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center font-bold text-sm text-emerald-600">
                        {mfo.name.substring(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{mfo.name}</span>
                          {mfo.firstLoanRate === 0 && (
                            <Badge className="bg-emerald-500">0%</Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {mfo.minAmount.toLocaleString()} - {mfo.maxAmount.toLocaleString()} ₽ • {mfo.minTerm}-{mfo.maxTerm} дней • {mfo.baseRate}%/день
                        </div>
                      </div>
                      
                      {mfo.affiliateUrl && (
                        <a
                          href={mfo.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      
                      <Switch
                        checked={mfo.isActive}
                        onCheckedChange={(checked) => toggleMfoActive(mfo.id, checked)}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingMfo(mfo)}
                      >
                        Редактировать
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMfo(mfo.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Форма редактирования МФО */}
          {editingMfo && (
            <Card>
              <CardHeader>
                <CardTitle>{editingMfo.id ? 'Редактировать МФО' : 'Новое МФО'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Название</Label>
                    <Input
                      value={editingMfo.name}
                      onChange={(e) => setEditingMfo({ ...editingMfo, name: e.target.value })}
                      placeholder="Например: Займер"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL логотипа</Label>
                    <Input
                      value={editingMfo.logo || ''}
                      onChange={(e) => setEditingMfo({ ...editingMfo, logo: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Мин. сумма (₽)</Label>
                    <Input
                      type="number"
                      value={editingMfo.minAmount}
                      onChange={(e) => setEditingMfo({ ...editingMfo, minAmount: parseInt(e.target.value) || 1000 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Макс. сумма (₽)</Label>
                    <Input
                      type="number"
                      value={editingMfo.maxAmount}
                      onChange={(e) => setEditingMfo({ ...editingMfo, maxAmount: parseInt(e.target.value) || 30000 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Мин. срок (дней)</Label>
                    <Input
                      type="number"
                      value={editingMfo.minTerm}
                      onChange={(e) => setEditingMfo({ ...editingMfo, minTerm: parseInt(e.target.value) || 7 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Макс. срок (дней)</Label>
                    <Input
                      type="number"
                      value={editingMfo.maxTerm}
                      onChange={(e) => setEditingMfo({ ...editingMfo, maxTerm: parseInt(e.target.value) || 30 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Ставка (%/день)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingMfo.baseRate}
                      onChange={(e) => setEditingMfo({ ...editingMfo, baseRate: parseFloat(e.target.value) || 0.8 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Первый займ (%/день)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={editingMfo.firstLoanRate || ''}
                      onChange={(e) => setEditingMfo({ ...editingMfo, firstLoanRate: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="0 = бесплатно"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Время решения (мин)</Label>
                    <Input
                      type="number"
                      value={editingMfo.decisionTime}
                      onChange={(e) => setEditingMfo({ ...editingMfo, decisionTime: parseInt(e.target.value) || 5 })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Партнёрская ссылка</Label>
                  <Input
                    value={editingMfo.affiliateUrl || ''}
                    onChange={(e) => setEditingMfo({ ...editingMfo, affiliateUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Особенности (через запятую)</Label>
                  <Input
                    value={editingMfo.features || ''}
                    onChange={(e) => setEditingMfo({ ...editingMfo, features: e.target.value })}
                    placeholder="Первый займ 0%, Без отказа, Круглосуточно"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingMfo.isActive}
                      onCheckedChange={(checked) => setEditingMfo({ ...editingMfo, isActive: checked })}
                    />
                    <Label>Активно</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label>Сортировка:</Label>
                    <Input
                      type="number"
                      className="w-20"
                      value={editingMfo.sortOrder}
                      onChange={(e) => setEditingMfo({ ...editingMfo, sortOrder: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => saveMfo(editingMfo)}>
                    Сохранить
                  </Button>
                  <Button variant="outline" onClick={() => setEditingMfo(null)}>
                    Отмена
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

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
