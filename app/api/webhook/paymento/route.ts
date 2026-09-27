import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';
import { BILLING_PLANS } from '../../../../types';

const SUBSCRIPTION_PERIOD_MS = 30 * 24 * 60 * 60 * 1000;

type PaymentoVerifyResponse = {
    success?: boolean;
    message?: string;
    body?: {
        token?: string;
        orderId?: string;
        orderStatus?: string | number;
        additionalData?: Array<{ key?: string; value?: string }>;
        settlement?: { expectedCryptoAmount?: number; transactions?: Array<{ txHash?: string }> };
    };
};

const getValue = (body: Record<string, unknown>, names: string[]) => {
    for (const name of names) {
        const value = body[name];
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return undefined;
};

const verifyPaymentoToken = async (token: string) => {
    const apiKey = process.env.PAYMENTO_SECRET_KEY;
    if (!apiKey) throw new Error('PAYMENTO_SECRET_KEY is not configured.');

    const response = await fetch('https://api.paymento.io/v1/payment/verify', {
        method: 'POST',
        headers: {
            'Api-key': apiKey,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({ token }),
        cache: 'no-store',
    });

    if (!response.ok) throw new Error(`Paymento verification failed with HTTP ${response.status}.`);
    return await response.json() as PaymentoVerifyResponse;
};

const additionalValue = (data: PaymentoVerifyResponse['body'], keys: string[]) =>
    data?.additionalData?.find((item) => keys.includes((item.key || '').toLowerCase()))?.value;

export async function GET() {
    return NextResponse.json({ ok: true, endpoint: 'paymento-webhook' });
}

export async function OPTIONS() {
    return new NextResponse(null, { status: 204 });
}

export async function POST(request: Request) {
    const admin = createSupabaseAdminClient();
    if (!admin) return NextResponse.json({ error: 'Supabase server configuration is incomplete.' }, { status: 503 });

    const contentType = request.headers.get('content-type') || '';
    let input: Record<string, unknown> = {};
    if (contentType.includes('application/json')) {
        input = await request.json().catch(() => ({}));
    } else {
        const form = await request.formData();
        form.forEach((value, key) => { input[key] = String(value); });
    }

    const token = getValue(input, ['token', 'paymentToken', 'payment_token', 'orderToken', 'order_token']);
    if (!token) {
        // Paymento's dashboard test may send a connectivity probe without a real payment token.
        return NextResponse.json({ received: true, verified: false, message: 'Webhook endpoint reachable; no payment token supplied.' });
    }

    let verified: PaymentoVerifyResponse;
    try {
        verified = await verifyPaymentoToken(token);
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Payment verification failed.' }, { status: 502 });
    }

    const payment = verified.body;
    const status = String(payment?.orderStatus ?? '').toLowerCase();
    // `success` only means the verify call worked; the order itself must be approved.
    const approved = verified.success === true && (status === '8' || status === 'approve' || status === 'approved');
    if (!approved) {
        return NextResponse.json({ received: true, verified: false, orderStatus: payment?.orderStatus ?? null });
    }

    const invoiceId = payment?.orderId || token;
    const [byInvoice, byToken] = await Promise.all([
        admin.from('payment_events').select('id').eq('invoice_id', invoiceId).maybeSingle(),
        admin.from('payment_events').select('id').eq('payment_token', token).maybeSingle(),
    ]);
    const existing = byInvoice.data || byToken.data;
    if (existing) return NextResponse.json({ received: true, verified: true, alreadyProcessed: true });

    // The plan and amount must come from Paymento's verified response, never from the unauthenticated request body.
    const paidAmount = Number(payment?.settlement?.expectedCryptoAmount ?? NaN);
    if (!Number.isFinite(paidAmount)) {
        return NextResponse.json({ error: 'Verified payment is missing the paid amount.' }, { status: 422 });
    }
    const covers = (plan: 'PRO' | 'SCALE') => paidAmount + 0.01 >= BILLING_PLANS[plan].priceUsdt;
    const namedTier = additionalValue(payment, ['plan', 'tier', 'variantflow_plan'])?.toUpperCase();
    const tier = namedTier === 'PRO' || namedTier === 'SCALE'
        ? namedTier
        : covers('SCALE') ? 'SCALE' : covers('PRO') ? 'PRO' : null;
    if (!tier || !covers(tier)) {
        return NextResponse.json({ error: 'Verified payment amount does not cover a VariantFlow plan.' }, { status: 422 });
    }

    // Each token is applied once (checked above), so the email only chooses which account receives a paid plan.
    const email = (additionalValue(payment, ['email', 'customeremail', 'customer_email'])
        || getValue(input, ['email', 'customerEmail', 'customer_email']))?.toLowerCase();
    if (!email) {
        return NextResponse.json({ error: 'Approved payment is missing the customer email.' }, { status: 422 });
    }

    const { data: profile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'No VariantFlow account matches the payment email.' }, { status: 404 });

    const { data: current } = await admin.from('subscriptions').select('current_period_end').eq('user_id', profile.id).maybeSingle();
    const now = Date.now();
    const currentEnd = current?.current_period_end ? new Date(current.current_period_end).getTime() : 0;
    const periodEnd = new Date(Math.max(now, currentEnd) + SUBSCRIPTION_PERIOD_MS).toISOString();

    const transactionHash = payment?.settlement?.transactions?.find((transaction) => transaction.txHash)?.txHash || null;
    const paymentEvent = {
        user_id: profile.id,
        invoice_id: invoiceId,
        tier,
        amount_usdt: paidAmount,
        transaction_hash: transactionHash,
        status: 'confirmed',
        payload: verified,
        confirmed_at: new Date(now).toISOString(),
    };
    let { error: eventError } = await admin.from('payment_events').insert({ ...paymentEvent, payment_token: token });
    // Until migration 002 adds payment_token, record the payment without it (invoice_id stays unique).
    if (eventError && /payment_token/.test(eventError.message)) {
        ({ error: eventError } = await admin.from('payment_events').insert(paymentEvent));
    }
    // Unique constraints on invoice_id and payment_token make a concurrent duplicate fail here.
    if (eventError) return NextResponse.json({ error: 'Payment could not be recorded.' }, { status: 409 });

    await admin.from('subscriptions').upsert({
        user_id: profile.id,
        tier,
        status: 'active',
        current_period_end: periodEnd,
        updated_at: new Date(now).toISOString(),
    }, { onConflict: 'user_id' });

    return NextResponse.json({ received: true, verified: true, tier });
}
