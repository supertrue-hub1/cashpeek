/**
 * Debug endpoint for GA4 configuration
 * GET /api/admin/ga4/debug
 */

import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const propertyId = process.env.GA4_PROPERTY_ID
  const credentialsJson = process.env.GA4_CREDENTIALS

  const result = {
    timestamp: new Date().toISOString(),
    config: {
      hasPropertyId: !!propertyId,
      propertyId: propertyId ? `${propertyId.substring(0, 3)}***` : null,
      hasCredentials: !!credentialsJson,
      credentialsLength: credentialsJson?.length || 0,
    },
    credentials: null as unknown,
    error: null as string | null,
  }

  if (!propertyId) {
    result.error = 'GA4_PROPERTY_ID не настроен'
    return NextResponse.json(result, { status: 400 })
  }

  if (!credentialsJson) {
    result.error = 'GA4_CREDENTIALS не настроен'
    return NextResponse.json(result, { status: 400 })
  }

  try {
    const credentials = JSON.parse(credentialsJson)
    result.credentials = {
      hasClientEmail: !!credentials.client_email,
      clientEmail: credentials.client_email || null,
      hasPrivateKey: !!credentials.private_key,
      privateKeyLength: credentials.private_key?.length || 0,
      projectId: credentials.project_id || null,
    }
  } catch (e) {
    result.error = 'GA4_CREDENTIALS содержит невалидный JSON'
    return NextResponse.json(result, { status: 400 })
  }

  // Попробуем создать клиент
  try {
    const { BetaAnalyticsDataClient } = await import('@google-analytics/data')
    
    const credentials = JSON.parse(credentialsJson)
    
    const client = new BetaAnalyticsDataClient({
      credentials: {
        client_email: credentials.client_email,
        private_key: credentials.private_key,
      },
    })

    // Простой запрос для проверки доступа
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'yesterday' }],
      metrics: [{ name: 'users' }],
      limit: 1,
    })

    return NextResponse.json({
      ...result,
      testQuery: {
        success: true,
        hasRows: !!(response.rows && response.rows.length > 0),
        rowCount: response.rows?.length || 0,
      },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json({
      ...result,
      testQuery: {
        success: false,
        error: errorMessage,
      },
    }, { status: 500 })
  }
}
