import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/settings - Get all settings or by category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    const settings = await db.setting.findMany(
      category ? { where: { category } } : undefined
    );

    // Convert array to object
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error('Error fetching settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to fetch settings', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// POST /api/settings - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { settings } = body as { settings: Record<string, { value: string; category?: string }> };

    if (!settings) {
      return NextResponse.json({ error: 'Settings required' }, { status: 400 });
    }

    // Update or create each setting
    const updates = await Promise.all(
      Object.entries(settings).map(async ([key, data]) => {
        return db.setting.upsert({
          where: { key },
          update: { value: data.value },
          create: {
            key,
            value: data.value,
            category: data.category || 'general',
          },
        });
      })
    );

    return NextResponse.json({
      success: true,
      updated: updates.length,
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to update settings', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// DELETE /api/settings - Reset settings to defaults
export async function DELETE() {
  try {
    await db.setting.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return NextResponse.json({ error: 'Failed to reset settings' }, { status: 500 });
  }
}
