


D:\gg\agent - внедри в проект
ИИ-ассистент сервиса подбора микрозаймов
Роль
Ты — профессиональный ИИ-ассистент сервиса по подбору микрозаймов (МФО). Твоя цель — быстро и четко помочь пользователю подобрать идеальный займ из базы данных.

Важные правила
1. Скорость
Отвечай максимально кратко и по делу
Не пиши длинные вступления ("я рад помочь", "конечно, давайте посмотрим")
Используй маркированные списки
Пользователь ценит время
2. Источник данных
Ты имеешь доступ к базе данных займов через функцию search_loans
Никогда не придумывай займы сам
Если в базе пусто — честно скажи, что предложений пока нет
Всегда проверяй актуальность ставок и условий
3. Стиль общения
Дружелюбный, но деловой
Избегай "воды"
Сразу переходи к сути
Используй эмодзи умеренно (только в приветствии)
Сценарий диалога
1. Приветствие
Если пользователь поздоровался или просто зашел:

"Здравствуйте! 👋 Ищете займ? Помочь подобрать лучшие предложения?

Напишите сумму и срок, например:• "10 000 рублей на 2 недели"• "5 тыс на неделю""

2. Поиск займов
Если пользователь назвал параметры:

Извлеки сумму и срок из сообщения
Вызови функцию search_loans(amount, term)
Отсортируй по ставке (сначала выгодные)
Покажи топ-3-4 варианта
3. Формат ответа с займами
Подобрал для вас [N] варианта на [сумма] руб.:

• [МФО] - [Название займа]: [сумма] на [срок] дней, ставка [X]% в день. Оформить
• [МФО] - [Название займа]: [сумма] на [срок] дней, ставка [X]% в день. Оформить

Какой вариант рассмотреть подробнее?
### 4. Нет подходящих займов
Если в базе нет займов с такими параметрами:
> "К сожалению, нет займов на [сумма] рублей на [срок] дней.

Попробуйте изменить параметры:
• Увеличьте срок до [рекомендация]
• Увеличьте сумму до [рекомендация]

Какие параметры подойдут вам лучше?"

### 5. Запрос совета
Если пользователь просит сравнить или посоветовать:
- Сравни по переплате (ставка × срок)
- Укажи вероятность одобрения
- Отметь особые условия (0% первый займ)

## Извлечение параметров

### Сумма
Распознавай форматы:
- "5000 рублей", "10000 руб", "30000₽"
- "5 тыс", "10 тысяч", "15тр"
- "нужно 10000", "хочу 20000"

Если число < 100 и есть "тыс" — умножай на 1000.

### Срок
Распознавай форматы:
- "на неделю" = 7 дней
- "на 2 недели" = 14 дней
- "на месяц" = 30 дней
- "на 10 дней", "на 14 дней"

## Ограничения

1. Не давай финансовых советов вне темы займов
2. Не обещай гарантированное одобрение
3. Всегда упоминай, что условия могут отличаться
4. Не храни персональные данные пользователя

## Тон и стиль

- Примеры ответов должны быть на русском языке
- Используй профессиональную терминологию (МФО, ставка, переплата)
- Будь честен о рисках микрозаймов
project/
├── prisma/
│   └── schema.prisma              # Схема базы данных
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts       # API чата с ИИ
│   │   │   ├── loans/
│   │   │   │   └── route.ts       # API поиска займов (публичный)
│   │   │   ├── settings/
│   │   │   │   └── route.ts       # API настроек ассистента
│   │   │   ├── mfo/
│   │   │   │   └── route.ts       # API управления МФО
│   │   │   └── loans-admin/
│   │   │       └── route.ts       # API управления займами (CRUD)
│   │   │
│   │   
│   │   └── globals.css            # Глобальные стили
│   │
│   ├── components/
│   │   ├── ui/                    
│   │   │   
│   │   │   
│   │   │   
│   │   │  
│   │   │   
│   │   │   
│   │   │   
│   │   │  
│   │   │   
│   │   │   └
│   │   │
│   │   ├── chat-widget.tsx        # 🤖 Виджет чата (ИИ-ассистент)
│   │   └── admin-panel.tsx        # ⚙️ Админ-панель
│   │
│   └── lib/
│       ├── db.ts                  # Prisma клиент
│       └── utils.ts               # Утилиты
│
├── scripts/
│   └── seed-mfo.ts                # Заполнение БД тестовыми данными
│
// prisma/schema.prisma

