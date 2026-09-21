import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';

const invoices = new Map<string, {
  tier: string;
  amountUsdt: number;
  status: 'PENDING' | 'CONFIRMED';
  depositAddress: string;
  createdAt: number;
  userId?: string;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const tier = body?.tier ?? 'PRO';
    const amountUsdt = Number(body?.amount ?? 19);
    const supabase = await createSupabaseServerClient();
    let userId: string | undefined;

    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return NextResponse.json({ error: 'Sign in before creating a payment invoice.' }, { status: 401 });
      userId = user.id;
    }

    const invoiceId = `inv_${tier.toLowerCase()}_${Date.now()}`;
    const depositAddress = 'TQwzVg8aS7uJmGfD9K2yTw7kJmRUhZsYVn';

    invoices.set(invoiceId, {
      tier,
      amountUsdt,
      status: 'PENDING',
      depositAddress,
      createdAt: Date.now(),
      userId,
    });

    if (supabase && userId) {
      const { error } = await supabase.from('payment_events').insert({
        user_id: userId,
        invoice_id: invoiceId,
        tier,
        amount_usdt: amountUsdt,
        status: 'pending',
        payload: { depositAddress },
      });
      if (error) return NextResponse.json({ error: 'Unable to persist payment invoice.' }, { status: 500 });
    }

    return NextResponse.json({
      invoiceId,
      status: 'PENDING',
      depositAddress,
      amountUsdt,
      tier,
      planName: tier === 'SCALE' ? 'Scale Pipeline Operator' : 'Professional Merchant',
    });
  } catch {
    return NextResponse.json({ error: 'Unable to create billing invoice.' }, { status: 400 });
  }
}

export { invoices };
