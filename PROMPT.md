Роль: Ты — Senior Frontend-разработчик и UX-архитектор с 10-летним опытом в FinTech. 
Твоя задача — спроектировать и написать код для инновационного калькулятора микрозаймов 
для сайта-агрегатора.

Контекст: Рынок перенасыщен одинаковыми калькуляторами (сумма + срок -> список ставок). 
Нам нужен инструмент, который станет «крючком» для пользователей и заставит их выбрать 
именно наш сайт. Он должен быть не просто расчетным инструментом, а «Умным помощником подбора».Framework: Next.js 16 с App Router
Language: TypeScript 5
Styling: Tailwind CSS 4
UI Components: shadcn/ui (
Animations: Framer Motion
Database: Prisma ORM (SQLite)
Icons: Lucide React

ВАЖНО:
- Используй API routes, НЕ server actions
- используй нашу тему
- Проверяй код ч
- Код должен быть production-ready


// МФО - организации выдающие займы
 МФО из базы данных
  
  // Базовые параметры
  minAmount       Int      // Минимальная сумма в рублях
  maxAmount       Int      // Максимальная сумма в рублях
  minDays         Int      // Минимальный срок в днях
  maxDays         Int      // Максимальный срок в днях
  
  // Ставки
  baseRate        Float    // Базовая ставка в % в день
  minRate         Float    // Минимальная ставка
  maxRate         Float    // Максимальная ставка
  
  // Одобрение
  approvalRate    Float    // Процент одобрения (0-100)
  avgApprovalTime Int      // Среднее время одобрения в минутах
  
  // Специальные параметры для умной сортировки
  firstLoanFree   Boolean  @default(false) // Первый займ без процентов
  loyaltyToDebts  Float    @default(0.5)   // Лояльность к закредитованности (0-1)
  speedScore      Float    @default(0.5)   // Скорость выдачи (0-1)
  supportScore    Float    @default(0.5)   // Качество поддержки (0-1)
  
  // Бейджи и рейтинг
  badges          String?  // JSON массив бейджей
  rating          Float    @default(3.5)
  reviewCount     Int      @default(0)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Цели займов - для умной сортировки
model LoanPurpose {
  id          String @id @default(cuid())
  name        String
  slug        String @unique
  icon        String
  description String
  
  // Коэффициенты для сортировки
  speedWeight     Float @default(0.25)
  approvalWeight  Float @default(0.25)
  loyaltyWeight   Float @default(0.25)
  rateWeight      Float @default(0.25)
}

// Рекомендации по срокам
model TermRecommendation {
  id              String @id @default(cuid())
  amountMin       Int
  amountMax       Int
  recommendedDays Int
  reason          String
}


API Endpoints
1. POST /api/calculator

// Request
interface CalculatorRequest {
  amount: number;      // Сумма займа
  days: number;        // Срок в днях
  purpose?: string;    // Slug цели займа (опционально)
}

// Response
interface CalculatorResponse {
  success: boolean;
  data: {
    results: MFOResult[];
    trustScore: {
      approvalChance: number;      // 0-100
      riskLevel: 'low' | 'medium' | 'high';
      riskColor: string;           // CSS color
      recommendation: string;
    };
    overpaymentIndex: number;      // Индекс переплаты
    smartTip: string;              // ИИ-подсказка
    optimalDays: number;           // Рекомендуемый срок
    potentialSaving: number;       // Потенциальная экономия
    purposes: Purpose[];
  };
}

Ключевые алгоритмы
1. Расчет шанса одобрения

function calculateApprovalChance(baseApproval, amount, maxAmount) {
  // Чем ближе сумма к максимуму, тем ниже шанс
  const ratio = amount / maxAmount;
  const penalty = ratio * 15; // Макс. снижение на 15%
  return Math.max(50, Math.min(99, baseApproval - penalty));
}


2. Smart Score для сортировки

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


3. Генерация ИИ-подсказок

function generateSmartTip(amount, days, results) {
  const bestFreeLoan = results.find(r => r.firstLoanFree && r.isAvailable);
  
  if (bestFreeLoan) {
    return `💡 ${bestFreeLoan.name} предлагает первый займ под 0%! 
            Вы сэкономите ${amount} руб.`;
  }
  
  if (days > 21 && amount < 15000) {
    const saving = Math.round(amount * 0.01 * (days - 14));
    return `💡 При сроке ${days} дней переплата высокая. 
            Рекомендуем взять на 14 дней — сэкономите до ${saving} руб.`;
  }
  
  // ... другие условия
}

UI Компоненты
1. Финансовый Радар (FinancialRadar)
// Визуальный индикатор с зонами риска
// Меняет цвет фона: зеленый → желтый → красный

function FinancialRadar({ amount, maxAmount, riskLevel }) {
  return (
    <motion.div className={`
      relative h-48 rounded-2xl 
      bg-gradient-to-br ${riskColors[riskLevel].bg}
      backdrop-blur-xl border ${riskColors[riskLevel].border}
    `}>
      {/* Радарные круги с анимацией пульсации */}
      {/* Центральный индикатор суммы */}
      {/* Бейдж уровня риска */}
      {/* Прогресс-бар внизу */}
    </motion.div>
  );
}

2. Индекс Доверия (TrustScore)

// Анимированный процент шанса одобрения
function TrustScore({ approvalChance, riskColor, recommendation }) {
  return (
    <motion.div>
      {/* Shield иконка + "Индекс доверия" */}
      {/* Анимированное число сAnimatedNumber */}
      {/* Прогресс-бар */}
      {/* Текстовая рекомендация */}
    </motion.div>
  );
}

3. Топ по категориям (TopCategories)// 3 карточки: Быстрее всех, Выгоднее всех, Надёжнее всех
function TopCategories({ mfos }) {
  const fastest = [...available].sort((a, b) => a.avgApprovalTime - b.avgApprovalTime)[0];
  const cheapest = [...available].sort(/* по ставке, 0% приоритет */)[0];
  const mostReliable = [...available].sort((a, b) => b.approvalChance - a.approvalChance)[0];
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Карточка "Быстрее всех" - cyan/blue */}
      {/* Карточка "Выгоднее всех" - emerald/green */}
      {/* Карточка "Надёжнее всех" - violet/purple */}
    </div>
  );
}

