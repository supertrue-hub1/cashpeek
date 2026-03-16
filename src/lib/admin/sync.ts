import { db } from "@/lib/db"
import { createAuditLog } from "./audit"

export interface SyncResult {
  offerId: string
  status: "created" | "updated" | "unchanged" | "error"
  changes?: FieldChange[]
  anomalies?: AnomalyDetection[]
}

export interface FieldChange {
  field: string
  oldValue: number | string | boolean
  newValue: number | string | boolean
  changePercent?: number
}

export interface AnomalyDetection {
  field: string
  oldValue: number
  newValue: number
  changePercent: number
  severity: "warning" | "critical" // >20% = warning, >50% = critical
}

export interface OfferSyncData {
  externalId: string
  name: string
  minAmount: number
  maxAmount: number
  minTerm: number
  maxTerm: number
  baseRate: number
  firstLoanRate?: number
  decisionTime: number
  approvalRate: number
  features?: string[]
  payoutMethods?: string[]
  badCreditOk?: boolean
  noCalls?: boolean
  roundTheClock?: boolean
  minAge?: number
  documents?: string[]
}

/**
 * Threshold for anomaly detection (percentage)
 */
const ANOMALY_THRESHOLD_WARNING = 20 // 20% change
const ANOMALY_THRESHOLD_CRITICAL = 50 // 50% change

/**
 * Detect anomalies in numeric field changes
 */
export function detectAnomalies(
  oldData: Record<string, number>,
  newData: Record<string, number>
): AnomalyDetection[] {
  const anomalies: AnomalyDetection[] = []

  for (const [field, newValue] of Object.entries(newData)) {
    const oldValue = oldData[field]
    
    if (oldValue === undefined || oldValue === 0 || newValue === 0) {
      continue
    }

    const changePercent = Math.abs(((newValue - oldValue) / oldValue) * 100)

    if (changePercent >= ANOMALY_THRESHOLD_WARNING) {
      anomalies.push({
        field,
        oldValue,
        newValue,
        changePercent,
        severity: changePercent >= ANOMALY_THRESHOLD_CRITICAL ? "critical" : "warning",
      })
    }
  }

  return anomalies
}

/**
 * Sync a single offer from external API data
 */
