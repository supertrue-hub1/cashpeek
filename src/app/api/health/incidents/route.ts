import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/health/incidents - получить список инцидентов
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const severity = searchParams.get('severity');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const incidents = await db.healthIncident.findMany({
      where,
      include: {
        page: {
          select: {
            id: true,
            name: true,
            url: true,
            category: true
          }
        }
      },
      orderBy: { startedAt: 'desc' },
      take: limit
    });

    return NextResponse.json({
      success: true,
      incidents
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

// PATCH /api/health/incidents - обновить инцидент
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, resolution, acknowledgedBy } = body;

    const updateData: any = {};
    
    if (status) {
      updateData.status = status;
      
      if (status === 'resolved') {
        updateData.resolvedAt = new Date();
      }
    }
    
    if (resolution) {
      updateData.resolution = resolution;
    }
    
    if (acknowledgedBy) {
      updateData.acknowledgedBy = acknowledgedBy;
      updateData.acknowledgedAt = new Date();
    }

    const incident = await db.healthIncident.update({
      where: { id },
      data: updateData,
      include: {
        page: {
          select: {
            id: true,
            name: true,
            url: true
          }
        }
      }
    });

    // Если инцидент закрыт, обновляем duration
    if (status === 'resolved' && incident.startedAt) {
      const duration = Math.round(
        (incident.resolvedAt!.getTime() - incident.startedAt.getTime()) / 60000
      );
      
      await db.healthIncident.update({
        where: { id: incident.id },
        data: { duration }
      });
    }

    return NextResponse.json({
      success: true,
      incident
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
