import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({
    error: 'Payment activation is temporarily unavailable while the Paymento transaction API is being connected.',
    code: 'PAYMENTO_API_NOT_CONNECTED',
  }, { status: 503 });
}
