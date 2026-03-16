import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST /api/offers/bulk - Bulk update offers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ids, data } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'IDs array required' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'publish':
        result = await db.loanOffer.updateMany({
          where: { id: { in: ids } },
          data: { status: 'published' },
        });
        break;

      case 'draft':
        result = await db.loanOffer.updateMany({
          where: { id: { in: ids } },
          data: { status: 'draft' },
        });
        break;

      case 'archive':
        result = await db.loanOffer.updateMany({
          where: { id: { in: ids } },
          data: { status: 'archived' },
        });
        break;

      case 'activate':
        result = await db.loanOffer.updateMany({
          where: { id: { in: ids } },
          data: { isFeatured: true },
        });
        break;

      case 'deactivate':
        result = await db.loanOffer.updateMany({
          where: { id: { in: ids } },
          data: { isFeatured: false },
        });
        break;

      case 'update':
        if (!data) {
          return NextResponse.json({ error: 'Data object required for update' }, { status: 400 });
        }
        result = await db.loanOffer.updateMany({
          where: { id: { in: ids } },
          data,
        });
        break;

      case 'delete':
        result = await db.loanOffer.deleteMany({
          where: { id: { in: ids } },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      affected: result.count,
    });
  } catch (error) {
    console.error('Error in bulk operation:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to perform bulk operation', 
      details: errorMessage 
    }, { status: 500 });
  }
}
