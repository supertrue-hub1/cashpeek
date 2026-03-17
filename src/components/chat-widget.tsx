'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Loan {
  id: string;
  name: string;
  logo: string | null;
  rate: number;
  term: string;
  amount: string;
  affiliateUrl: string | null;
}

interface ChatSettings {
  assistantName: string;
  assistantSubtitle: string;
  primaryColor: string;
  autoOpenDelay: number;
  enableSound: boolean;
  enableAutoOpen: boolean;
  showQuickActions: boolean;
  quickActionButtons: { label: string; action: string }[];
  welcomeMessage: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      }
    }
    loadSettings();
  }, []);

  // Показ подсказки через N секунд
  useEffect(() => {
    if (settings?.enableAutoOpen && settings.autoOpenDelay > 0) {
      const timer = setTimeout(() => {
        setShowHint(true);
      }, settings.autoOpenDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Воспроизведение звука
  const playSound = () => {
    if (settings?.enableSound) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {});
    }
  };

  // Отправка сообщения
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    setIsLoading(true);
    
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: messages,
        }),
      });

      const data = await res.json();

      if (data.success) {
        playSound();
        
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.response 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (data.loans?.length > 0) {
          setLoans(data.loans);
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Извините, произошла ошибка. Попробуйте ещё раз.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработка быстрых кнопок
  const handleQuickAction = (action: string) => {
    // Парсим сумму и срок из action
    const amountMatch = action.match(/(\d+)/);
    if (amountMatch) {
      const amount = parseInt(amountMatch[1]);
      const isThousand = action.toLowerCase().includes('тыс');
      const finalAmount = isThousand ? amount * 1000 : amount;
      
      let term = 14;
      if (action.toLowerCase().includes('недел')) term = 14;
      else if (action.toLowerCase().includes('месяц')) term = 30;
      else if (action.toLowerCase().includes('день')) term = 7;
      
      sendMessage(`${finalAmount} рублей на ${term} дней`);
    }
  };

  // Цветовая схема
  const primaryColor = settings?.primaryColor || 'emerald';
  const colorClasses = {
    emerald: 'bg-emerald-500 hover:bg-emerald-600',
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
  };

  // Первое сообщение при открытии
  useEffect(() => {
    if (isOpen && messages.length === 0 && settings?.welcomeMessage) {
      setMessages([{ 
        role: 'assistant', 
        content: settings.welcomeMessage 
      }]);
    }
  }, [isOpen, settings]);

  return (
    <>
      {/* Кнопка открытия чата */}
      <div className="fixed bottom-6 right-6 z-50">
        {isOpen ? (
          <Card className="w-[380px] h-[500px] flex flex-col shadow-2xl border-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', colorClasses[primaryColor as keyof typeof colorClasses] || colorClasses.emerald)}>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {settings?.assistantName || 'ИИ-ассистент'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {settings?.assistantSubtitle || 'Подбор займов онлайн'}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsOpen(false)}
              >
                <ChevronDown className="w-5 h-5" />
              </Button>
            </CardHeader>
            
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-2 text-sm',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}
              
              {/* Карточки займов */}
              {loans.length > 0 && (
                <div className="space-y-2 mt-4">
                  {loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {loan.logo && (
                          <img 
                            src={loan.logo} 
                            alt={loan.name}
                            className="w-8 h-8 rounded object-contain"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">{loan.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {loan.amount} руб. • {loan.term}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={loan.rate === 0 ? 'default' : 'secondary'}>
                          {loan.rate === 0 ? '0%' : `${loan.rate}%`}
                        </Badge>
                        {loan.affiliateUrl && (
                          <a
                            href={loan.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-full bg-primary/10 hover:bg-primary/20"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>
            
            {/* Быстрые кнопки */}
            {settings?.showQuickActions && messages.length <= 2 && (
              <div className="px-4 pb-2 flex gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('5 тыс на неделю')}
                >
                  5 тыс. на неделю
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('10 тыс на 2 недели')}
                >
                  10 тыс. на 2 недели
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction('15 тыс на месяц')}
                >
                  15 тыс. на месяц
                </Button>
              </div>
            )}
            
            {/* Поле ввода */}
            <div className="p-4 border-t">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  placeholder="Напишите сумму и срок..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        ) : (
          <div className="relative">
            {/* Подсказка */}
            {showHint && !isOpen && (
              <div className="absolute bottom-16 right-0 mb-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="bg-card border rounded-lg shadow-lg px-4 py-2 text-sm">
                  Помочь с займом?
                </div>
              </div>
            )}
            
            {/* Пульсация */}
            <div className="absolute -inset-2 rounded-full animate-ping bg-primary/20 opacity-75" />
            
            <Button
              size="lg"
              className={cn(
                'rounded-full w-14 h-14 shadow-lg',
                colorClasses[primaryColor as keyof typeof colorClasses] || colorClasses.emerald
              )}
              onClick={() => {
                setIsOpen(true);
                setShowHint(false);
              }}
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default ChatWidget;
