// TurboZaps Products API
// CRUD operations using LNbits NostrMarket API

import { NextRequest, NextResponse } from 'next/server';
import { createProduct as createLNbitsProduct, getProductsByStall, getStalls } from '@/lib/lnbits';
import type { CreateProductRequest } from '@/types';

// GET /api/products - List products from LNbits
// If stall_id is provided, returns products for that stall
// Otherwise, returns products from all stalls
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stallId = searchParams.get('stall_id');
    const pending = searchParams.get('pending') === 'true' ? true : undefined;

    // If stall_id is provided, get products for that specific stall
    if (stallId) {
      console.log(`[GET /api/products] Fetching products for stall: ${stallId}`);
      const products = await getProductsByStall(stallId, pending);
      
      // Handle different response formats
      let productsArray: unknown[] = [];
      if (Array.isArray(products)) {
        productsArray = products;
      } else if (products && typeof products === 'object') {
        if ('products' in products && Array.isArray((products as { products: unknown[] }).products)) {
          productsArray = (products as { products: unknown[] }).products;
        } else {
          productsArray = [products];
        }
      }

      return NextResponse.json({
        ok: true,
        products: productsArray,
        stall_id: stallId,
        count: productsArray.length,
      });
    }

    // Otherwise, get products from all stalls
    console.log('[GET /api/products] Fetching products from all stalls');
    const stalls = await getStalls();
    
    // Handle different response formats
    const stallsArray = Array.isArray(stalls) ? stalls : (stalls ? [stalls] : []);
    
    // Get products from all stalls
    const allProducts: unknown[] = [];
    for (const stall of stallsArray) {
      const stallObj = stall as { id?: string };
      if (stallObj.id) {
        try {
          const products = await getProductsByStall(stallObj.id, pending);
          const productsArray = Array.isArray(products) 
            ? products 
            : (products && typeof products === 'object' && 'products' in products && Array.isArray((products as { products: unknown[] }).products))
              ? (products as { products: unknown[] }).products
              : (products ? [products] : []);
          allProducts.push(...productsArray);
        } catch (error) {
          console.error(`[GET /api/products] Error fetching products for stall ${stallObj.id}:`, error);
          // Continue with other stalls
        }
      }
    }

    return NextResponse.json({
      ok: true,
      products: allProducts,
      count: allProducts.length,
    });
  } catch (error) {
    console.error('[GET /api/products] Error fetching products:', error);
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

// POST /api/products - Create a new product in LNbits NostrMarket
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateProductRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.price_sats) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields: name and price_sats are required',
        },
        { status: 400 }
      );
    }

    // Validate stall_id is provided (required for LNbits)
    if (!body.stall_id) {
      return NextResponse.json(
        {
          ok: false,
          error: 'stall_id is required to create a product in NostrMarket',
        },
        { status: 400 }
      );
    }

    console.log('[POST /api/products] Creating product in LNbits NostrMarket:', {
      stall_id: body.stall_id,
      name: body.name,
      price: body.price_sats,
      quantity: body.quantity || 1,
    });
    
    // Create product in LNbits NostrMarket
    const lnbitsProduct = await createLNbitsProduct({
      stall_id: body.stall_id,
      name: body.name,
      price: body.price_sats,
      quantity: body.quantity || 1,
      categories: body.category ? [body.category] : [],
      images: body.image ? [body.image] : [],
      config: {
        description: body.description || '',
        currency: 'sat',
      },
    });
    
    console.log('[POST /api/products] Product created successfully in LNbits:', lnbitsProduct);

    return NextResponse.json({
      ok: true,
      product: lnbitsProduct,
      message: 'Product created successfully in NostrMarket',
    });
  } catch (error) {
    console.error('[POST /api/products] Error creating product:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create product in NostrMarket',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

