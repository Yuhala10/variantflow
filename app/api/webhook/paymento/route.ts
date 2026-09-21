import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';

const isValidSignature = (payload: string, signature: string, secret: string) => {
    const expected = createHmac('sha256', secret).update(payload).digest('hex');
    const provided = Buffer.from(signature, 'utf8');
    const calculated = Buffer.from(expected, 'utf8');
    return provided.length === calculated.length && timingSafeEqual(provided, calculated);
};

export async function POST(request: Request) {
    const secret = process.env.PAYMENTO_WEBHOOK_SECRET;
    const admin = createSupabaseAdminClient();
    if (!secret || !admin) return NextResponse.json({ error: 'Payment webhook is not configured.' }, { status: 503 });

    const rawBody = await request.text();
    const signature = request.headers.get('x-paymento-signature') || '';
    if (!isValidSignature(rawBody, signature, secret)) {
        return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as {
        invoiceId?: string;
        status?: string;
        transactionHash?: string;
    };
    const invoiceId = body.invoiceId;
    const normalizedStatus = body.status?.toLowerCase();
    if (!invoiceId || !['confirmed', 'failed', 'expired'].includes(normalizedStatus || '')) {
        return NextResponse.json({ error: 'Invalid payment event.' }, { status: 400 });
    }

    const { data: payment, error: paymentError } = await admin
        .from('payment_events')
        .select('user_id, tier')
        .eq('invoice_id', invoiceId)
        .maybeSingle();
    if (paymentError || !payment) return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 });

    const { error: updateError } = await admin
        .from('payment_events')
        .update({
            status: normalizedStatus,
            transaction_hash: body.transactionHash || null,
            confirmed_at: normalizedStatus === 'confirmed' ? new Date().toISOString() : null,
        })
        .eq('invoice_id', invoiceId);
    if (updateError) return NextResponse.json({ error: 'Unable to update payment event.' }, { status: 500 });

    if (normalizedStatus === 'confirmed') {
        await admin
            .from('subscriptions')
            .update({ tier: payment.tier, status: 'active', updated_at: new Date().toISOString() })
            .eq('user_id', payment.user_id);
    }

    return NextResponse.json({ received: true });
}
