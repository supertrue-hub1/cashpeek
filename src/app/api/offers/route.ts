import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/offers - Get all offers (with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const featured = searchParams.get('featured');
    const limit = searchParams.get('limit');

    const where: any = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }

    if (featured === 'true') {
      where.isFeatured = true;
    }

    const offers = await db.loanOffer.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { sortOrder: 'asc' },
        { rating: 'desc' },
      ],
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    // Transform to frontend format
    const transformedOffers = offers.map((offer) => ({
      id: offer.id,
      name: offer.name,
      slug: offer.slug,
      logo: offer.logo || undefined,
      rating: offer.rating,
      minAmount: offer.minAmount,
      maxAmount: offer.maxAmount,
      minTerm: offer.minTerm,
      maxTerm: offer.maxTerm,
      baseRate: offer.baseRate,
      firstLoanRate: offer.firstLoanRate ?? undefined,
      decisionTime: offer.decisionTime,
      approvalRate: offer.approvalRate,
      payoutMethods: offer.payoutMethods ? JSON.parse(offer.payoutMethods) : [],
      features: offer.features ? JSON.parse(offer.features) : [],
      badCreditOk: offer.badCreditOk,
      noCalls: offer.noCalls,
      roundTheClock: offer.roundTheClock,
      minAge: offer.minAge,
      documents: offer.documents ? JSON.parse(offer.documents) : ['passport'],
      editorNote: offer.customDescription || undefined,
      customDescription: offer.customDescription || undefined,
      affiliateUrl: offer.affiliateUrl || '#',
      isFeatured: offer.isFeatured,
      isNew: offer.isNew,
      isPopular: offer.isPopular,
      status: offer.status,
      showOnHomepage: offer.showOnHomepage,
      sortOrder: offer.sortOrder,
      syncStatus: offer.syncStatus,
      syncSource: offer.syncSource || undefined,
      lastSync: offer.lastSyncAt?.toISOString() || new Date().toISOString(),
      requiresReview: offer.requiresReview,
      reviewReason: offer.reviewReason || undefined,
      views: offer.viewsCount,
      clicks: offer.clicksCount,
      conversions: offer.conversionsCount,
      metaTitle: offer.metaTitle || undefined,
      metaDescription: offer.metaDescription || undefined,
      apiData: {
        minAmount: offer.minAmount,
        maxAmount: offer.maxAmount,
        minTerm: offer.minTerm,
        maxTerm: offer.maxTerm,
        baseRate: offer.baseRate,
        firstLoanRate: offer.firstLoanRate ?? 0,
        decisionTime: offer.decisionTime,
        approvalRate: offer.approvalRate,
        payoutMethods: offer.payoutMethods ? JSON.parse(offer.payoutMethods) : [],
        features: offer.features ? JSON.parse(offer.features) : [],
        badCreditOk: offer.badCreditOk,
        noCalls: offer.noCalls,
        roundTheClock: offer.roundTheClock,
        minAge: offer.minAge,
        documents: offer.documents ? JSON.parse(offer.documents) : ['passport'],
      },
    }));

    return NextResponse.json(transformedOffers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to fetch offers', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// POST /api/offers - Create new offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const offer = await db.loanOffer.create({
      data: {
        name: body.name,
        slug: body.slug,
        rating: body.rating || 4.5,
        minAmount: body.minAmount || 1000,
        maxAmount: body.maxAmount || 30000,
        minTerm: body.minTerm || 7,
        maxTerm: body.maxTerm || 30,
        baseRate: body.baseRate || 0.8,
        firstLoanRate: body.firstLoanRate,
        decisionTime: body.decisionTime || 5,
        approvalRate: body.approvalRate || 90,
        payoutMethods: JSON.stringify(body.payoutMethods || []),
        features: JSON.stringify(body.features || []),
        badCreditOk: body.badCreditOk ?? true,
        noCalls: body.noCalls ?? true,
        roundTheClock: body.roundTheClock ?? false,
        minAge: body.minAge || 18,
        documents: JSON.stringify(body.documents || ['passport']),
        affiliateUrl: body.affiliateUrl,
        isFeatured: body.isFeatured ?? false,
        isNew: body.isNew ?? false,
        isPopular: body.isPopular ?? false,
        status: body.status || 'draft',
        showOnHomepage: body.showOnHomepage ?? true,
        sortOrder: body.sortOrder || 10,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        customDescription: body.customDescription || body.editorNote,
        syncStatus: 'pending',
      },
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to create offer', 
      details: errorMessage 
    }, { status: 500 });
  }
}
