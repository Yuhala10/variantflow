import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { createSupabaseAdminClient } from '../../../lib/supabase/admin';
import { getAccountAccess } from '../../../lib/entitlements.server';
import { apiError } from '../../../lib/api-errors';

const CATEGORIES = ['bug', 'idea', 'question', 'other'] as const;
const STATUSES = ['new', 'done'] as const;
const MAX_MESSAGE = 4000;
const MAX_PER_HOUR = 10;
const noStore = { headers: { 'Cache-Control': 'private, no-store' } };

const signedIn = async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { supabase: null, user: null };
    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user };
};

/** Owners and admins triage feedback; everyone else only sends it. */
const staffAdmin = async () => {
    const { supabase, user } = await signedIn();
    if (!supabase) return { error: apiError('not-configured', 503, 'Feedback is not configured yet.') };
    if (!user) return { error: apiError('unauthorized', 401, 'Sign in first.') };
    const access = await getAccountAccess(supabase, user).catch(() => null);
    if (!access?.role) return { error: apiError('forbidden', 403, 'Only owners and admins can read feedback.') };
    const admin = createSupabaseAdminClient();
    if (!admin) return { error: apiError('not-configured', 503, 'SUPABASE_SERVICE_ROLE_KEY is not configured.') };
    return { admin };
};

export async function POST(request: NextRequest) {
    const { supabase, user } = await signedIn();
    if (!supabase) return apiError('not-configured', 503, 'Feedback is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before sending feedback.');

    const body = await request.json().catch(() => null);
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    const category = CATEGORIES.includes(body?.category) ? body.category : 'other';
    if (!message || message.length > MAX_MESSAGE) return apiError('invalid-payload', 400, `Feedback must be between 1 and ${MAX_MESSAGE} characters.`);

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabase.from('feedback').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', since);
    if ((count ?? 0) >= MAX_PER_HOUR) return apiError('rate-limited', 429, 'Too many messages. Please try again later.');

    const access = await getAccountAccess(supabase, user).catch(() => null);
    const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        email: user.email ?? null,
        category,
        message,
        page: typeof body?.page === 'string' ? body.page.slice(0, 300) : null,
        locale: body?.locale === 'fr' ? 'fr' : 'en',
        plan: access ? (access.role ?? access.tier) : null,
    });
    if (error) {
        console.error('Feedback insert failed:', error.message);
        return apiError('server-error', 500, 'Unable to send feedback.');
    }
    return NextResponse.json({ ok: true }, { status: 201, ...noStore });
}

export async function GET() {
    const result = await staffAdmin();
    if ('error' in result) return result.error;
    const { data, error } = await result.admin
        .from('feedback')
        .select('id, email, category, message, page, locale, plan, status, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
    if (error) return apiError('server-error', 500, 'Unable to load feedback.');
    return NextResponse.json({ feedback: data ?? [] }, noStore);
}

export async function PATCH(request: NextRequest) {
    const result = await staffAdmin();
    if ('error' in result) return result.error;
    const body = await request.json().catch(() => null);
    if (typeof body?.id !== 'string' || !STATUSES.includes(body?.status)) return apiError('invalid-payload', 400, 'An id and a valid status are required.');
    const { error } = await result.admin.from('feedback').update({ status: body.status }).eq('id', body.id);
    if (error) return apiError('server-error', 500, 'Unable to update feedback.');
    return NextResponse.json({ ok: true }, noStore);
}
