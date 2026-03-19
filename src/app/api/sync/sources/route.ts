import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/sync/sources - получить настройки источников
export async function GET() {
  try {
    // Получаем настройки из БД
    const settings = await db.setting.findMany({
      where: { category: 'sync' },
    });
    
    // Преобразуем в удобный формат
    const sources = settings.reduce((acc, s) => {
      try {
        acc[s.key] = JSON.parse(s.value);
      } catch {
        acc[s.key] = s.value;
      }
      return acc;
    }, {} as Record<string, any>);
    
    return NextResponse.json(sources);
  } catch (error) {
    console.error('[API /api/sync/sources] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get sources' },
      { status: 500 }
    );
  }
}

// POST /api/sync/sources - сохранить настройки источника
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source, apiUrl, apiKey, enabled } = body;
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      );
    }
    
    // Сохраняем настройки
    await db.setting.upsert({
      where: { key: `sync_${source}` },
      update: {
        value: JSON.stringify({
          apiUrl: apiUrl || '',
          apiKey: apiKey || '',
          enabled: enabled ?? false,
          updatedAt: new Date().toISOString(),
        }),
        category: 'sync',
      },
      create: {
        key: `sync_${source}`,
        value: JSON.stringify({
          apiUrl: apiUrl || '',
          apiKey: apiKey || '',
          enabled: enabled ?? false,
          createdAt: new Date().toISOString(),
        }),
        category: 'sync',
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/sync/sources] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save source' },
      { status: 500 }
    );
  }
}

// DELETE /api/sync/sources - удалить настройки источника
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const source = searchParams.get('source');
    
    if (!source) {
      return NextResponse.json(
        { error: 'Source is required' },
        { status: 400 }
      );
    }
    
    await db.setting.delete({
      where: { key: `sync_${source}` },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /api/sync/sources] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete source' },
      { status: 500 }
    );
  }
}
