// TurboZaps Stalls API
// Sprint 2 - Stall management endpoints

import { NextRequest, NextResponse } from 'next/server';
import { createStall, getStalls, getStall } from '@/lib/lnbits';
import type { CreateStallRequest } from '@/types';

// GET /api/stalls - Get stalls
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const stallId = searchParams.get('id');
    const pending = searchParams.get('pending') === 'true' ? true : undefined;

    if (stallId) {
      // Get specific stall
      const stall = await getStall(stallId);
      return NextResponse.json({
        ok: true,
        stall,
      });
    } else {
      // Get all stalls
      const stalls = await getStalls(pending);
      return NextResponse.json({
        ok: true,
        stalls: Array.isArray(stalls) ? stalls : [stalls],
      });
    }
  } catch (error) {
    console.error('[GET /api/stalls] Error fetching stalls:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch stalls',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// POST /api/stalls - Create a new stall
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateStallRequest = await request.json();

    console.log('[POST /api/stalls] Creating stall:', {
      wallet: body.wallet,
      name: body.name,
    });

    // Validate required fields
    if (!body.wallet || !body.name) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields: wallet and name are required',
        },
        { status: 400 }
      );
    }

    // Create stall in LNbits
    const stall = await createStall({
      wallet: body.wallet,
      name: body.name,
      currency: body.currency || 'sat',
      shipping_zones: body.shipping_zones || [],
    });

    console.log('[POST /api/stalls] Stall created successfully');

    return NextResponse.json({
      ok: true,
      stall,
      message: 'Stall created successfully',
    });
  } catch (error) {
    console.error('[POST /api/stalls] Error creating stall:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create stall',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

