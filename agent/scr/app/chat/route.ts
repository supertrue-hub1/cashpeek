import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// AI SDK заглушка (временно отключено)
const ZAI = {
  create: async () => null
}

// Дефолтный системный промпт (если настройки не загружены)
const DEFAULT_SYSTEM_PROMPT = `Ты — профессиональный ИИ-ассистент сервиса по подбору микрозаймов (МФО). Твоя цель — быстро и четко помочь пользователю подобрать идеальный займ из нашей базы данных.

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

Какой вариант рассмотреть подробнее?"`

// Функция поиска займов в БД
async function searchLoansInDB(amount?: number, term?: number, maxResults: number = 4) {
  try {
    let loans = await db.loan.findMany({
      where: {
        active: true,
      },
      include: {
        mfo: true,
      },
    })

    // Фильтрация по сумме
    if (amount) {
      loans = loans.filter(
        (loan) => loan.minAmount <= amount && loan.maxAmount >= amount
      )
    }

    // Фильтрация по сроку
    if (term) {
      loans = loans.filter(
        (loan) => loan.minTerm <= term && loan.maxTerm >= term
      )
    }

    // Сортировка по ставке (сначала самые выгодные)
    loans.sort((a, b) => a.dailyRate - b.dailyRate)

    // Ограничиваем до maxResults
    const topLoans = loans.slice(0, maxResults)

    return topLoans.map((loan) => ({
      id: loan.id,
      name: loan.name,
      mfoName: loan.mfo.name,
      mfoRating: loan.mfo.rating,
      approvalRate: loan.mfo.approvalRate,
      minAmount: loan.minAmount,
      maxAmount: loan.maxAmount,
      minTerm: loan.minTerm,
      maxTerm: loan.maxTerm,
      dailyRate: loan.dailyRate,
      firstLoanFree: loan.firstLoanFree,
      processingTime: loan.processingTime,
      requirements: loan.requirements,
      link: loan.link,
    }))
  } catch (error) {
    console.error('Error searching loans:', error)
    return []
  }
}

// Извлечение параметров из сообщения пользователя
function extractSearchParams(message: string): { amount?: number; term?: number } {
  const result: { amount?: number; term?: number } = {}

  // Поиск суммы (различные форматы) - важно соблюдать порядок!
  const amountPatterns = [
    // Сначала точные паттерны с валютой
    /(\d{1,3}(?:\s?\d{3})*)\s*(рублей|руб|р\.|р|₽)/i,  // "5000 рублей", "10 000 руб"
    /(\d+)\s*(тыс|т\.р\.?|тр|тысяч)/i,  // "5 тыс", "10 тысяч"
    // Потом более общие
    /нужно?\s*(\d{1,3}(?:\s?\d{3})*)/i,  // "нужно 5000"
    /хочу\s*(\d{1,3}(?:\s?\d{3})*)/i,
    /дай(?:те)?\s*(\d{1,3}(?:\s?\d{3})*)/i,
    /займ\s*(?:на\s*)?(\d{1,3}(?:\s?\d{3})*)/i,
    /(\d{4,})/,  // 4+ значные числа (1000, 5000, 10000)
  ]

  for (const pattern of amountPatterns) {
    const match = message.match(pattern)
    if (match) {
      // Очищаем число от пробелов
      let amountStr = match[1].replace(/\s/g, '')
      let amount = parseInt(amountStr)

      // Если нашли "тыс" - умножаем на 1000
      if (match[0].match(/тыс|т\.р|тр|тысяч/i)) {
        amount *= 1000
      }

      // Если число слишком маленькое (< 100), возможно это "тысячи"
      if (amount < 100 && !match[0].match(/тыс|т\.р|тр|тысяч/i)) {
        // Проверяем контекст - может это тысячи
        if (message.match(/тыс|тысяч/i)) {
          amount *= 1000
        }
      }

      result.amount = amount
      break
    }
  }

  // Поиск срока (дни, недели)
  const termPatterns = [
    /(\d+)\s*(дн[еяй]|день|дня|дней)/i,
    /на\s*(\d+)\s*дн/i,
    /срок\s*(\d+)/i,
    /(\d+)\s*недел[ьяи]/i,
    /на\s*недел[ьюя]/i,
    /на\s*пар[уы]\s*дн/i,
  ]

  for (const pattern of termPatterns) {
    const match = message.match(pattern)
    if (match) {
      let term = parseInt(match[1])
      // Если неделя = 7 дней
      if (match[0].match(/недел/i)) {
        term = term * 7
      }
      // "на неделю" = 7 дней
      if (match[0].match(/на\s*недел/i)) {
        term = 7
      }
      // "на пару дней" = 2 дня
      if (match[0].match(/пар[уы]\s*дн/i)) {
        term = 2
      }
      result.term = term
      break
    }
  }

  return result
}

