import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('id');

  if (!invoiceId) {
    return NextResponse.json({ status: 'INVALID' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ status: 'UNAUTHORIZED' }, { status: 401 });

    const { data: payment } = await supabase
      .from('payment_events')
      .select('status, tier')
      .eq('invoice_id', invoiceId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!payment) return NextResponse.json({ status: 'PENDING' }, { status: 404 });
    return NextResponse.json({ status: payment.status.toUpperCase(), tier: payment.tier });
  }

  return NextResponse.json({ status: 'UNAVAILABLE', error: 'Payment activation is not connected to Paymento yet.' }, { status: 503 });
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Payment confirmation is only accepted from the verified payment webhook.' }, { status: 405 });
}