// МФО - организация, выдающая займы
model MFO {
  id           String   @id @default(cuid())
  name         String   @unique
  logo         String?
  description  String?
  rating       Float    @default(4.0)
  license      String?
  website      String?
  approvalRate Float    @default(0.7)
  loans        Loan[]
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

// Займ - конкретный продукт МФО
model Loan {
  id             String   @id @default(cuid())
  mfoId          String
  mfo            MFO      @relation(fields: [mfoId], references: [id])
  name           String
  minAmount      Int
  maxAmount      Int
  minTerm        Int
  maxTerm        Int
  dailyRate      Float
  firstLoanFree  Boolean  @default(false)
  processingTime Int      @default(15)
  requirements   String?
  link           String?  // Партнерская ссылка
  active         Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

// Настройки ИИ-ассистента
model AssistantSettings {
  id                 String   @id @default(cuid())
  systemPrompt       String
  welcomeMessage     String
  autoOpenDelay      Int      @default(6)
  enableSound        Boolean  @default(true)
  enableAutoOpen     Boolean  @default(true)
  maxLoanResults     Int      @default(4)
  assistantName      String   @default("ИИ-ассистент")
  assistantSubtitle  String   @default("Подбор займов онлайн")
  primaryColor       String   @default("emerald")
  showQuickActions   Boolean  @default(true)
  quickActionButtons String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}


// POST
Request:  { message: string, history: Message[] }
Response: { success: boolean, response: string, loansFound: number }

// Логика:
// 1. Извлечь сумму и срок из сообщения
// 2. Найти подходящие займы в БД
// 3. Отправить в LLM с контекстом займов
// 4. Вернуть ответ ИИ
'


// GET ?amount=10000&term=14
Response: { success: boolean, loans: Loan[] }

// Логика:
// 1. Фильтрация по сумме (minAmount <= amount <= maxAmount)
// 2. Фильтрация по сроку (minTerm <= term <= maxTerm)
// 3. Сортировка по ставке
// 4. Вернуть топ-N результатов


// GET
Response: { success: boolean, settings: Settings }

// POST
Request:  { ...settings }
Response: { success: boolean, settings: Settings }


// GET — список МФО с займами
Response: { success: boolean, mfos: MFO[] }

// POST — создать МФО
Request:  { name, description, rating, approvalRate, website }


// Пропсы: нет (загружает настройки из API)

// Состояния:
- isOpen: boolean           // Открыт ли чат
- messages: Message[]       // История сообщений
- input: string             // Текст в поле ввода
- isLoading: boolean        // Загрузка ответа ИИ
- showHint: boolean         // Показ подсказки "Помочь?"
- settings: ChatSettings    // Настройки из БД

// Функции:
- sendMessage()             // Отправка сообщения в API
- playSound()               // Воспроизведение звука

// Эффекты:
- Загрузка настроек при монтировании
- Показ подсказки через autoOpenDelay сек
- Пульсация кнопки при showHint

// UI:
- Кнопка с пульсацией
- Подсказка "Помочь с займом?"
- Окно чата с сообщениями
- Быстрые кнопки
- Поле ввода


// Пропсы: onSettingsChange?: (settings) => void

// Состояния:
- settings: Settings        // Настройки ассистента
- mfos: MFO[]              // Список МФО
- expandedMfo: string      // Раскрытое МФО
- editingLoan: Loan        // Редактируемый займ
- showNewMfo: boolean      // Показ формы нового МФО
- showNewLoan: string      // Показ формы нового займа

// Вкладки:
1. Поведение — автозапуск, звук, быстрые кнопки
2. Внешний вид — имя, цвет
3. Промпты — системный промпт, приветствие
4. Займы — CRUD для МФО и займов

// Функции:
- saveSettings()           // Сохранить настройки
- createMfo()              // Создать МФО
- createLoan()             // Создать займ
- updateLoan()             // Обновить займ
- deleteLoan()             // Удалить займ

UI-эффекты
Пульсация кнопки чата
.animate-ping     /* Пульсирующее кольцо */
.animate-pulse    /* Пульсация кнопки */
.ring-4           /* Свечение */


.animate-bounce   /* Подпрыгивание */
transition-shadow /* Тень при наведении */

{
  "dependencies": {
    "next": "16.x",
    "react": "19.x",
    "prisma": "^6.x",
    "@prisma/client": "^6.x",
    "z-ai-web-dev-sdk": "latest",
    "tailwindcss": "4.x",
    "lucide-react": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  }
}




