'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  if (isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-2xl border-2 flex flex-col">
        {/* Header */}
        <div className="bg-emerald-500 text-white p-4 rounded-t-lg flex items-center justify-between">
          <div>
            <h3 className="font-bold">ИИ-ассистент</h3>
            <p className="text-xs opacity-80">Подбор займов</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="bg-gray-100 rounded-lg p-3 text-sm">
            Здравствуйте! 👋 Напишите сумму и срок, например: "10 000 рублей на 2 недели"
          </div>
        </div>
        
        {/* Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Сумма и срок..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
            />
            <button className="bg-emerald-500 text-white p-2 rounded-lg hover:bg-emerald-600">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 flex items-center justify-center"
    >
      <MessageCircle className="w-6 h-6" />
    </button>
  );
}

export default ChatWidget;
