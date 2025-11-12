// TurboZaps Customers API
// Sprint 2 - Customer management endpoints

import { NextRequest, NextResponse } from 'next/server';
import { createCustomer, getCustomers } from '@/lib/lnbits';
import type { CreateCustomerRequest } from '@/types';

// GET /api/customers - Get customers
export const GET = async (request: NextRequest) => {
  try {
    const customers = await getCustomers();
    
    return NextResponse.json({
      ok: true,
      customers: Array.isArray(customers) ? customers : [customers],
    });
  } catch (error) {
    console.error('[GET /api/customers] Error fetching customers:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch customers',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// POST /api/customers - Create a new customer
export const POST = async (request: NextRequest) => {
  try {
    const body: CreateCustomerRequest = await request.json();

    console.log('[POST /api/customers] Creating customer');

    // Validate required fields
    if (!body.merchant_id || !body.public_key) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Missing required fields: merchant_id and public_key are required',
        },
        { status: 400 }
      );
    }

    // Create customer in LNbits
    const customer = await createCustomer({
      merchant_id: body.merchant_id,
      public_key: body.public_key,
      profile: body.profile,
    });

    console.log('[POST /api/customers] Customer created successfully');

    return NextResponse.json({
      ok: true,
      customer,
      message: 'Customer created successfully',
    });
  } catch (error) {
    console.error('[POST /api/customers] Error creating customer:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create customer',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};