// Карточки результатов с бейджами и сравнением
function MFOCard({ mfo, index, isInCompare, onToggleCompare }) {
  return (
    <motion.div>
      {/* Бейдж "Лучшее предложение" для топ-1 */}
      {/* Название, рейтинг, отзывы */}
      {/* Метрики: ставка, шанс, время */}
      {/* Сумма к возврату */}
      {/* Бейджи МФО */}
      {/* Кнопки: "Получить займ" + "Добавить к сравнению" */}
      {/* Расширенная информация (accordion) */}
      {/* Оверлей для недоступных */}
    </motion.div>
  );
}



. Сравнение МФО (ComparisonPanel)

// Side-by-side сравнение до 3 МФО
function ComparisonPanel({ selectedMfos, onRemove }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {selectedMfos.map(mfo => (
        <div>
          {/* Название */}
          {/* Ставка, к возврату, переплата */}
          {/* Шанс, время, рейтинг */}
          {/* Бейдж "0% первый займ" */}
        </div>
      ))}
    </div>
  );
}

6. Квиз (Quiz) Popup при заходе на страницу 

// 3 вопроса для персонализации
function Quiz({ isOpen, onClose, onComplete }) {
  const questions = [
    {
      id: 'experience',
      question: 'Брали ли вы раньше микрозаймы?',
      options: [
        { value: 'newbie', label: 'Нет, это первый раз' },
        { value: 'experienced', label: 'Да, уже брал(а)' },
      ],
    },
    {
      id: 'urgency',
      question: 'Как быстро нужны деньги?',
      options: [
        { value: 'urgent', label: 'Очень срочно' },
        { value: 'normal', label: 'Могу подождать' },
      ],
    },
    {
      id: 'priority',
      question: 'Что для вас важнее?',
      options: [
        { value: 'speed', label: 'Скорость одобрения' },
        { value: 'rate', label: 'Низкая ставка' },
      ],
    },
  ];
  
  // После прохождения применяем фильтры:
  // - newbie → onlyFree: true
  // - urgent → onlyFast: true
}

Фильтры

// Кнопки фильтрации результатов
const filters = {
  onlyFree: false,        // Только 0% первый займ
  onlyFast: false,        // Только до 10 минут одобрение
  onlyHighApproval: false, // Только шанс 85%+
};

Слайдеры с визуальными зонами
Слайдер суммы:
Цветовая полоса: зеленый (до 30к) → желтый (30-70к) → красный (70-100к)
Легенда под слайдером
Слайдер срока:
Маркеры оптимальных сроков: 7, 14, 21, 30 дней
Подсказка "Оптимальный срок до зарплаты" для 10-20 дней


// Все МФО с характеристиками с базы данных!

 
