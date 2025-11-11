// TurboZaps Products API
// Sprint 1 - Product management endpoints

import { NextRequest, NextResponse } from 'next/server';
import { dbHelpers } from '@/lib/db';
import { createProduct as createLNbitsProduct } from '@/lib/lnbits';
import type { CreateProductRequest, Product } from '@/types';
import { randomUUID } from 'crypto';

// GET /api/products - List all products
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const products = dbHelpers.getAllProducts(limit, offset);

    return NextResponse.json({
      ok: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
};

// POST /api/products - Create a new product
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

    // Generate product ID
    const productId = randomUUID();

    // Create product in database
    const product: Product = {
      id: productId,
      name: body.name,
      description: body.description || null,
      price_sats: body.price_sats,
      category: body.category || null,
      image: body.image || null,
      stall_id: body.stall_id || null,
      created_at: new Date().toISOString(),
    };

    dbHelpers.createProduct(product);

    // Optionally create product in LNbits (if stall_id is provided)
    if (body.stall_id) {
      try {
        await createLNbitsProduct({
          stall_id: body.stall_id,
          name: body.name,
          price: body.price_sats,
          categories: body.category ? [body.category] : [],
          images: body.image ? [body.image] : [],
          config: {
            description: body.description,
            currency: 'sat',
          },
        });
        console.log('Product created in LNbits:', productId);
      } catch (lnbitsError) {
        console.error('Error creating product in LNbits (non-fatal):', lnbitsError);
        // Continue even if LNbits creation fails
      }
    }

    return NextResponse.json({
      ok: true,
      product,
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create product',
      },
      { status: 500 }
    );
  }
};

