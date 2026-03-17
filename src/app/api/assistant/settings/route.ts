import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/assistant/settings
export async function GET() {
  try {
    let settings = await db.assistantSettings.findFirst();
    
    if (!settings) {
      settings = await db.assistantSettings.create({
        data: {
          systemPrompt: 'Ты — профессиональный ИИ-ассистент сервиса по подбору микрозаймов. Помогаешь пользователю быстро подобрать лучший займ.',
          welcomeMessage: 'Здравствуйте! 👋\n\nНапишите сумму и срок, например:\n• 10 000 рублей на 2 недели\n• 5 тыс на неделю\n• 30 000 на месяц',
          autoOpenDelay: 6,
          enableSound: true,
          enableAutoOpen: true,
          maxLoanResults: 4,
          assistantName: 'ИИ-ассистент',
          assistantSubtitle: 'Подбор займов онлайн',
          primaryColor: 'emerald',
          showQuickActions: true,
          quickActionButtons: JSON.stringify([
            { label: '5 тыс. на неделю', action: '5000 рублей на 7 дней' },
            { label: '10 тыс. на 2 недели', action: '10000 рублей на 14 дней' },
            { label: '15 тыс. на месяц', action: '15000 рублей на 30 дней' },
          ]),
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        quickActionButtons: JSON.parse(settings.quickActionButtons || '[]'),
      },
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Ошибка получения настроек' }, { status: 500 });
  }
}

// POST /api/assistant/settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Получаем текущие настройки
    let settings = await db.assistantSettings.findFirst();
    
    if (settings) {
      // Обновляем
      settings = await db.assistantSettings.update({
        where: { id: settings.id },
        data: {
          systemPrompt: body.systemPrompt,
          welcomeMessage: body.welcomeMessage,
          autoOpenDelay: body.autoOpenDelay,
          enableSound: body.enableSound,
          enableAutoOpen: body.enableAutoOpen,
          maxLoanResults: body.maxLoanResults,
          assistantName: body.assistantName,
          assistantSubtitle: body.assistantSubtitle,
          primaryColor: body.primaryColor,
          showQuickActions: body.showQuickActions,
          quickActionButtons: JSON.stringify(body.quickActionButtons || []),
        },
      });
    } else {
      // Создаём
      settings = await db.assistantSettings.create({
        data: {
          systemPrompt: body.systemPrompt,
          welcomeMessage: body.welcomeMessage,
          autoOpenDelay: body.autoOpenDelay,
          enableSound: body.enableSound,
          enableAutoOpen: body.enableAutoOpen,
          maxLoanResults: body.maxLoanResults,
          assistantName: body.assistantName,
          assistantSubtitle: body.assistantSubtitle,
          primaryColor: body.primaryColor,
          showQuickActions: body.showQuickActions,
          quickActionButtons: JSON.stringify(body.quickActionButtons || []),
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        quickActionButtons: JSON.parse(settings.quickActionButtons || '[]'),
      },
    });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Ошибка сохранения настроек' }, { status: 500 });
  }
}
