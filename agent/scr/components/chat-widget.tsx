'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageCircle, X, Send, Loader2, Sparkles, Clock, Percent, Shield, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSettings {
  welcomeMessage: string
  autoOpenDelay: number
  enableSound: boolean
  enableAutoOpen: boolean
  assistantName: string
  assistantSubtitle: string
  primaryColor: string
  showQuickActions: boolean
  quickActionButtons: string
}

// Маппинг цветов в Tailwind классы
const COLOR_MAP: Record<string, { gradient: string; bg: string; text: string; hover: string; ring: string }> = {
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500',
    text: 'text-emerald-600',
    hover: 'hover:bg-emerald-600',
    ring: 'ring-emerald-400',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-600',
    ring: 'ring-blue-400',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-600',
    ring: 'ring-purple-400',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-500',
    text: 'text-orange-600',
    hover: 'hover:bg-orange-600',
    ring: 'ring-orange-400',
  },
  rose: {
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-500',
    text: 'text-rose-600',
    hover: 'hover:bg-rose-600',
    ring: 'ring-rose-400',
  },
  slate: {
    gradient: 'from-slate-500 to-gray-500',
    bg: 'bg-slate-500',
    text: 'text-slate-600',
    hover: 'hover:bg-slate-600',
    ring: 'ring-slate-400',
  },
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [settings, setSettings] = useState<ChatSettings | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Загрузка настроек
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings')
        const data = await response.json()
        if (data.success) {
          setSettings(data.settings)
          // Устанавливаем приветственное сообщение
          setMessages([
            {
              id: 'welcome',
              role: 'assistant',
              content: data.settings.welcomeMessage,
              timestamp: new Date(),
            },
          ])
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
  }, [])

  // Получаем классы для текущего цвета
  const colorClasses = COLOR_MAP[settings?.primaryColor || 'emerald']

  // Воспроизведение звука
  const playSound = useCallback(() => {
    if (!settings?.enableSound) return
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioContextRef.current
      const oscillator = ctx.createOscillator()
      const gainNode = ctx.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)

      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + 0.3)
    } catch (e) {
      console.log('Audio not supported')
    }
  }, [settings?.enableSound])

  // Показ подсказки "Помочь?" через задержку
  useEffect(() => {
    if (!settings?.enableAutoOpen || isOpen) return

    const timer = setTimeout(() => {
      setShowHint(true)
      playSound()
    }, (settings.autoOpenDelay || 6) * 1000)

    return () => clearTimeout(timer)
  }, [settings?.enableAutoOpen, settings?.autoOpenDelay, isOpen, playSound])

  // Скрыть подсказку при открытии чата
  useEffect(() => {
    if (isOpen) {
      setShowHint(false)
    }
  }, [isOpen])

  // Фокус на инпут при открытии
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Скролл к последнему сообщению
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Отправка сообщения
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Формируем историю для контекста
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history,
        }),
      })

      const data = await response.json()

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте еще раз.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // Быстрые кнопки
  const quickActions = settings?.showQuickActions
    ? (settings.quickActionButtons || '').split(',').filter(Boolean)
    : []

  if (!settings) {
    return null // Ждем загрузки настроек
  }

  return (
    <>
      {/* Кнопка открытия чата с эффектом пульсации */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Пульсирующие кольца */}
        {showHint && !isOpen && (
          <>
            <div className={cn(
              'absolute inset-0 rounded-full animate-ping',
              `bg-gradient-to-r ${colorClasses.gradient} opacity-20`
            )} />
            <div className={cn(
              'absolute -inset-2 rounded-full animate-pulse',
              `ring-4 ${colorClasses.ring} opacity-30`
            )} />
          </>
        )}

        {/* Подсказка "Помочь?" */}
        {showHint && !isOpen && (
          <div className="absolute bottom-20 right-0 animate-bounce">
            <button
              onClick={() => {
                setIsOpen(true)
                setShowHint(false)
              }}
              className="bg-white rounded-2xl shadow-xl px-5 py-3 border border-gray-100 hover:shadow-2xl transition-shadow cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sparkles className={cn('w-5 h-5', colorClasses.text)} />
                <span className="font-medium text-gray-800">Помочь с займом?</span>
              </div>
            </button>
          </div>
        )}

        {/* Сама кнопка чата */}
        <button
          onClick={() => {
            setIsOpen(true)
            setShowHint(false)
          }}
          className={cn(
            'relative w-16 h-16 rounded-full shadow-lg',
            `bg-gradient-to-r ${colorClasses.gradient}`,
            'flex items-center justify-center',
            'transition-all duration-300 ease-out',
            'hover:scale-110 hover:shadow-xl',
            showHint && !isOpen && 'animate-pulse',
            isOpen && 'scale-0 opacity-0 pointer-events-none'
          )}
          aria-label="Открыть чат"
        >
          <MessageCircle className="w-7 h-7 text-white" />
        </button>
      </div>

      {/* Окно чата */}
      <div
        className={cn(
          'fixed bottom-6 right-6 z-50',
          'w-[380px] h-[580px]',
          'bg-white rounded-2xl shadow-2xl',
          'flex flex-col overflow-hidden',
          'transition-all duration-300 ease-out',
          isOpen
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-95 opacity-0 translate-y-4 pointer-events-none'
        )}
      >
        {/* Заголовок */}
        <div className={cn('p-4 flex items-center justify-between', `bg-gradient-to-r ${colorClasses.gradient}`)}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">{settings.assistantName}</h3>
              <p className="text-white/80 text-xs">{settings.assistantSubtitle}</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            aria-label="Закрыть чат"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Преимущества */}
        <div className={cn('px-4 py-2 flex items-center justify-around text-xs border-b', `bg-${settings.primaryColor}-50 text-${settings.primaryColor}-700 border-${settings.primaryColor}-100`)}>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>3 мин</span>
          </div>
          <div className="flex items-center gap-1">
            <Percent className="w-3 h-3" />
            <span>от 0% первичным</span>
          </div>
          <div className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            <span>Безопасно</span>
          </div>
        </div>

        {/* Сообщения */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3',
                    message.role === 'user'
                      ? cn(colorClasses.bg, 'text-white rounded-br-md')
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content.split('\n').map((line, i) => {
                      // Обработка ссылок
                      const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/)
                      if (linkMatch) {
                        return (
                          <span key={i}>
                            {line.replace(/\[([^\]]+)\]\(([^)]+)\)/, '')}
                            <a
                              href={linkMatch[2]}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                'inline-flex items-center gap-1 mt-1',
                                `${colorClasses.text} hover:underline font-medium`,
                                message.role === 'user' && 'text-white underline'
                              )}
                            >
                              {linkMatch[1]}
                              <ChevronRight className="w-3 h-3" />
                            </a>
                          </span>
                        )
                      }
                      // Обработка жирного текста
                      const boldLine = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                      return (
                        <p key={i} dangerouslySetInnerHTML={{ __html: boldLine }} />
                      )
                    })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Подбираю варианты...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Быстрые кнопки */}
        {messages.length === 1 && quickActions.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInput(action.trim())}
                  className={cn(
                    'text-xs px-3 py-1.5 rounded-full transition-colors',
                    `bg-${settings.primaryColor}-50 hover:bg-${settings.primaryColor}-100 ${colorClasses.text}`
                  )}
                >
                  {action.trim()}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Поле ввода */}
        <div className="p-4 border-t border-gray-100">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
            className="flex gap-2"
          >
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишите сумму и срок..."
              className={cn(
                'flex-1 rounded-full',
                `border-gray-200 focus:border-${settings.primaryColor}-300 focus:ring-${settings.primaryColor}-200`
              )}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading}
              className={cn('rounded-full shrink-0', colorClasses.bg, colorClasses.hover)}
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
