import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/assistant/settings - получить настройки
export async function GET() {
  try {
    let settings = await db.assistantSettings.findFirst();
    
    // Если настроек нет - создаём
    if (!settings) {
      settings = await db.assistantSettings.create({
        data: {},
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
    return NextResponse.json(
      { error: 'Ошибка получения настроек' },
      { status: 500 }
    );
  }
}

// POST /api/assistant/settings - сохранить настройки
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const settings = await db.assistantSettings.upsert({
      where: { id: 'default' },
      create: {
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
      update: {
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
    
    return NextResponse.json({
      success: true,
      settings: {
        ...settings,
        quickActionButtons: JSON.parse(settings.quickActionButtons || '[]'),
      },
    });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json(
      { error: 'Ошибка сохранения настроек' },
      { status: 500 }
    );
  }
}