// Глобальный экземпляр ZAI (заглушка)
let zaiInstance: any = null

async function getZAI() {
  // AI временно отключён - возвращаем null
  return null
}

export async function POST(request: NextRequest) {
  try {
    const { message, history = [] } = await request.json()

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Сообщение не указано' },
        { status: 400 }
      )
    }

    // Загружаем настройки через raw SQL (для совместимости с кешированным Prisma клиентом)
    let settings: any = null
    try {
      const result = await db.$queryRaw`SELECT * FROM AssistantSettings LIMIT 1`
      settings = Array.isArray(result) && result.length > 0 ? result[0] : null
    } catch (e) {
      console.log('Could not load settings, using defaults')
    }

    const systemPrompt = settings?.systemPrompt || DEFAULT_SYSTEM_PROMPT
    const maxResults = settings?.maxLoanResults || 4

    // Извлекаем параметры поиска из сообщения
    const searchParams = extractSearchParams(message)

    // Если есть параметры поиска - ищем займы
    let loans: any[] = []
    if (searchParams.amount || searchParams.term) {
      loans = await searchLoansInDB(searchParams.amount, searchParams.term, maxResults)
    }

    const zai = await getZAI()

    // Формируем контекст с результатами поиска
    let contextMessage = message
    if (loans.length > 0) {
      const loansContext = loans
        .map(
          (loan) =>
            `- ${loan.mfoName} - ${loan.name}: сумма ${loan.minAmount}-${loan.maxAmount}₽, срок ${loan.minTerm}-${loan.maxTerm} дней, ставка ${loan.dailyRate}% в день, ${loan.firstLoanFree ? 'первый займ без процентов' : ''}, одобрение ${Math.round((loan.approvalRate || 0.7) * 100)}%, ссылка: ${loan.link || 'нет ссылки'}`
        )
        .join('\n')

      contextMessage = `${message}\n\nНАЙДЕННЫЕ ЗАЙМЫ В БАЗЕ ДАННЫХ:\n${loansContext}\n\nИспользуй эти данные для ответа пользователю. Отметь, что это реальные предложения из базы.`
    } else if (searchParams.amount || searchParams.term) {
      contextMessage = `${message}\n\nВНИМАНИЕ: В базе данных нет подходящих займов с такими параметрами. Сообщи пользователю об этом и предложи изменить параметры поиска.`
    }

    // Если AI недоступен - возвращаем базовый ответ с найденными займами
    if (!zai) {
      let response = ''
      if (loans.length > 0) {
        response = `Подобрал для вас ${loans.length} варианта:\n\n`
        loans.forEach((loan, i) => {
          response += `${i + 1}. **${loan.mfoName} - ${loan.name}**: сумма ${loan.minAmount}-${loan.maxAmount}₽, срок ${loan.minTerm}-${loan.maxTerm} дней, ставка ${loan.dailyRate}% в день`
          if (loan.firstLoanFree) response += ', первый займ без процентов'
          response += '\n'
        })
      } else if (searchParams.amount || searchParams.term) {
        response = `К сожалению, не нашлось займов с указанными параметрами. Попробуйте изменить сумму или срок.`
      } else {
        response = `Здравствуйте! Я помогу подобрать займ. Укажите сумму и срок, которые вас интересуют.`
      }

      return NextResponse.json({
        success: true,
        response,
        searchParams,
        loansFound: loans.length,
      })
    }

    // Формируем историю сообщений
    const messages = [
      { role: 'assistant' as const, content: systemPrompt },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role as 'user' | 'assistant',
        content: h.content,
      })),
      { role: 'user' as const, content: contextMessage },
    ]

    const completion = await zai.chat.completions.create({
      messages,
      thinking: { type: 'disabled' },
    })

    const response = completion.choices[0]?.message?.content || 'Извините, не удалось обработать запрос.'

    return NextResponse.json({
      success: true,
      response,
      searchParams,
      loansFound: loans.length,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка обработки запроса' },
      { status: 500 }
    )
  }
}
