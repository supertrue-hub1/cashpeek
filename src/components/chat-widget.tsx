'use client';

import { useState, useRef } from 'react';
import { MessageCircle, Send, Loader2, Sparkles, ChevronDown, ExternalLink } from 'lucide-react';
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

const DEFAULT_WELCOME = `Здравствуйте! 👋 Ищете займ? Помогу подобрать лучшие предложения.

Напишите сумму и срок, например:
• "10 000 рублей на 2 недели"
• "5 тыс на неделю"
• "30 000 на месяц"`;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Прокрутка к последнему сообщению
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: data.response 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        if (data.loans?.length > 0) {
          setLoans(data.loans);
        }
      } else {
        throw new Error(data.error || 'Ошибка');
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Извините, произошла ошибка. Попробуйте ещё раз.' 
      }]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // Быстрые кнопки
  const handleQuickAction = (amount: number, term: number) => {
    sendMessage(`${amount} рублей на ${term} дней`);
  };

  // Открытие чата
  const handleOpen = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: DEFAULT_WELCOME }]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <Card className="w-[380px] h-[520px] flex flex-col shadow-2xl border-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b bg-emerald-500 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base text-white">
                  ИИ-ассистент
                </CardTitle>
                <p className="text-xs text-white/80">
                  Подбор займов онлайн
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
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
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800'
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
                      <Badge variant={loan.rate === 0 ? 'default' : 'secondary'} className={loan.rate === 0 ? 'bg-emerald-500' : ''}>
                        {loan.rate === 0 ? '0%' : `${loan.rate}%`}
                      </Badge>
                      {loan.affiliateUrl && (
                        <a
                          href={loan.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600"
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
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                  <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </CardContent>
          
          {/* Быстрые кнопки */}
          {messages.length <= 2 && (
            <div className="px-4 pb-2 flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(5000, 7)}
              >
                5 тыс. на неделю
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(10000, 14)}
              >
                10 тыс. на 2 недели
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAction(15000, 30)}
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
                className="flex-1"
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading || !input.trim()}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
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
          {/* Пульсация */}
          <div className="absolute -inset-2 rounded-full animate-ping bg-emerald-500/20 opacity-75" />
          
          <Button
            size="lg"
            className="rounded-full w-14 h-14 shadow-lg bg-emerald-500 hover:bg-emerald-600"
            onClick={handleOpen}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;
