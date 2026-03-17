import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

// Дефолтные настройки
const DEFAULT_SETTINGS = {
  systemPrompt: `Ты — профессиональный ИИ-ассистент сервиса по подбору микрозаймов (МФО). Твоя цель — быстро и четко помочь пользователю подобрать идеальный займ из нашей базы данных.

ВАЖНЫЕ ПРАВИЛА:
1. СКОРОСТЬ: Отвечай максимально кратко и по делу. Не пиши длинные вступления. Пользователь ценит время. Используй маркированные списки.
2. ИСТОЧНИК ДАННЫХ: Ты имеешь доступ к базе данных займов. Когда пользователь называет сумму и срок - ты ДОЛЖЕН вызвать функцию search_loans для поиска подходящих вариантов.
3. СТИЛЬ ОБЩЕНИЯ: Дружелюбный, но деловой. Избегай "воды" ("я рад помочь", "конечно, давайте посмотрим"). Сразу переходи к сути.

СЦЕНАРИЙ ДИАЛОГА:
1. Если пользователь поздоровался или просто зашел: Спроси, какая сумма и срок его интересуют.
2. Если пользователь назвал параметры: Сформируй JSON с параметрами поиска. Формат: {"amount": число, "term": число}
3. В ответе обязательно укажи: Название МФО, сумму, срок, процентную ставку и ссылку на оформление (если есть).
4. Если пользователь просит совет: Сравни варианты по переплате или вероятности одобрения.

ФОРМАТ ОТВЕТА с займами:
"Подобрал для вас [N] варианта на [сумма] руб.:

• **[Название МФО] - [Название займа]**: [сумма] на [срок] дней, ставка [X]% в день. [Оформить](ссылка)
• ...

Какой вариант рассмотреть подробнее?"`,
  welcomeMessage: `Здравствуйте! 👋 Ищете займ? Помочь подобрать лучшие предложения?

Напишите сумму и срок, например:
• "10 000 рублей на 2 недели"
• "5 тыс на неделю"`,
  autoOpenDelay: 6,
  enableSound: true,
  enableAutoOpen: true,
  maxLoanResults: 4,
  assistantName: 'ИИ-ассистент',
  assistantSubtitle: 'Подбор займов онлайн',
  primaryColor: 'emerald',
  showQuickActions: true,
  quickActionButtons: '5000₽ на неделю,10000₽ на 2 недели,30000₽ на месяц',
}

// Получение настроек через raw SQL (для совместимости с кешированным Prisma клиентом)
async function getSettingsRaw() {
  try {
    const result = await db.$queryRaw`SELECT * FROM AssistantSettings LIMIT 1`
    return Array.isArray(result) && result.length > 0 ? result[0] : null
  } catch (error) {
    console.error('Error in raw query:', error)
    return null
  }
}

// Создание настроек через raw SQL
async function createSettingsRaw() {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()

  await db.$executeRaw`
    INSERT INTO AssistantSettings (
      id, systemPrompt, welcomeMessage, autoOpenDelay, enableSound,
      enableAutoOpen, maxLoanResults, assistantName, assistantSubtitle,
      primaryColor, showQuickActions, quickActionButtons, createdAt, updatedAt
    ) VALUES (
      ${id}, ${DEFAULT_SETTINGS.systemPrompt}, ${DEFAULT_SETTINGS.welcomeMessage},
      ${DEFAULT_SETTINGS.autoOpenDelay}, ${DEFAULT_SETTINGS.enableSound ? 1 : 0},
      ${DEFAULT_SETTINGS.enableAutoOpen ? 1 : 0}, ${DEFAULT_SETTINGS.maxLoanResults},
      ${DEFAULT_SETTINGS.assistantName}, ${DEFAULT_SETTINGS.assistantSubtitle},
      ${DEFAULT_SETTINGS.primaryColor}, ${DEFAULT_SETTINGS.showQuickActions ? 1 : 0},
      ${DEFAULT_SETTINGS.quickActionButtons}, ${now}, ${now}
    )
  `

  return { id, ...DEFAULT_SETTINGS }
}

// GET - получить настройки
export async function GET() {
  try {
    let settings = await getSettingsRaw()

    // Если настроек нет - создаем дефолтные
    if (!settings) {
      settings = await createSettingsRaw()
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: settings.id,
        systemPrompt: settings.systemPrompt,
        welcomeMessage: settings.welcomeMessage,
        autoOpenDelay: settings.autoOpenDelay,
        enableSound: Boolean(settings.enableSound),
        enableAutoOpen: Boolean(settings.enableAutoOpen),
        maxLoanResults: settings.maxLoanResults,
        assistantName: settings.assistantName,
        assistantSubtitle: settings.assistantSubtitle,
        primaryColor: settings.primaryColor,
        showQuickActions: Boolean(settings.showQuickActions),
        quickActionButtons: settings.quickActionButtons,
      },
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    // Возвращаем дефолтные настройки при ошибке
    return NextResponse.json({
      success: true,
      settings: {
        id: 'default',
        ...DEFAULT_SETTINGS,
      },
    })
  }
}

// POST - обновить настройки
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    let settings = await getSettingsRaw()

    const now = new Date().toISOString()

    if (settings) {
      // Обновляем существующие
      await db.$executeRaw`
        UPDATE AssistantSettings SET
          systemPrompt = ${body.systemPrompt ?? settings.systemPrompt},
          welcomeMessage = ${body.welcomeMessage ?? settings.welcomeMessage},
          autoOpenDelay = ${body.autoOpenDelay ?? settings.autoOpenDelay},
          enableSound = ${body.enableSound !== undefined ? (body.enableSound ? 1 : 0) : settings.enableSound},
          enableAutoOpen = ${body.enableAutoOpen !== undefined ? (body.enableAutoOpen ? 1 : 0) : settings.enableAutoOpen},
          maxLoanResults = ${body.maxLoanResults ?? settings.maxLoanResults},
          assistantName = ${body.assistantName ?? settings.assistantName},
          assistantSubtitle = ${body.assistantSubtitle ?? settings.assistantSubtitle},
          primaryColor = ${body.primaryColor ?? settings.primaryColor},
          showQuickActions = ${body.showQuickActions !== undefined ? (body.showQuickActions ? 1 : 0) : settings.showQuickActions},
          quickActionButtons = ${body.quickActionButtons ?? settings.quickActionButtons},
          updatedAt = ${now}
        WHERE id = ${settings.id}
      `

      settings = await getSettingsRaw()
    } else {
      // Создаем новые
      settings = await createSettingsRaw()
    }

    return NextResponse.json({
      success: true,
      settings: {
        id: settings!.id,
        systemPrompt: settings!.systemPrompt,
        welcomeMessage: settings!.welcomeMessage,
        autoOpenDelay: settings!.autoOpenDelay,
        enableSound: Boolean(settings!.enableSound),
        enableAutoOpen: Boolean(settings!.enableAutoOpen),
        maxLoanResults: settings!.maxLoanResults,
        assistantName: settings!.assistantName,
        assistantSubtitle: settings!.assistantSubtitle,
        primaryColor: settings!.primaryColor,
        showQuickActions: Boolean(settings!.showQuickActions),
        quickActionButtons: settings!.quickActionButtons,
      },
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сохранения настроек' },
      { status: 500 }
    )
  }
}
