'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ExternalLink } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  loans?: LoanResult[];
}

interface LoanResult {
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

const DEFAULT_WELCOME = `Здравствуйте! 👋

Напишите сумму и срок, например:
• 10 000 рублей на 2 недели
• 5 тыс на неделю
• 30 000 на месяц`;

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [showHint] = useState(true);
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Загрузка настроек
  useEffect(() => {
    fetch('/api/assistant/settings')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSettings(data.settings);
        }
      })
      .catch(console.error);
  }, []);

  // Прокрутка вниз
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  // Приветственное сообщение
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: settings?.welcomeMessage || DEFAULT_WELCOME
      }]);
    }
  }, [isOpen, settings]);

  // Эффект печатания
  const typeMessage = async (text: string) => {
    setTypingText('');
    const chars = text.split('');
    
    for (let i = 0; i < chars.length; i++) {
      await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
      setTypingText(prev => prev + chars[i]);
    }
    
    return text;
  };

  // Отправка сообщения
  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    setInput('');
    setIsLoading(true);
    
    setMessages(prev => [...prev, { role: 'user', content: messageText }]);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.json();

      if (data.success) {
        // Задержка 5 секунд + эффект печатания
        await new Promise(r => setTimeout(r, 5000));
        
        await typeMessage(data.response);
        
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.response,
          loans: data.loans || []
        }]);
        setTypingText('');
      } else {
        throw new Error(data.error || 'Ошибка');
      }
    } catch (error) {
      await new Promise(r => setTimeout(r, 2000));
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Ошибка. Попробуйте ещё раз.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Цветовая схема
  const colorClass = settings?.primaryColor === 'blue' ? 'bg-blue-500 hover:bg-blue-600' :
                     settings?.primaryColor === 'purple' ? 'bg-purple-500 hover:bg-purple-600' :
                     settings?.primaryColor === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                     'bg-emerald-500 hover:bg-emerald-600';

  const ringColor = settings?.primaryColor === 'blue' ? 'ring-blue-500/30' :
                     settings?.primaryColor === 'purple' ? 'ring-purple-500/30' :
                     settings?.primaryColor === 'orange' ? 'ring-orange-500/30' :
                     'ring-emerald-500/30';

  // Быстрые кнопки
  const quickActions = settings?.quickActionButtons?.length > 0 
    ? settings.quickActionButtons 
    : [
        { label: '5 тыс. на неделю', action: '5000 рублей на 7 дней' },
        { label: '10 тыс. на 2 недели', action: '10000 рублей на 14 дней' },
        { label: '15 тыс. на месяц', action: '15000 рублей на 30 дней' },
      ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Подсказка "Помочь с займом?" */}
        {showHint && (
          <div className="animate-bounce">
            <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Помочь с займом? 👋
            </div>
          </div>
        )}
        
        {/* Кнопка с анимациями */}
        <div className="relative">
          {/* Пульсирующее кольцо */}
          <div className={`absolute -inset-2 rounded-full animate-ping ${colorClass} opacity-20`} />
          
          {/* Свечение */}
          <div className={`absolute -inset-1 rounded-full ring-4 ${ringColor}`} />
          
          {/* Кнопка */}
          <button
            onClick={() => setIsOpen(true)}
            className={`relative w-14 h-14 ${colorClass} text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl`}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 h-[500px] bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className={`${colorClass} text-white p-4 rounded-t-lg flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold">{settings?.assistantName || 'ИИ-ассистент'}</h3>
            <p className="text-xs opacity-80">{settings?.assistantSubtitle || 'Подбор займов'}</p>
          </div>
        </div>
        <button 
          onClick={() => setIsOpen(false)} 
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className="space-y-2">
            {/* Текст сообщения */}
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? `${colorClass} text-white`
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              >
                {msg.content}
              </div>
            </div>
            
            {/* Карточки МФО */}
            {msg.loans && msg.loans.length > 0 && (
              <div className="space-y-2 mt-2">
                {msg.loans.map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {loan.logo ? (
                          <img 
                            src={loan.logo} 
                            alt={loan.name}
                            className="w-8 h-8 rounded-lg object-contain"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center text-white text-xs font-bold`}>
                            {loan.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{loan.name}</div>
                          <div className="text-xs text-gray-500">
                            {loan.amount} ₽ • {loan.term}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {loan.rate === 0 ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-1 rounded">
                            0%
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">
                            {loan.rate}%
                          </span>
                        )}
                        
                        {loan.affiliateUrl && (
                          <a
                            href={loan.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${colorClass} text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-1`}
                          >
                            Получить
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {/* Эффект печатания */}
        {typingText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
              {typingText}
              <span className="inline-block w-1 h-4 ml-0.5 bg-emerald-500 animate-pulse" />
            </div>
          </div>
        )}
        
        {/* Индикатор загрузки */}
        {isLoading && !typingText && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Quick Actions */}
      {settings?.showQuickActions !== false && messages.length <= 2 && (
        <div className="px-4 pb-2 flex gap-2 flex-wrap">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => sendMessage(action.action)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 border border-emerald-500 text-emerald-600 rounded-full hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      
      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            placeholder="Сумма и срок..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`${colorClass} text-white p-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity`}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatWidget;
