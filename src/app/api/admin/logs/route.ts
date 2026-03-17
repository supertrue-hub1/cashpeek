import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/logs - Get audit and sync logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all'; // all, audit, sync
    const level = searchParams.get('level') || 'all'; // all, info, success, warning, error
    const source = searchParams.get('source') || 'all';
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const logs: any[] = [];

    // Get Audit Logs
    if (type === 'all' || type === 'audit') {
      const auditLogs = await db.auditLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { email: true, name: true }
          },
          offer: {
            select: { name: true }
          }
        }
      });

      auditLogs.forEach(log => {
        let logLevel = 'info';
        if (log.action === 'DELETE') logLevel = 'error';
        else if (log.action === 'CREATE') logLevel = 'success';
        else if (log.action === 'UPDATE') logLevel = 'info';
        else if (log.action === 'SYNC') logLevel = 'info';

        logs.push({
          id: `audit-${log.id}`,
          type: 'audit',
          level: logLevel,
          source: log.source === 'api_sync' ? 'API Sync' : 'Admin Action',
          message: getAuditMessage(log),
          details: log.fieldName ? `${log.fieldName}: ${log.oldValue || 'null'} → ${log.newValue || 'null'}` : null,
          timestamp: log.createdAt.toISOString(),
          user: log.user?.email || log.userEmail || 'System',
          offerName: log.offer?.name,
          action: log.action,
          ipAddress: log.ipAddress,
        });
      });
    }

    // Get Sync Logs
    if (type === 'all' || type === 'sync') {
      const syncLogs = await db.syncLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { startedAt: 'desc' },
      });

      syncLogs.forEach(log => {
        let logLevel = 'info';
        if (log.status === 'error') logLevel = 'error';
        else if (log.status === 'partial') logLevel = 'warning';
        else if (log.status === 'success') logLevel = 'success';

        logs.push({
          id: `sync-${log.id}`,
          type: 'sync',
          level: logLevel,
          source: log.source,
          message: getSyncMessage(log),
          details: log.errorMessage || `Processed: ${log.offersProcessed}, Updated: ${log.offersUpdated}, Added: ${log.offersAdded}, Errors: ${log.errors}`,
          timestamp: log.startedAt.toISOString(),
          completedAt: log.completedAt?.toISOString(),
          duration: log.durationMs ? `${(log.durationMs / 1000).toFixed(1)}s` : null,
          status: log.status,
          stats: {
            processed: log.offersProcessed,
            updated: log.offersUpdated,
            added: log.offersAdded,
            unchanged: log.offersUnchanged,
            errors: log.errors,
          }
        });
      });
    }

    // Sort by timestamp
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply filters
    let filteredLogs = logs;

    if (level !== 'all') {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }

    if (source !== 'all') {
      filteredLogs = filteredLogs.filter(log => 
        log.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredLogs = filteredLogs.filter(log =>
        log.message.toLowerCase().includes(searchLower) ||
        log.source.toLowerCase().includes(searchLower) ||
        (log.details && log.details.toLowerCase().includes(searchLower))
      );
    }

    // Get unique sources for filter
    const sources = Array.from(new Set(logs.map(log => log.source)));

    // Get stats
    const stats = {
      total: logs.length,
      info: logs.filter(l => l.level === 'info').length,
      success: logs.filter(l => l.level === 'success').length,
      warning: logs.filter(l => l.level === 'warning').length,
      error: logs.filter(l => l.level === 'error').length,
    };

    return NextResponse.json({
      logs: filteredLogs.slice(0, limit),
      sources,
      stats,
      total: filteredLogs.length,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      error: 'Failed to fetch logs',
      details: errorMessage
    }, { status: 500 });
  }
}

// Helper function to generate audit log message
function getAuditMessage(log: any): string {
  const offerName = log.offer?.name || 'Unknown offer';
  
  switch (log.action) {
    case 'CREATE':
      return `Создан новый оффер "${offerName}"`;
    case 'UPDATE':
      return log.fieldName 
        ? `Обновлено поле "${log.fieldName}" в оффере "${offerName}"`
        : `Обновлён оффер "${offerName}"`;
    case 'DELETE':
      return `Удалён оффер "${offerName}"`;
    case 'SYNC':
      return `Синхронизация оффера "${offerName}"`;
    case 'BULK_UPDATE':
      return `Массовое обновление офферов`;
    default:
      return `Действие "${log.action}" для оффера "${offerName}"`;
  }
}

// Helper function to generate sync log message
function getSyncMessage(log: any): string {
  const source = log.source;
  
  switch (log.status) {
    case 'success':
      return `Синхронизация с ${source} завершена успешно. Обновлено ${log.offersUpdated}, добавлено ${log.offersAdded} офферов.`;
    case 'partial':
      return `Синхронизация с ${source} завершена с ошибками. Обновлено ${log.offersUpdated}, ошибок: ${log.errors}.`;
    case 'error':
      return `Ошибка синхронизации с ${source}: ${log.errorMessage || 'Unknown error'}`;
    default:
      return `Синхронизация с ${source}: ${log.status}`;
  }
}
