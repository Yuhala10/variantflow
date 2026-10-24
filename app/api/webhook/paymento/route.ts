import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';
import { activatePaidPlan, type ActivationResult } from '../../../../lib/payments/activate.server';
import { hasPaymentoSigningSecret, tierForPaymentLink, verifyPaymentoSignature, verifyPaymentoToken, type PaymentoVerifyResponse } from '../../../../lib/payments/paymento';
import { BILLING_PLANS } from '../../../../types';

// Events that mean money arrived for a payment link.
const PAID_EVENTS = new Set(['payment_link.paid', 'subscription.renewed']);
// Payloads are small; anything larger is not from Paymento.
const MAX_BODY_BYTES = 64 * 1024;

const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const text = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : undefined);

/** Maps an activation outcome to the response Paymento expects: 200 stops delivery, 500 makes it retry. */
function respond(result: ActivationResult) {
    switch (result.status) {
        case 'activated': return json({ received: true, activated: true, tier: result.tier });
        case 'already-processed': return json({ received: true, alreadyProcessed: true });
        case 'unmatched': return json({ received: true, activated: false, reason: 'No VariantFlow account matches the payer email; recorded for follow-up.' });
        case 'retry':
            console.error('Paymento webhook will be retried:', result.reason);
            return json({ error: 'Temporary failure; please retry.' }, 500);
    }
}

export async function GET() {
    return json({ ok: true, endpoint: 'paymento-webhook' });
}

export async function POST(request: Request) {
    const admin = createSupabaseAdminClient();
    if (!admin) return json({ error: 'Server configuration is incomplete.' }, 503);

    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'Payload too large.' }, 413);

    // Payment links (what the upgrade dialog uses) send signed JSON events.
    const signature = request.headers.get('x-paymento-signature') ?? request.headers.get('x-signature');
    if (signature) return handlePaymentLinkEvent(admin, raw, signature, request.headers);

    // The payment-request API sends a token, verified by asking Paymento directly.
    return handlePaymentApiCallback(admin, raw, request.headers.get('content-type') ?? '');
}

async function handlePaymentLinkEvent(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, raw: string, signature: string, headers: Headers) {
    if (!hasPaymentoSigningSecret()) return json({ error: 'Webhook secret is not configured.' }, 503);
    if (!verifyPaymentoSignature(raw, signature)) {
        console.warn('Rejected a Paymento webhook with an invalid signature.');
        return json({ error: 'Invalid signature.' }, 401);
    }

    let body: {
        event?: { id?: unknown; type?: unknown };
        paymentLink?: { id?: unknown; url?: unknown; title?: unknown; status?: unknown };
        customer?: { email?: unknown; metadata?: { order_id?: unknown; payment_id?: unknown } };
    };
    try {
        body = JSON.parse(raw);
    } catch {
        return json({ error: 'Invalid JSON.' }, 400);
    }

    const type = text(body.event?.type) ?? text(headers.get('x-paymento-event-type'));
    if (!type || !PAID_EVENTS.has(type)) return json({ received: true, ignored: type ?? 'unknown event' });
    if (type === 'payment_link.paid' && text(body.paymentLink?.status) && body.paymentLink?.status !== 'paid') {
        return json({ received: true, ignored: `link status ${String(body.paymentLink?.status)}` });
    }

    const tier = tierForPaymentLink(body.paymentLink);
    if (!tier) {
        console.error('Paid Paymento event for a link that is not a VariantFlow plan.', { id: body.paymentLink?.id, url: body.paymentLink?.url });
        return json({ received: true, ignored: 'not a VariantFlow plan link' });
    }

    const eventId = text(body.event?.id) ?? text(headers.get('x-paymento-event-id'));
    const reference = eventId ?? text(body.customer?.metadata?.payment_id) ?? text(body.customer?.metadata?.order_id);
    if (!reference) return json({ error: 'Event has no id.' }, 400);

    return respond(await activatePaidPlan(admin, {
        key: `link:${reference}`,
        tier,
        email: text(body.customer?.email)?.toLowerCase() ?? null,
        amountUsdt: BILLING_PLANS[tier].priceUsdt,
        source: 'payment_link',
        payload: body,
    }));
}

async function handlePaymentApiCallback(admin: NonNullable<ReturnType<typeof createSupabaseAdminClient>>, raw: string, contentType: string) {
    let input: Record<string, unknown> = {};
    if (contentType.includes('application/json')) {
        try { input = JSON.parse(raw) ?? {}; } catch { input = {}; }
    } else {
        new URLSearchParams(raw).forEach((value, key) => { input[key] = value; });
    }

    const token = ['token', 'paymentToken', 'payment_token', 'orderToken', 'order_token'].map((name) => text(input[name])).find(Boolean);
    if (!token) {
        // A reachability probe (for example from a dashboard test) carries no payment.
        return json({ received: true, verified: false, message: 'Webhook endpoint reachable; no payment supplied.' });
    }

    let verified: PaymentoVerifyResponse;
    try {
        verified = await verifyPaymentoToken(token);
    } catch (error) {
        console.error('Paymento verify call failed:', error instanceof Error ? error.message : error);
        return json({ error: 'Payment verification is temporarily unavailable.' }, 502);
    }

    const payment = verified.body;
    const orderStatus = String(payment?.orderStatus ?? '').toLowerCase();
    // `success` only means the verify call worked; the order itself must be approved.
    const approved = verified.success === true && (orderStatus === '8' || orderStatus === 'approve' || orderStatus === 'approved');
    if (!approved) return json({ received: true, verified: false, orderStatus: payment?.orderStatus ?? null });

    // Plan and amount come only from Paymento's verified response, never from the request body.
    const paidAmount = Number(payment?.settlement?.expectedCryptoAmount ?? NaN);
    if (!Number.isFinite(paidAmount)) return json({ error: 'Verified payment is missing the paid amount.' }, 422);
    const covers = (plan: 'PRO' | 'SCALE') => paidAmount + 0.01 >= BILLING_PLANS[plan].priceUsdt;
    const additional = (keys: string[]) => payment?.additionalData?.find((item) => keys.includes((item.key || '').toLowerCase()))?.value;
    const named = additional(['plan', 'tier', 'variantflow_plan'])?.toUpperCase();
    const tier = named === 'PRO' || named === 'SCALE' ? named : covers('SCALE') ? 'SCALE' : covers('PRO') ? 'PRO' : null;
    if (!tier || !covers(tier)) return json({ error: 'Verified payment amount does not cover a VariantFlow plan.' }, 422);

    // The token can only be applied once, so the email only chooses which account receives the plan.
    const email = (additional(['email', 'customeremail', 'customer_email'])
        ?? ['email', 'customerEmail', 'customer_email'].map((name) => text(input[name])).find(Boolean))?.toLowerCase() ?? null;

    return respond(await activatePaidPlan(admin, {
        key: payment?.orderId || token,
        tier,
        email,
        amountUsdt: paidAmount,
        transactionHash: payment?.settlement?.transactions?.find((transaction) => transaction.txHash)?.txHash ?? null,
        paymentToken: token,
        source: 'payment_api',
        payload: verified,
    }));
}
