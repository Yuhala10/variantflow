import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '../../../../lib/supabase/admin';
import { apiError } from '../../../../lib/api-errors';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 6;

/**
 * Creates an account that is already confirmed, so new users go straight to their workspace
 * instead of waiting for (and clicking) a confirmation email. The browser signs in right after.
 * Without the service role key this answers 503 and the browser falls back to the standard email flow.
 */
export async function POST(request: NextRequest) {
    const admin = createSupabaseAdminClient();
    if (!admin) return apiError('not-configured', 503, 'Instant sign-up is not configured.');

    const body = await request.json().catch(() => null);
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!EMAIL_PATTERN.test(email) || email.length > 254) return apiError('invalid-email', 400, 'That email address is not valid.');
    if (password.length < MIN_PASSWORD || password.length > 72) return apiError('weak-password', 400, `Passwords need at least ${MIN_PASSWORD} characters.`);

    const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) {
        if (error.code === 'email_exists' || error.code === 'user_already_exists' || /already (been )?registered/i.test(error.message)) {
            return apiError('account-exists', 409, 'An account already exists for this email.');
        }
        if (error.code === 'weak_password') return apiError('weak-password', 400, error.message);
        if (error.code === 'email_address_invalid' || error.code === 'validation_failed') return apiError('invalid-email', 400, error.message);
        console.error('Sign-up failed:', error.code, error.message);
        return apiError('server-error', 500, 'Unable to create the account.');
    }
    return NextResponse.json({ ok: true }, { status: 201, headers: { 'Cache-Control': 'private, no-store' } });
}
