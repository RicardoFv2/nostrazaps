// TurboZaps Products by Stall API
// Get products from NostrMarket by stall ID

import { NextRequest, NextResponse } from 'next/server';
import { getProductsByStall } from '@/lib/lnbits';

// GET /api/products/stall/[stallId] - Get products by stall ID from NostrMarket
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ stallId: string }> | { stallId: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const stallId = resolvedParams.stallId;
    const searchParams = request.nextUrl.searchParams;
    const pending = searchParams.get('pending') === 'true' ? true : undefined;

    if (!stallId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Stall ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[GET /api/products/stall/${stallId}] Fetching products from NostrMarket`);

    // Get products from NostrMarket
    const products = await getProductsByStall(stallId, pending);

    return NextResponse.json({
      ok: true,
      products: Array.isArray(products) ? products : [products],
      stall_id: stallId,
    });
  } catch (error) {
    console.error('[GET /api/products/stall/[stallId]] Error fetching products:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

