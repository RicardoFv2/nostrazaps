// TurboZaps Payment Check API
// Check payment status directly in LNbits

import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/lnbits';

// GET /api/payments/check?payment_hash=xxx
export const GET = async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentHash = searchParams.get('payment_hash');

    if (!paymentHash) {
      return NextResponse.json(
        {
          ok: false,
          error: 'payment_hash parameter is required',
        },
        { status: 400 }
      );
    }

    console.log(`[GET /api/payments/check] Checking payment status for hash: ${paymentHash.substring(0, 16)}...`);

    const result = await checkPaymentStatus(paymentHash);

    return NextResponse.json({
      ok: true,
      paid: result.paid,
      details: result.details,
    });
  } catch (error) {
    console.error('[GET /api/payments/check] Error checking payment:', error);
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to check payment status',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};


