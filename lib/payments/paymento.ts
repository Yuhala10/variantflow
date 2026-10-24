import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { SubscriptionTier } from '../../types';

/**
 * Paymento payment-link webhooks are signed: X-Paymento-Signature is the lowercase hex
 * HMAC-SHA256 of the raw request body, keyed with the merchant secret. Paymento's docs name
 * the key both "webhook secret" and "merchant secret key", so either configured secret is
 * accepted. Both are server-only, so a forged request still cannot produce a valid signature.
 */
export function verifyPaymentoSignature(rawBody: string, signatureHeader: string) {
    const received = signatureHeader.trim().replace(/^sha256=/i, '').toLowerCase();
    if (!/^[0-9a-f]{64}$/.test(received)) return false;
    const secrets = [process.env.PAYMENTO_WEBHOOK_SECRET, process.env.PAYMENTO_SECRET_KEY]
        .map((secret) => secret?.trim())
        .filter((secret): secret is string => Boolean(secret));

    return secrets.some((secret) => {
        const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
        return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(received, 'hex'));
    });
}

export const hasPaymentoSigningSecret = () => Boolean(process.env.PAYMENTO_WEBHOOK_SECRET?.trim() || process.env.PAYMENTO_SECRET_KEY?.trim());

/** "https://app.paymento.io/payment-link/0066c8…?x=1" → "0066c8…" */
const linkId = (value: unknown) =>
    typeof value === 'string' && value.trim()
        ? value.trim().split(/[?#]/)[0].replace(/\/+$/, '').split('/').pop()?.toLowerCase() || null
        : null;

const configuredLinks = (): Record<'PRO' | 'SCALE', string | null> => ({
    PRO: linkId(process.env.PAYMENTO_PRO_LINK_ID || process.env.NEXT_PUBLIC_PAYMENTO_PRO_LINK),
    SCALE: linkId(process.env.PAYMENTO_SCALE_LINK_ID || process.env.NEXT_PUBLIC_PAYMENTO_SCALE_LINK),
});

/**
 * Payment-link events carry no amount, so the plan comes from which of our links was paid
 * (matched on the link id or URL). The link title is a last resort, logged so it can be fixed.
 */
export function tierForPaymentLink(link: { id?: unknown; url?: unknown; title?: unknown } | undefined): Exclude<SubscriptionTier, 'FREE'> | null {
    if (!link) return null;
    const candidates = [linkId(link.id), linkId(link.url)].filter(Boolean);
    const links = configuredLinks();
    if (links.SCALE && candidates.includes(links.SCALE)) return 'SCALE';
    if (links.PRO && candidates.includes(links.PRO)) return 'PRO';

    const title = typeof link.title === 'string' ? link.title : '';
    const byTitle = /\bscale\b/i.test(title) ? 'SCALE' : /\bpro\b/i.test(title) ? 'PRO' : null;
    if (byTitle) console.warn('Paymento link matched by title only; set PAYMENTO_PRO_LINK_ID / PAYMENTO_SCALE_LINK_ID.', { id: link.id, url: link.url, title });
    return byTitle;
}

export interface PaymentoVerifyResponse {
    success?: boolean;
    message?: string;
    body?: {
        token?: string;
        orderId?: string;
        orderStatus?: string | number;
        additionalData?: Array<{ key?: string; value?: string }>;
        settlement?: { expectedCryptoAmount?: number; transactions?: Array<{ txHash?: string }> };
    };
}

/** Payment-request API: asks Paymento itself whether a token belongs to an approved order. */
export async function verifyPaymentoToken(token: string): Promise<PaymentoVerifyResponse> {
    const apiKey = process.env.PAYMENTO_SECRET_KEY;
    if (!apiKey) throw new Error('PAYMENTO_SECRET_KEY is not configured.');

    const response = await fetch('https://api.paymento.io/v1/payment/verify', {
        method: 'POST',
        headers: { 'Api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ token }),
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) throw new Error(`Paymento verification failed with HTTP ${response.status}.`);
    return await response.json() as PaymentoVerifyResponse;
}
