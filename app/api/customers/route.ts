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
    
    // Extra debug info if LNbits returns text instead of JSON
    const message = error instanceof Error ? error.message : JSON.stringify(error, null, 2);
    
    // Provide more specific error messages
    let statusCode = 500;
    let errorMessage = 'Failed to create customer';
    
    if (message.includes('Invalid public_key format')) {
      statusCode = 400;
      errorMessage = 'Invalid public key format. Expected 64-character hexadecimal string.';
    } else if (message.includes('Missing required fields')) {
      statusCode = 400;
      errorMessage = message;
    } else if (message.includes('401') || message.includes('authentication')) {
      statusCode = 401;
      errorMessage = 'LNbits API authentication failed. Check your LNBITS_API_KEY.';
    } else if (message.includes('404') || message.includes('not found')) {
      statusCode = 404;
      errorMessage = 'LNbits API endpoint not found. Verify NostrMarket extension is installed.';
    } else if (message.includes('403') || message.includes('forbidden')) {
      statusCode = 403;
      errorMessage = 'LNbits API access forbidden. Check your API key permissions.';
    }
    
    return NextResponse.json(
      {
        ok: false,
        error: errorMessage,
        message,
        hint: statusCode === 500 
          ? 'Verify LNBITS_URL points to an instance with NostrMarket enabled (e.g. https://demo.lnbits.com)' 
          : undefined,
      },
      { status: statusCode }
    );
  }
};

