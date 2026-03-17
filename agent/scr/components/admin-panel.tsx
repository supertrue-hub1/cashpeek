'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  MessageSquare,
  Clock,
  Volume2,
  Palette,
  Sparkles,
  Save,
  RotateCcw,
  CheckCircle,
  Loader2,
  Building2,
  Percent,
  Link,
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Settings {
  id: string
  systemPrompt: string
  welcomeMessage: string
  autoOpenDelay: number
  enableSound: boolean
  enableAutoOpen: boolean
  maxLoanResults: number
  assistantName: string
  assistantSubtitle: string
  primaryColor: string
  showQuickActions: boolean
  quickActionButtons: string
}

interface Loan {
  id: string
  name: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  dailyRate: number
  firstLoanFree: boolean
  processingTime: number
  link: string
  requirements: string
  active: boolean
}

interface MFO {
  id: string
  name: string
  description: string
  rating: number
  approvalRate: number
  website: string
  loans: Loan[]
}

const COLOR_OPTIONS = [
  { value: 'emerald', label: 'Изумрудный', gradient: 'from-emerald-500 to-teal-500' },
  { value: 'blue', label: 'Синий', gradient: 'from-blue-500 to-cyan-500' },
  { value: 'purple', label: 'Фиолетовый', gradient: 'from-purple-500 to-pink-500' },
  { value: 'orange', label: 'Оранжевый', gradient: 'from-orange-500 to-amber-500' },
  { value: 'rose', label: 'Розовый', gradient: 'from-rose-500 to-red-500' },
  { value: 'slate', label: 'Серый', gradient: 'from-slate-500 to-gray-500' },
]

interface AdminPanelProps {
  onSettingsChange?: (settings: Settings) => void
}

