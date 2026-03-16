import { db } from "@/lib/db"
import { headers } from "next/headers"

export type AuditAction = 
  | "CREATE" 
  | "UPDATE" 
  | "DELETE" 
  | "SYNC" 
  | "BULK_UPDATE" 
  | "BULK_ACTIVATE" 
  | "BULK_DEACTIVATE" 
  | "BULK_TAG_ADD" 
  | "BULK_TAG_REMOVE"
  | "PUBLISH"
  | "UNPUBLISH"
  | "MARK_REVIEW"
  | "RESOLVE_REVIEW"

export interface AuditLogInput {
  offerId: string
  action: AuditAction
  fieldName?: string
  oldValue?: string | null
  newValue?: string | null
  source?: string
  metadata?: Record<string, unknown>
  userId?: string
  userEmail?: string
}

/**
 * Create an audit log entry for offer changes
 */
export async function createAuditLog(input: AuditLogInput) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") || 
                      headersList.get("x-real-ip") || 
                      "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const auditLog = await db.auditLog.create({
      data: {
        offerId: input.offerId,
        userId: input.userId || null,
        userEmail: input.userEmail || "system@cashpeek.ru",
        action: input.action,
        fieldName: input.fieldName || null,
        oldValue: input.oldValue || null,
        newValue: input.newValue || null,
        source: input.source || "admin",
        ipAddress,
        userAgent,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    })

    return auditLog
  } catch (error) {
    console.error("Failed to create audit log:", error)
    // Don't throw - audit logging should not break the main operation
    return null
  }
}

/**
 * Get audit logs for an offer
 */
export async function getOfferAuditLogs(offerId: string, limit = 50) {
  return db.auditLog.findMany({
    where: { offerId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  })
}

/**
 * Get all audit logs with pagination
 */
export async function getAllAuditLogs(
  page = 1,
  limit = 50,
  filters?: {
    action?: string
    offerId?: string
    userId?: string
  }
) {
  const skip = (page - 1) * limit

  const where = {
    ...(filters?.action && { action: filters.action }),
    ...(filters?.offerId && { offerId: filters.offerId }),
    ...(filters?.userId && { userId: filters.userId }),
  }

  const [logs, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
        offer: {
          select: { id: true, name: true },
        },
      },
    }),
    db.auditLog.count({ where }),
  ])

  return {
    logs,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Format audit log for display
 */
export function formatAuditLogEntry(log: {
  action: string
  fieldName: string | null
  oldValue: string | null
  newValue: string | null
  userEmail: string | null
  createdAt: Date
}) {
  const actionLabels: Record<string, string> = {
    CREATE: "Создан",
    UPDATE: "Обновлён",
    DELETE: "Удалён",
    SYNC: "Синхронизация",
    BULK_UPDATE: "Массовое обновление",
    BULK_ACTIVATE: "Массовая активация",
    BULK_DEACTIVATE: "Массовая деактивация",
    BULK_TAG_ADD: "Добавление тега",
    BULK_TAG_REMOVE: "Удаление тега",
    PUBLISH: "Опубликован",
    UNPUBLISH: "Снят с публикации",
    MARK_REVIEW: "Требует проверки",
    RESOLVE_REVIEW: "Проверка завершена",
  }

  const fieldLabels: Record<string, string> = {
    name: "Название",
    slug: "URL Slug",
    rating: "Рейтинг",
    status: "Статус",
    isFeatured: "Рекомендуемый",
    isNew: "Новый",
    isPopular: "Популярный",
    baseRate: "Ставка",
    minAmount: "Мин. сумма",
    maxAmount: "Макс. сумма",
    minTerm: "Мин. срок",
    maxTerm: "Макс. срок",
    metaTitle: "Meta Title",
    metaDescription: "Meta Description",
    customDescription: "Описание",
    affiliateUrl: "Партнёрская ссылка",
  }

  return {
    action: actionLabels[log.action] || log.action,
    field: log.fieldName ? (fieldLabels[log.fieldName] || log.fieldName) : null,
    oldValue: log.oldValue,
    newValue: log.newValue,
    user: log.userEmail || "Система",
    timestamp: log.createdAt,
  }
}
