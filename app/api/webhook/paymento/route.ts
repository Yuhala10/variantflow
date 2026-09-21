import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';

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
    const approved = verified.success === true || status === '8' || status === 'approve' || status === 'approved';
    if (!approved) {
        return NextResponse.json({ received: true, verified: false, orderStatus: payment?.orderStatus ?? null });
    }

    const email = getValue(input, ['email', 'customerEmail', 'customer_email'])
        || additionalValue(payment, ['email', 'customeremail', 'customer_email']);
    const tier = (getValue(input, ['plan', 'tier']) || additionalValue(payment, ['plan', 'tier', 'variantflow_plan']))?.toUpperCase();
    if (!email || (tier !== 'PRO' && tier !== 'SCALE')) {
        return NextResponse.json({ error: 'Approved payment is missing the customer email or VariantFlow plan.' }, { status: 422 });
    }

    const { data: profile } = await admin.from('profiles').select('id').eq('email', email).maybeSingle();
    if (!profile) return NextResponse.json({ error: 'No VariantFlow account matches the payment email.' }, { status: 404 });

    const transactionHash = payment?.settlement?.transactions?.find((transaction) => transaction.txHash)?.txHash || null;
    await admin.from('subscriptions').update({ tier, status: 'active', updated_at: new Date().toISOString() }).eq('user_id', profile.id);
    await admin.from('payment_events').upsert({
        user_id: profile.id,
        invoice_id: payment?.orderId || token,
        tier,
        amount_usdt: payment?.settlement?.expectedCryptoAmount || 0,
        transaction_hash: transactionHash,
        status: 'confirmed',
        payload: verified,
        confirmed_at: new Date().toISOString(),
    }, { onConflict: 'invoice_id' });

    return NextResponse.json({ received: true, verified: true, tier });
}

