# Промт для ИИ Агента: Интеграция квиза подбора займов

## Контекст
Есть существующий сайт-агрегатор МФО на Next.js 16 (App Router). Нужно заменить текущий калькулятор на главной странице на полноценный квиз подбора займов с выводом результатов из базы данных.

---

## Технический стек
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Prisma ORM (SQLite)
- **Animations**: Framer Motion
- **Icons**: Lucide React

---

## Задачи

### 1. Создать схему базы данных (Prisma)

В файле `prisma/schema.prisma` создать модель для МФО:

```prisma
model MfoCompany {
  id          String   @id @default(cuid())
  name        String   // Название МФО
  logo        String?  // URL логотипа
  rate        Float    // Ставка в день (0, 0.5, 0.8 и т.д.)
  maxAmount   Int      // Максимальная сумма займа
  maxTerm     Int      // Максимальный срок в днях
  minTerm     Int      // Минимальный срок
  approval    Int      // % одобрения (например, 95)
  time        String   // Время рассмотрения (например, "5 мин")
  features    String   // Особенности (JSON строка или текст)
  link        String   // Партнёрская ссылка
  isActive    Boolean  @default(true)
  priority    Int      @default(0) // Для сортировки
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

После редактирования схемы выполнить:
```bash
bun run db:push
```

---

### 2. Наполнить базу данными

Создать seed-файл или добавить через Prisma Studio несколько МФО:

**Пример данных:**

| name | rate | maxAmount | maxTerm | minTerm | approval | time |
|------|------|-----------|---------|---------|----------|------|
| "Займер" | 0.0 | 30000 | 30 | 1 | 96 | "4 мин" |
| "MoneyMan" | 0.5 | 30000 | 30 | 5 | 94 | "7 мин" |
| "Webbankir" | 0.8 | 30000 | 31 | 1 | 92 | "10 мин" |
| "Турбозайм" | 0.5 | 25000 | 30 | 1 | 93 | "5 мин" |
| "Екапуста" | 0.0 | 30000 | 21 | 1 | 97 | "3 мин" |
| "Moneza" | 0.8 | 30000 | 30 | 5 | 91 | "8 мин" |

---

### 3. Создать API для получения МФО

Файл: `src/app/api/mfo/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const amount = parseInt(searchParams.get('amount') || '10000')
  const term = parseInt(searchParams.get('term') || '14')

  const mfoList = await db.mfoCompany.findMany({
    where: {
      isActive: true,
      maxAmount: { gte: amount },
      maxTerm: { gte: term },
      minTerm: { lte: term }
    },
    orderBy: [
      { rate: 'asc' },
      { priority: 'desc' }
    ],
    take: 10
  })

  return NextResponse.json(mfoList)
}
```

---

### 4. Компонент квиза (Quiz.tsx)

**Требования к квизу:**

1. **Шаг 1**: Выбор суммы (слайдер 1 000 - 30 000 ₽)
2. **Шаг 2**: Выбор срока (слайдер 1-30 дней)
3. **Шаг 3**: Анимация поиска (2 секунды)
4. **Шаг 4**: Вывод карточек МФО из БД

**Без персональных данных!** Никаких форм с именем, телефоном, email.

**Структура компонента:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// ... imports

interface MfoCompany {
  id: string
  name: string
  logo: string | null
  rate: number
  maxAmount: number
  maxTerm: number
  approval: number
  time: string
  features: string
  link: string
}

export default function Quiz() {
  const [step, setStep] = useState(1)
  const [amount, setAmount] = useState(15000)
  const [term, setTerm] = useState(14)
  const [isLoading, setIsLoading] = useState(false)
  const [mfoList, setMfoList] = useState<MfoCompany[]>([])

  // Функция загрузки МФО
  const fetchMfo = async () => {
    setIsLoading(true)
    setStep(3) // Шаг загрузки
    
    // Имитация поиска
    await new Promise(r => setTimeout(r, 2000))
    
    const res = await fetch(`/api/mfo?amount=${amount}&term=${term}`)
    const data = await res.json()
    
    setMfoList(data)
    setIsLoading(false)
    setStep(4) // Шаг результатов
  }

  // Рендер карточек МФО
  const renderMfoCards = () => (
    <div className="space-y-4">
      {mfoList.map((mfo, index) => (
        <motion.div
          key={mfo.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border"
        >
          {/* Логотип и название */}
          <div className="flex items-center gap-4 mb-4">
            {mfo.logo && <img src={mfo.logo} alt={mfo.name} className="w-12 h-12" />}
            <div>
              <h3 className="font-bold text-lg">{mfo.name}</h3>
              <p className="text-sm text-gray-500">до {mfo.maxAmount.toLocaleString()} ₽</p>
            </div>
          </div>
          
          {/* Характеристики */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-xs text-gray-500">Ставка</p>
              <p className="font-bold text-lg">
                {mfo.rate === 0 ? '0%' : `${mfo.rate}%`}
                {mfo.rate === 0 && <span className="text-xs text-emerald-500 block">первый займ</span>}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Одобрение</p>
              <p className="font-bold text-lg">{mfo.approval}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Время</p>
              <p className="font-bold text-lg">{mfo.time}</p>
            </div>
          </div>
          
          {/* Расчёт переплаты */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span>К возврату:</span>
              <span className="font-bold">
                {Math.round(amount + (amount * mfo.rate / 100) * term).toLocaleString()} ₽
              </span>
            </div>
          </div>
          
          {/* Кнопка */}
          <a
            href={mfo.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
          >
            Получить займ
          </a>
        </motion.div>
      ))}
    </div>
  )

  // ... остальной код
}
```

