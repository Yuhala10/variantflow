import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { getSessionUser } from '../../../../lib/supabase/session';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get('id');

  if (!invoiceId) {
    return NextResponse.json({ status: 'INVALID' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const user = await getSessionUser(supabase);
    if (!user) return NextResponse.json({ status: 'UNAUTHORIZED' }, { status: 401 });

    const db = createSupabaseAdminClient() ?? supabase;
    const { data: payment } = await db
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

export async function POST() {
  return NextResponse.json({ error: 'Payment confirmation is only accepted from the verified payment webhook.' }, { status: 405 });
}
