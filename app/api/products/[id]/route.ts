// TurboZaps Products API - Individual Product Operations
// CRUD operations for products using LNbits NostrMarket API

import { NextRequest, NextResponse } from 'next/server';
import { getProduct, updateProduct, deleteProduct } from '@/lib/lnbits';
import type { CreateProductRequest } from '@/types';

// GET /api/products/[id] - Get a single product by ID from LNbits
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[GET /api/products/${productId}] Fetching product from LNbits`);

    // Get product from LNbits NostrMarket
    const product = await getProduct(productId);

    return NextResponse.json({
      ok: true,
      product,
    });
  } catch (error) {
    console.error(`[GET /api/products/[id]] Error fetching product:`, error);
    
    // Check if it's a 404 error
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Product not found',
          message: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// PATCH /api/products/[id] - Update a product in LNbits
export const PATCH = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;
    const body: Partial<CreateProductRequest> = await request.json();

    if (!productId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[PATCH /api/products/${productId}] Updating product in LNbits`);

    // First, get the current product to obtain its stall_id (required by LNbits API)
    let currentProduct: any = null;
    try {
      currentProduct = await getProduct(productId);
    } catch (error) {
      console.error(`[PATCH /api/products/${productId}] Error fetching current product:`, error);
      return NextResponse.json(
        {
          ok: false,
          error: 'Failed to fetch current product',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      );
    }

    // Extract stall_id from current product or use the one from body
    const stallId = body.stall_id || (currentProduct as { stall_id?: string })?.stall_id;
    
    if (!stallId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'stall_id is required. Product must belong to a stall.',
        },
        { status: 400 }
      );
    }

    // Prepare update data for LNbits (must include stall_id)
    const updateData: {
      stall_id: string;
      name?: string;
      price?: number;
      quantity?: number;
      categories?: string[];
      images?: string[];
      config?: {
        description?: string;
        currency?: string;
      };
    } = {
      stall_id: stallId, // Required field
    };

    if (body.name) updateData.name = body.name;
    if (body.price_sats !== undefined) updateData.price = body.price_sats;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.category) updateData.categories = [body.category];
    if (body.image) updateData.images = [body.image];
    if (body.description !== undefined) {
      updateData.config = {
        description: body.description,
        currency: 'sat',
      };
    }

    // Update product in LNbits NostrMarket
    const updatedProduct = await updateProduct(productId, updateData);

    console.log(`[PATCH /api/products/${productId}] Product updated successfully`);

    return NextResponse.json({
      ok: true,
      product: updatedProduct,
      message: 'Product updated successfully',
    });
  } catch (error) {
    console.error(`[PATCH /api/products/[id]] Error updating product:`, error);
    
    // Check if it's a 404 error
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Product not found',
          message: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// DELETE /api/products/[id] - Delete a product from LNbits
export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) => {
  try {
    const resolvedParams = await Promise.resolve(params);
    const productId = resolvedParams.id;

    if (!productId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Product ID is required',
        },
        { status: 400 }
      );
    }

    console.log(`[DELETE /api/products/${productId}] Deleting product from LNbits`);

    // Delete product from LNbits NostrMarket
    await deleteProduct(productId);

    console.log(`[DELETE /api/products/${productId}] Product deleted successfully`);

    return NextResponse.json({
      ok: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    console.error(`[DELETE /api/products/[id]] Error deleting product:`, error);
    
    // Check if it's a 404 error
    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Product not found',
          message: error.message,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

