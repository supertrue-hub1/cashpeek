Роль: Ты — Senior Frontend-разработчик и UX-архитектор с 10-летним опытом в FinTech. Твоя задача — спроектировать и написать код для инновационного калькулятора микрозаймов для сайта-агрегатора.

## Контекст
Рынок перенасыщен одинаковыми калькуляторами (сумма + срок -> список ставок). Нам нужен инструмент, который станет «крючком» для пользователей и заставит их выбрать именно наш сайт. Он должен быть не просто расчетным инструментом, а «Умным помощником подбора».

## Технологический стек (ОБЯЗАТЕЛЬНО)
- Framework: Next.js 16 с App Router
- Language: TypeScript 5
- Styling: Tailwind CSS 4
- UI Components: shadcn/ui (New York style)
- Animations: Framer Motion
- Database: Prisma ORM (SQLite)
- Icons: Lucide React

## Ключевые фичи (Уникальность)

### 1. Интерфейс «Финансовый Радар»
Вместо стандартных input-полей сделай интерактивную визуализацию:
- Пользователь тянет ползунок суммы, а фон калькулятора меняет цвет (от зеленого «безопасная зона» до красного «риск отказа»)
- Добавь «умный» ползунок срока с маркерами оптимальных сроков (7, 14, 21, 30 дней)
- Подсветка «день зарплаты» при выборе срока 10-20 дней

### 2. Метрика «Индекс Доверия» (Trust Score)
Это главная фишка, которой нет у других:
- Реальное время показывать «Ваш шанс на одобрение» (в процентах) и «Индекс переплаты»
- Когда пользователь меняет сумму, цифра шанса меняется динамически (анимированно)
- Геймификация: «Берем 10 000 руб. — Шанс 98%», «Берем 30 000 руб. — Шанс 65%»

### 3. Умная сортировка «Цель займа»
Визуальные карточки с иконками (До зарплаты, Ремонт, Подарок, Рефинансирование, Медицина, Образование):
- При выборе цели алгоритм сортирует МФО не по ставке, а по соответствию профилю
- Для «Рефинансирования» — лояльность к закредитованности
- Для «До зарплаты» — скорость выдачи

### 4. Результат выдачи «Smart Cards»
Результаты — живые карточки с бейджами, НЕ таблица:
- Бейдж «Лучшее предложение» для топ-1
- Бейдж «0% первый займ»
- ИИ-логика: предупреждения «Лучше взять на 2 дня меньше и сэкономить 500 руб»
- Сортировка по умолчанию: «Лучшее предложение для вас» (гибрид низкой ставки и высокого шанса одобрения)

## Архитектура данных

### Prisma Schema
```prisma
model MFO {
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  description     String?
  
  minAmount       Int
  maxAmount       Int
  minDays         Int
  maxDays         Int
  
  baseRate        Float
  minRate         Float
  maxRate         Float
  
  approvalRate    Float    // Процент одобрения (0-100)
  avgApprovalTime Int      // Среднее время одобрения в минутах
  
  firstLoanFree   Boolean  @default(false)
  loyaltyToDebts  Float    @default(0.5)   // Лояльность к закредитованности (0-1)
  speedScore      Float    @default(0.5)
  supportScore    Float    @default(0.5)
  
  badges          String?  // JSON массив бейджей
  
  rating          Float    @default(3.5)
  reviewCount     Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model LoanPurpose {
  id          String @id @default(cuid())
  name        String
  slug        String @unique
  icon        String
  description String
  
  speedWeight     Float @default(0.25)
  approvalWeight  Float @default(0.25)
  loyaltyWeight   Float @default(0.25)
  rateWeight      Float @default(0.25)
}


Алгоритм Smart Score
// Расчет шанса одобрения
function calculateApprovalChance(baseApproval, amount, maxAmount) {
  const ratio = amount / maxAmount;
  const penalty = ratio * 15;
  return Math.max(50, Math.min(99, baseApproval - penalty));
}

// Smart Score для сортировки
function calculateSmartScore(mfo, weights, rate, approval, amount, max) {
  const rateScore = rate === 0 ? 1 : Math.max(0, 1 - rate / 2);
  const approvalScore = approval / 100;
  
  return (
    mfo.speedScore * weights.speedWeight +
    mfo.loyaltyToDebts * weights.loyaltyWeight +
    approvalScore * weights.approvalWeight +
    rateScore * weights.rateWeight
  ) * 100;
}



UI/UX Требования
Стиль: Glassmorphism
Декоративные элементы: blur-3xl круги
Анимации (Framer Motion)
Плавное появление элементов с задержкой
Scale при hover на карточках
Анимированные числа при изменении
Пульсация на радаре
Адаптивность
Mobile-first подход
Сетка: 1 колонка на мобильных, 3 колонки на desktop
Левая колонка: ввод данных, Правая: результаты


Seed Data (МФО)
Наполни базу из БД
Критерии успеха
Калькулятор работает без ошибок
Анимации плавные (60fps)
Данные загружаются с debounce 300ms
UI адаптивен для всех устройств
Код чистый, без TypeScript ошибок
Важно
НЕ создавай тестовые файлы
Используй API routes, не server actions