export async function syncOfferFromApi(
  data: OfferSyncData,
  source: string = "Leads.su"
): Promise<SyncResult> {
  try {
    // Find existing offer by externalId
    const existingOffer = await db.loanOffer.findFirst({
      where: { externalId: data.externalId },
    })

    if (existingOffer) {
      // Check for anomalies
      const oldNumericValues = {
        minAmount: existingOffer.minAmount,
        maxAmount: existingOffer.maxAmount,
        minTerm: existingOffer.minTerm,
        maxTerm: existingOffer.maxTerm,
        baseRate: existingOffer.baseRate,
        firstLoanRate: existingOffer.firstLoanRate || 0,
        decisionTime: existingOffer.decisionTime,
        approvalRate: existingOffer.approvalRate,
      }

      const newNumericValues = {
        minAmount: data.minAmount,
        maxAmount: data.maxAmount,
        minTerm: data.minTerm,
        maxTerm: data.maxTerm,
        baseRate: data.baseRate,
        firstLoanRate: data.firstLoanRate || 0,
        decisionTime: data.decisionTime,
        approvalRate: data.approvalRate,
      }

      const anomalies = detectAnomalies(oldNumericValues, newNumericValues)
      const hasAnomalies = anomalies.length > 0

      // Detect field changes
      const changes: FieldChange[] = []
      if (existingOffer.minAmount !== data.minAmount) {
        changes.push({ field: "minAmount", oldValue: existingOffer.minAmount, newValue: data.minAmount })
      }
      if (existingOffer.maxAmount !== data.maxAmount) {
        changes.push({ field: "maxAmount", oldValue: existingOffer.maxAmount, newValue: data.maxAmount })
      }
      if (existingOffer.baseRate !== data.baseRate) {
        changes.push({ field: "baseRate", oldValue: existingOffer.baseRate, newValue: data.baseRate })
      }

      // Update the offer
      const updatedOffer = await db.loanOffer.update({
        where: { id: existingOffer.id },
        data: {
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          minTerm: data.minTerm,
          maxTerm: data.maxTerm,
          baseRate: data.baseRate,
          firstLoanRate: data.firstLoanRate,
          decisionTime: data.decisionTime,
          approvalRate: data.approvalRate,
          features: data.features ? JSON.stringify(data.features) : existingOffer.features,
          payoutMethods: data.payoutMethods ? JSON.stringify(data.payoutMethods) : existingOffer.payoutMethods,
          badCreditOk: data.badCreditOk ?? existingOffer.badCreditOk,
          noCalls: data.noCalls ?? existingOffer.noCalls,
          roundTheClock: data.roundTheClock ?? existingOffer.roundTheClock,
          minAge: data.minAge ?? existingOffer.minAge,
          documents: data.documents ? JSON.stringify(data.documents) : existingOffer.documents,
          syncSource: source,
          lastSyncAt: new Date(),
          syncStatus: "synced",
          requiresReview: hasAnomalies,
          reviewReason: hasAnomalies 
            ? `Обнаружены аномалии: ${anomalies.map(a => `${a.field} (${a.changePercent.toFixed(1)}%)`).join(", ")}`
            : null,
        },
      })

      // Create audit log
      await createAuditLog({
        offerId: updatedOffer.id,
        action: "SYNC",
        source: "api_sync",
        metadata: {
          source,
          changes: changes.length > 0 ? changes : undefined,
          anomalies: anomalies.length > 0 ? anomalies : undefined,
        },
      })

      // Create sync log entry
      await db.syncLog.create({
        data: {
          source,
          status: hasAnomalies ? "partial" : "success",
          offersProcessed: 1,
          offersUpdated: changes.length > 0 ? 1 : 0,
          offersUnchanged: changes.length === 0 ? 1 : 0,
          errors: 0,
          completedAt: new Date(),
          offerId: updatedOffer.id,
        },
      })

      return {
        offerId: updatedOffer.id,
        status: changes.length > 0 ? "updated" : "unchanged",
        changes,
        anomalies: anomalies.length > 0 ? anomalies : undefined,
      }
    } else {
      // Create new offer
      const newOffer = await db.loanOffer.create({
        data: {
          externalId: data.externalId,
          name: data.name,
          slug: data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          minTerm: data.minTerm,
          maxTerm: data.maxTerm,
          baseRate: data.baseRate,
          firstLoanRate: data.firstLoanRate,
          decisionTime: data.decisionTime,
          approvalRate: data.approvalRate,
          features: data.features ? JSON.stringify(data.features) : null,
          payoutMethods: data.payoutMethods ? JSON.stringify(data.payoutMethods) : null,
          badCreditOk: data.badCreditOk ?? true,
          noCalls: data.noCalls ?? true,
          roundTheClock: data.roundTheClock ?? false,
          minAge: data.minAge ?? 18,
          documents: data.documents ? JSON.stringify(data.documents) : null,
          syncSource: source,
          lastSyncAt: new Date(),
          syncStatus: "synced",
          status: "draft", // New offers start as draft
        },
      })

      // Create audit log
      await createAuditLog({
        offerId: newOffer.id,
        action: "CREATE",
        source: "api_sync",
        metadata: { source },
      })

      return {
        offerId: newOffer.id,
        status: "created",
      }
    }
  } catch (error) {
    console.error("Sync error:", error)
    
    // Create error sync log
    await db.syncLog.create({
      data: {
        source,
        status: "error",
        offersProcessed: 1,
        errors: 1,
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    })

    return {
      offerId: data.externalId,
      status: "error",
    }
  }
}

/**
 * Get offers that require review
 */
export async function getOffersRequiringReview() {
  return db.loanOffer.findMany({
    where: {
      requiresReview: true,
    },
    orderBy: {
      lastSyncAt: "desc",
    },
  })
}

/**
 * Mark offer as reviewed (resolve anomaly)
 */
export async function resolveReview(offerId: string, userId?: string, userEmail?: string) {
  const offer = await db.loanOffer.update({
    where: { id: offerId },
    data: {
      requiresReview: false,
      reviewReason: null,
    },
  })

  await createAuditLog({
    offerId,
    action: "RESOLVE_REVIEW",
    userId,
    userEmail,
    source: "admin",
  })

  return offer
}
