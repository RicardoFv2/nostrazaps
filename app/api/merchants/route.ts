// TurboZaps Merchants API
// Sprint 2 - Merchant management endpoints

import { NextRequest, NextResponse } from 'next/server'
import { createMerchant, getMerchant } from '@/lib/lnbits'
import type { CreateMerchantRequest } from '@/types'

// ✅ GET /api/merchants - Fetch merchant info
export const GET = async () => {
  try {
    console.log('[GET /api/merchants] Fetching merchant...')
    const merchant = await getMerchant()

    return NextResponse.json({
      ok: true,
      merchant,
    })
  } catch (error) {
    console.error('[GET /api/merchants] Error fetching merchant:', error)
    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to fetch merchant',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

// ✅ POST /api/merchants - Create new merchant
export const POST = async (request: NextRequest) => {
  try {
    console.log('[POST /api/merchants] Creating merchant...')

    const body: CreateMerchantRequest = await request.json()

    // Validate required fields
    if (!body.private_key || !body.public_key || !body.config?.name) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Missing required fields: private_key, public_key, and config.name are required',
        },
        { status: 400 },
      )
    }

    // Create merchant in LNbits NostrMarket
    const merchant = await createMerchant({
      private_key: body.private_key,
      public_key: body.public_key,
      config: {
        name: body.config.name,
        about: body.config.about,
        active: body.config.active ?? true,
      },
    })

    console.log('[POST /api/merchants] Merchant created successfully')

    return NextResponse.json({
      ok: true,
      merchant,
      message: 'Merchant created successfully',
    })
  } catch (error) {
    console.error('[POST /api/merchants] Error creating merchant:', error)

    // Extra debug info if LNbits returns text instead of JSON
    const message =
      error instanceof Error ? error.message : JSON.stringify(error, null, 2)

    return NextResponse.json(
      {
        ok: false,
        error: 'Failed to create merchant',
        message,
        hint: 'Verify LNBITS_URL points to an instance with NostrMarket enabled (e.g. https://demo.lnbits.com)',
      },
      { status: 500 },
    )
  }
}