export function AdminPanel({ onSettingsChange }: AdminPanelProps) {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [mfos, setMfos] = useState<MFO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [expandedMfo, setExpandedMfo] = useState<string | null>(null)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  const [showNewMfo, setShowNewMfo] = useState(false)
  const [showNewLoan, setShowNewLoan] = useState<string | null>(null)

  // Форма нового МФО
  const [newMfo, setNewMfo] = useState({
    name: '',
    description: '',
    rating: 4.5,
    approvalRate: 0.8,
    website: '',
  })

  // Форма нового/редактируемого займа
  const [loanForm, setLoanForm] = useState({
    mfoId: '',
    name: '',
    minAmount: 1000,
    maxAmount: 30000,
    minTerm: 5,
    maxTerm: 30,
    dailyRate: 0.8,
    firstLoanFree: true,
    processingTime: 15,
    link: '',
    requirements: '',
    active: true,
  })

  // Загрузка данных
  useEffect(() => {
    if (isOpen) {
      if (!settings) fetchSettings()
      fetchMfos()
    }
  }, [isOpen])

  const fetchSettings = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMfos = async () => {
    try {
      const response = await fetch('/api/mfo')
      const data = await response.json()
      if (data.success) {
        setMfos(data.mfos)
      }
    } catch (error) {
      console.error('Error fetching MFOs:', error)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
        setSaveSuccess(true)
        onSettingsChange?.(data.settings)
        setTimeout(() => setSaveSuccess(false), 2000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (!settings) return
    setSettings({ ...settings, [key]: value })
  }

  const resetToDefaults = () => {
    if (!settings) return
    setSettings({
      ...settings,
      autoOpenDelay: 6,
      enableSound: true,
      enableAutoOpen: true,
      maxLoanResults: 4,
      assistantName: 'ИИ-ассистент',
      assistantSubtitle: 'Подбор займов онлайн',
      primaryColor: 'emerald',
      showQuickActions: true,
      quickActionButtons: '5000₽ на неделю,10000₽ на 2 недели,30000₽ на месяц',
    })
  }

  // Создание МФО
  const createMfo = async () => {
    if (!newMfo.name) return

    try {
      const response = await fetch('/api/mfo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMfo),
      })
      const data = await response.json()
      if (data.success) {
        setMfos([...mfos, data.mfo])
        setNewMfo({ name: '', description: '', rating: 4.5, approvalRate: 0.8, website: '' })
        setShowNewMfo(false)
      }
    } catch (error) {
      console.error('Error creating MFO:', error)
    }
  }

  // Создание займа
  const createLoan = async () => {
    if (!loanForm.mfoId || !loanForm.name) return

    try {
      const response = await fetch('/api/loans-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loanForm),
      })
      const data = await response.json()
      if (data.success) {
        await fetchMfos()
        setLoanForm({
          mfoId: '',
          name: '',
          minAmount: 1000,
          maxAmount: 30000,
          minTerm: 5,
          maxTerm: 30,
          dailyRate: 0.8,
          firstLoanFree: true,
          processingTime: 15,
          link: '',
          requirements: '',
          active: true,
        })
        setShowNewLoan(null)
      }
    } catch (error) {
      console.error('Error creating loan:', error)
    }
  }

  // Обновление займа
  const updateLoan = async () => {
    if (!editingLoan) return

    try {
      const response = await fetch('/api/loans-admin', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingLoan.id, ...loanForm }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchMfos()
        setEditingLoan(null)
        setLoanForm({
          mfoId: '',
          name: '',
          minAmount: 1000,
          maxAmount: 30000,
          minTerm: 5,
          maxTerm: 30,
          dailyRate: 0.8,
          firstLoanFree: true,
          processingTime: 15,
          link: '',
          requirements: '',
          active: true,
        })
      }
    } catch (error) {
      console.error('Error updating loan:', error)
    }
  }

  // Удаление займа
  const deleteLoan = async (id: string) => {
    if (!confirm('Удалить этот займ?')) return

    try {
      await fetch(`/api/loans-admin?id=${id}`, { method: 'DELETE' })
      await fetchMfos()
    } catch (error) {
      console.error('Error deleting loan:', error)
    }
  }

  // Начать редактирование займа
  const startEditLoan = (mfoId: string, loan: Loan) => {
    setEditingLoan(loan)
    setLoanForm({
      mfoId,
      name: loan.name,
      minAmount: loan.minAmount,
      maxAmount: loan.maxAmount,
      minTerm: loan.minTerm,
      maxTerm: loan.maxTerm,
      dailyRate: loan.dailyRate,
      firstLoanFree: loan.firstLoanFree,
      processingTime: loan.processingTime,
      link: loan.link || '',
      requirements: loan.requirements || '',
      active: loan.active,
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="fixed top-4 right-4 z-50 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white hover:shadow-xl transition-all border border-gray-100"
          aria-label="Открыть настройки"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </SheetTrigger>
      <SheetContent className="w-[550px] sm:max-w-[550px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Настройки ИИ-ассистента
          </SheetTitle>
          <SheetDescription>
            Настройте поведение, внешний вид и базу займов
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : settings ? (
          <div className="mt-6 space-y-6">
            <Tabs defaultValue="behavior" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="behavior">Поведение</TabsTrigger>
                <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
                <TabsTrigger value="prompts">Промпты</TabsTrigger>
                <TabsTrigger value="loans">Займы</TabsTrigger>
              </TabsList>

              {/* Вкладка "Поведение" */}
              <TabsContent value="behavior" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      <Label className="font-medium">Показ подсказки</Label>
                    </div>
                    <Switch
                      checked={settings.enableAutoOpen}
                      onCheckedChange={(checked) => updateSetting('enableAutoOpen', checked)}
                    />
                  </div>

                  {settings.enableAutoOpen && (
                    <div className="space-y-2 pl-6">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Задержка перед показом:</span>
                        <Badge variant="secondary">{settings.autoOpenDelay} сек</Badge>
                      </div>
                      <Slider
                        value={[settings.autoOpenDelay]}
                        onValueChange={([value]) => updateSetting('autoOpenDelay', value)}
                        min={1}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-500" />
                    <Label className="font-medium">Звук уведомления</Label>
                  </div>
                  <Switch
                    checked={settings.enableSound}
                    onCheckedChange={(checked) => updateSetting('enableSound', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    <Label className="font-medium">Быстрые кнопки</Label>
                  </div>
                  <Switch
                    checked={settings.showQuickActions}
                    onCheckedChange={(checked) => updateSetting('showQuickActions', checked)}
                  />
                </div>

                {settings.showQuickActions && (
                  <div className="space-y-2 pl-6">
                    <Label className="text-sm text-gray-500">Текст кнопок (через запятую)</Label>
                    <Textarea
                      value={settings.quickActionButtons}
                      onChange={(e) => updateSetting('quickActionButtons', e.target.value)}
                      className="h-20"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-500" />
                    <Label className="font-medium">Максимум займов в ответе</Label>
                  </div>
                  <div className="flex items-center gap-4 pl-6">
                    <Slider
                      value={[settings.maxLoanResults]}
                      onValueChange={([value]) => updateSetting('maxLoanResults', value)}
                      min={1}
                      max={10}
                      step={1}
                      className="flex-1"
                    />
                    <Badge variant="secondary" className="w-8 justify-center">
                      {settings.maxLoanResults}
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              {/* Вкладка "Внешний вид" */}
              <TabsContent value="appearance" className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="font-medium">Имя ассистента</Label>
                  <Input
                    value={settings.assistantName}
                    onChange={(e) => updateSetting('assistantName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Подзаголовок</Label>
                  <Input
                    value={settings.assistantSubtitle}
                    onChange={(e) => updateSetting('assistantSubtitle', e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-500" />
                    <Label className="font-medium">Основной цвет</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateSetting('primaryColor', color.value)}
                        className={cn(
                          'flex items-center gap-2 p-2 rounded-lg border-2 transition-all',
                          settings.primaryColor === color.value
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-transparent hover:border-gray-200'
                        )}
                      >
                        <div className={cn('w-6 h-6 rounded-full bg-gradient-to-r', color.gradient)} />
                        <span className="text-sm">{color.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Вкладка "Промпты" */}
              <TabsContent value="prompts" className="space-y-6 mt-4">
                <div className="space-y-2">
                  <Label className="font-medium">Приветственное сообщение</Label>
                  <Textarea
                    value={settings.welcomeMessage}
                    onChange={(e) => updateSetting('welcomeMessage', e.target.value)}
                    className="h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-medium">Системный промпт ИИ</Label>
                  <Textarea
                    value={settings.systemPrompt}
                    onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                    className="h-48 font-mono text-sm"
                  />
                </div>
              </TabsContent>

              {/* Вкладка "Займы" */}
              <TabsContent value="loans" className="space-y-4 mt-4">
                {/* Кнопка добавления МФО */}
                <Button
                  onClick={() => setShowNewMfo(!showNewMfo)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить МФО
                </Button>

                {/* Форма нового МФО */}
                {showNewMfo && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <Input
                      placeholder="Название МФО"
                      value={newMfo.name}
                      onChange={(e) => setNewMfo({ ...newMfo, name: e.target.value })}
                    />
                    <Input
                      placeholder="Описание"
                      value={newMfo.description}
                      onChange={(e) => setNewMfo({ ...newMfo, description: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Рейтинг (1-5)"
                        step="0.1"
                        value={newMfo.rating}
                        onChange={(e) => setNewMfo({ ...newMfo, rating: parseFloat(e.target.value) })}
                      />
                      <Input
                        type="number"
                        placeholder="% одобрения"
                        step="0.1"
                        value={newMfo.approvalRate}
                        onChange={(e) => setNewMfo({ ...newMfo, approvalRate: parseFloat(e.target.value) })}
                      />
                    </div>
                    <Input
                      placeholder="Сайт"
                      value={newMfo.website}
                      onChange={(e) => setNewMfo({ ...newMfo, website: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Button onClick={createMfo} className="flex-1">Создать</Button>
                      <Button variant="outline" onClick={() => setShowNewMfo(false)}>Отмена</Button>
                    </div>
                  </div>
                )}

                {/* Список МФО */}
                <div className="space-y-2">
                  {mfos.map((mfo) => (
                    <div key={mfo.id} className="border rounded-lg overflow-hidden">
                      {/* Заголовок МФО */}
                      <button
                        onClick={() => setExpandedMfo(expandedMfo === mfo.id ? null : mfo.id)}
                        className="w-full p-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5 text-gray-400" />
                          <div className="text-left">
                            <div className="font-medium">{mfo.name}</div>
                            <div className="text-xs text-gray-500">
                              {mfo.loans.length} займов • Рейтинг {mfo.rating}
                            </div>
                          </div>
                        </div>
                        {expandedMfo === mfo.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </button>

                      {/* Развернутый список займов */}
                      {expandedMfo === mfo.id && (
                        <div className="border-t bg-gray-50 p-3 space-y-2">
                          {/* Кнопка добавления займа */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowNewLoan(mfo.id)
                              setLoanForm({ ...loanForm, mfoId: mfo.id })
                            }}
                            className="w-full"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Добавить займ
                          </Button>

                          {/* Список займов */}
                          {mfo.loans.map((loan) => (
                            <div key={loan.id} className="bg-white rounded-lg p-3 border">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{loan.name}</span>
                                    {loan.firstLoanFree && (
                                      <Badge variant="secondary" className="text-xs">0% первый</Badge>
                                    )}
                                    {!loan.active && (
                                      <Badge variant="destructive" className="text-xs">Выкл</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {loan.minAmount.toLocaleString()}-{loan.maxAmount.toLocaleString()}₽ •
                                    {loan.minTerm}-{loan.maxTerm} дней •
                                    {loan.dailyRate}%/день
                                  </div>
                                  {loan.link && (
                                    <a
                                      href={loan.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-emerald-600 hover:underline flex items-center gap-1 mt-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      {loan.link.length > 40 ? loan.link.substring(0, 40) + '...' : loan.link}
                                    </a>
                                  )}
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => startEditLoan(mfo.id, loan)}
                                    className="h-7 w-7"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => deleteLoan(loan.id)}
                                    className="h-7 w-7 text-red-500 hover:text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Форма редактирования/создания займа */}
                {(editingLoan || showNewLoan) && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl p-5 w-full max-w-md max-h-[90vh] overflow-y-auto">
                      <h3 className="font-semibold text-lg mb-4">
                        {editingLoan ? 'Редактировать займ' : 'Новый займ'}
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm">Название займа</Label>
                          <Input
                            value={loanForm.name}
                            onChange={(e) => setLoanForm({ ...loanForm, name: e.target.value })}
                            placeholder="Экспресс"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-sm">Мин. сумма</Label>
                            <Input
                              type="number"
                              value={loanForm.minAmount}
                              onChange={(e) => setLoanForm({ ...loanForm, minAmount: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Макс. сумма</Label>
                            <Input
                              type="number"
                              value={loanForm.maxAmount}
                              onChange={(e) => setLoanForm({ ...loanForm, maxAmount: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-sm">Мин. срок (дней)</Label>
                            <Input
                              type="number"
                              value={loanForm.minTerm}
                              onChange={(e) => setLoanForm({ ...loanForm, minTerm: parseInt(e.target.value) })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">Макс. срок (дней)</Label>
                            <Input
                              type="number"
                              value={loanForm.maxTerm}
                              onChange={(e) => setLoanForm({ ...loanForm, maxTerm: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm">Ставка в день (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            value={loanForm.dailyRate}
                            onChange={(e) => setLoanForm({ ...loanForm, dailyRate: parseFloat(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Партнерская ссылка</Label>
                          <Input
                            value={loanForm.link}
                            onChange={(e) => setLoanForm({ ...loanForm, link: e.target.value })}
                            placeholder="https://partner.com/..."
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Первый займ 0%</Label>
                          <Switch
                            checked={loanForm.firstLoanFree}
                            onCheckedChange={(checked) => setLoanForm({ ...loanForm, firstLoanFree: checked })}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <Label className="text-sm">Активен</Label>
                          <Switch
                            checked={loanForm.active}
                            onCheckedChange={(checked) => setLoanForm({ ...loanForm, active: checked })}
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Время рассмотрения (мин)</Label>
                          <Input
                            type="number"
                            value={loanForm.processingTime}
                            onChange={(e) => setLoanForm({ ...loanForm, processingTime: parseInt(e.target.value) })}
                          />
                        </div>

                        <div>
                          <Label className="text-sm">Требования</Label>
                          <Textarea
                            value={loanForm.requirements}
                            onChange={(e) => setLoanForm({ ...loanForm, requirements: e.target.value })}
                            placeholder="Паспорт РФ, возраст от 18"
                            className="h-16"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={editingLoan ? updateLoan : createLoan}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600"
                        >
                          {editingLoan ? 'Сохранить' : 'Создать'}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingLoan(null)
                            setShowNewLoan(null)
                            setLoanForm({
                              mfoId: '',
                              name: '',
                              minAmount: 1000,
                              maxAmount: 30000,
                              minTerm: 5,
                              maxTerm: 30,
                              dailyRate: 0.8,
                              firstLoanFree: true,
                              processingTime: 15,
                              link: '',
                              requirements: '',
                              active: true,
                            })
                          }}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Кнопки действий */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : saveSuccess ? (
                  <CheckCircle className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saveSuccess ? 'Сохранено!' : 'Сохранить настройки'}
              </Button>
              <Button
                variant="outline"
                onClick={resetToDefaults}
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Не удалось загрузить настройки
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
