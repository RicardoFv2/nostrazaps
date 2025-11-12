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
    
    console.log(`[GET /api/products/stall/${stallId}] Products received:`, {
      type: typeof products,
      isArray: Array.isArray(products),
      count: Array.isArray(products) ? products.length : (products ? 1 : 0),
    });

    // Handle different response formats from NostrMarket
    let productsArray: unknown[] = [];
    if (Array.isArray(products)) {
      productsArray = products;
    } else if (products && typeof products === 'object') {
      // Check if it's an object with a products array
      if ('products' in products && Array.isArray((products as { products: unknown[] }).products)) {
        productsArray = (products as { products: unknown[] }).products;
      } else {
        // Single product object
        productsArray = [products];
      }
    }

    return NextResponse.json({
      ok: true,
      products: productsArray,
      stall_id: stallId,
      count: productsArray.length,
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