---

### 5. Интеграция на главную страницу

В файле `src/app/page.tsx`:

```typescript
import Quiz from '@/components/Quiz'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header>...</header>
      
      {/* Hero секция */}
      <section className="py-8">
        <h1>Подберём лучший займ за минуту</h1>
        <p>Сравните предложения от проверенных МФО</p>
      </section>
      
      {/* Квиз вместо калькулятора */}
      <Quiz />
      
      {/* Footer */}
      <footer>...</footer>
    </main>
  )
}
```

---

### 6. Дизайн карточек МФО

**Карточка должна содержать:**
- Логотип МФО (если есть)
- Название
- Ставка (выделить 0% первым займ)
- Процент одобрения
- Время рассмотрения
- Расчёт суммы к возврату
- Кнопка "Получить займ" (партнёрская ссылка)

**Цветовое кодирование ставок:**
- `rate === 0` → Зелёный бейдж "0% первый займ"
- `rate <= 0.5` → Синий бейдж
- `rate > 0.5` → Серый бейдж

---

### 7. Особенности реализации

1. **Сортировка**: МФО с 0% ставкой показываются первыми
2. **Фильтрация**: Показывать только те МФО, которые могут выдать запрошенную сумму на запрошенный срок
3. **Анимации**: Плавное появление карточек с задержкой
4. **Адаптивность**: Mobile-first, карточки хорошо выглядят на мобильных
5. **Кнопка "Назад"**: Возможность вернуться и изменить параметры
6. **Сохранение состояния**: Можно использовать URL-параметры для шаринга результатов

---

### 8. Пример готового результата

После прохождения квиза пользователь видит:

```
┌─────────────────────────────────────┐
│  [Логотип] Екапуста                 │
│            до 30 000 ₽              │
├─────────────────────────────────────┤
│  Ставка    │  Одобрение  │  Время   │
│  0%        │  97%        │  3 мин   │
│  первый займ                        │
├─────────────────────────────────────┤
│  К возврату: 15 000 ₽               │
├─────────────────────────────────────┤
│  [    Получить займ    ]            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Логотип] Займер                   │
│            до 30 000 ₽              │
├─────────────────────────────────────┤
│  Ставка    │  Одобрение  │  Время   │
│  0%        │  96%        │  4 мин   │
│  первый займ                        │
├─────────────────────────────────────┤
│  К возврату: 15 000 ₽               │
├─────────────────────────────────────┤
│  [    Получить займ    ]            │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  [Логотип] MoneyMan                 │
│            до 30 000 ₽              │
├─────────────────────────────────────┤
│  Ставка    │  Одобрение  │  Время   │
│  0.5%      │  94%        │  7 мин   │
├─────────────────────────────────────┤
│  К возврату: 16 050 ₽               │
├─────────────────────────────────────┤
│  [    Получить займ    ]            │
└─────────────────────────────────────┘
```

---

## Итоговый чек-лист

- [ ] Создать Prisma схему `MfoCompany`
- [ ] Выполнить `bun run db:push`
- [ ] Наполнить БД тестовыми данными (минимум 6 МФО с разными ставками: 0%, 0.5%, 0.8%)
- [ ] Создать API endpoint `/api/mfo` с фильтрацией по сумме и сроку
- [ ] Обновить компонент Quiz (убрать персональные данные)
- [ ] Добавить вывод карточек МФО на шаге результатов
- [ ] Интегрировать Quiz в page.tsx
- [ ] Проверить адаптивность на мобильных устройствах
- [ ] Добавить расчёт суммы к возврату для каждой МФО

---

## Дополнительные улучшения (опционально)

1. Добавить возможность сортировки результатов по ставке/одобрению
2. Добавить бейдж "Рекомендуем" для топовых МФО
3. Добавить счётчик "Найдено X предложений"
4. Добавить кнопку "Показать ещё" если МФО больше 5
5. Сохранять результаты в localStorage для возврата
