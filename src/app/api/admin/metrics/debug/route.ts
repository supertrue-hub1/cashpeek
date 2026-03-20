/**
 * Debug endpoint для проверки подключения к Яндекс.Метрике
 * Удалить после отладки!
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = process.env.METRICA_TOKEN
  const counterId = process.env.NEXT_PUBLIC_YM_ID

  // Проверка наличия переменных
  if (!token) {
    return NextResponse.json({
      error: 'METRICA_TOKEN не найден в env',
      hasToken: false,
      hasCounterId: !!counterId,
      counterId,
    })
  }

  if (!counterId) {
    return NextResponse.json({
      error: 'NEXT_PUBLIC_YM_ID не найден в env',
      hasToken: !!token,
      hasCounterId: false,
      tokenPreview: token.substring(0, 10) + '...',
    })
  }

  // Прямой запрос к API Метрики
  try {
    const url = `https://api-metrika.yandex.ru/stat/v1/data?ids=${counterId}&metrics=ym:s:visits&date1=7daysAgo&date2=today&limit=5`

    const response = await fetch(url, {
      headers: {
        'Authorization': `OAuth ${token}`,
        'Content-Type': 'application/json',
      },
    })

    const responseText = await response.text()
    let responseData

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { rawText: responseText.substring(0, 500) }
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      hasToken: true,
      tokenLength: token.length,
      tokenPreview: token.substring(0, 15) + '...',
      counterId,
      requestUrl: url,
      response: responseData,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Ошибка запроса к API',
      message: error instanceof Error ? error.message : 'Unknown error',
      hasToken: !!token,
      tokenLength: token?.length,
      counterId,
    })
  }
}
