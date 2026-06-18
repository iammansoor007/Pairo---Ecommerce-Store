import { NextResponse }   from 'next/server';
import { shippingService } from '@/services/shipping/ShippingService';

const TENANT_ID = 'DEFAULT_STORE';

/**
 * POST /api/shipping/calculate
 * 
 * Public endpoint called by Cart estimator and Checkout page.
 * 
 * Request body:
 *   {
 *     address:  { country, state, city, zip },
 *     subtotal: number,
 *     items:    [{ quantity, weight? }]
 *   }
 * 
 * Response:
 *   {
 *     success: true,
 *     zone:    { _id, name, ... } | null,
 *     rates:   [{ methodId, methodName, provider, cost, currency, ... }],
 *     currency: string
 *   }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { address, subtotal, items } = body;

    if (!address || typeof subtotal !== 'number') {
      return NextResponse.json(
        { error: 'address and subtotal are required.' },
        { status: 400 }
      );
    }

    const tenantId = req.headers.get('x-tenant-id') || TENANT_ID;

    const result = await shippingService.getRatesForAddress(
      tenantId,
      address,
      subtotal,
      items ?? []
    );

    return NextResponse.json({ success: true, ...result });

  } catch (error) {
    console.error('[/api/shipping/calculate]', error);
    return NextResponse.json({ error: 'Failed to calculate shipping rates.' }, { status: 500 });
  }
}
