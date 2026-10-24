import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getSessionUser } from '../../../lib/supabase/session';
import { createSupabaseAdminClient } from '../../../lib/supabase/admin';
import { getAccountAccess } from '../../../lib/entitlements.server';
import { apiError } from '../../../lib/api-errors';

const PROJECT_FIELDS = 'id, name, catalog, created_at, updated_at';
const noStore = { headers: { 'Cache-Control': 'private, no-store' } };

// A saved catalog is a few kilobytes; this cap only stops someone filling the database.
const MAX_CATALOG_BYTES = 1_000_000;

const getUserAndClient = async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { supabase: null, db: null, user: null };

    const user = await getSessionUser(supabase);
    // Rows are read and written with the service role, always filtered to the verified user below,
    // so the app keeps working when direct table access is revoked for browser keys.
    return { supabase, db: createSupabaseAdminClient() ?? supabase, user };
};

const tooLarge = (catalog: unknown) => JSON.stringify(catalog).length > MAX_CATALOG_BYTES;

const projectName = (value: unknown) => String(value || '').trim().slice(0, 200) || 'Untitled catalog';

export async function GET() {
    const { supabase, db, user } = await getUserAndClient();
    if (!supabase || !db) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before loading projects.');

    const { data, error } = await db
        .from('projects')
        .select(PROJECT_FIELDS)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) return apiError('server-error', 500, 'Unable to load projects.');
    return NextResponse.json({ projects: data ?? [] }, noStore);
}

export async function POST(request: NextRequest) {
    const { supabase, db, user } = await getUserAndClient();
    if (!supabase || !db) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before saving projects.');

    const body = await request.json().catch(() => null);
    if (!body?.catalog || typeof body.catalog !== 'object') return apiError('invalid-payload', 400, 'A catalog payload is required.');
    if (tooLarge(body.catalog)) return apiError('invalid-payload', 413, 'This catalog is too large to save.');

    const { entitlements } = await getAccountAccess(supabase, user).catch(() => ({ entitlements: null }));
    if (!entitlements) return apiError('plan-check-failed', 500, 'Unable to confirm your plan.');
    if (entitlements.maxProjects !== null) {
        const { count } = await db.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
        if ((count ?? 0) >= entitlements.maxProjects) {
            return apiError('project-limit', 403, `Your plan includes ${entitlements.maxProjects} project.`, { limit: entitlements.maxProjects });
        }
    }

    const { data, error } = await db
        .from('projects')
        .insert({ user_id: user.id, name: projectName(body.name), catalog: body.catalog })
        .select(PROJECT_FIELDS)
        .single();

    if (error) return apiError('server-error', 500, 'Unable to save project.');
    return NextResponse.json({ project: data }, { status: 201, ...noStore });
}

export async function PUT(request: NextRequest) {
    const { supabase, db, user } = await getUserAndClient();
    if (!supabase || !db) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before updating projects.');

    const body = await request.json().catch(() => null);
    if (!body?.id || !body.catalog || typeof body.catalog !== 'object') return apiError('invalid-payload', 400, 'Project id and catalog are required.');
    if (tooLarge(body.catalog)) return apiError('invalid-payload', 413, 'This catalog is too large to save.');

    const { data, error } = await db
        .from('projects')
        .update({ name: projectName(body.name), catalog: body.catalog, updated_at: new Date().toISOString() })
        .eq('id', body.id)
        .eq('user_id', user.id)
        .select(PROJECT_FIELDS)
        .single();

    if (error) return apiError('not-found', 404, 'Unable to update project.');
    return NextResponse.json({ project: data }, noStore);
}

export async function DELETE(request: NextRequest) {
    const { supabase, db, user } = await getUserAndClient();
    if (!supabase || !db) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before deleting projects.');

    const id = request.nextUrl.searchParams.get('id');
    if (!id) return apiError('invalid-payload', 400, 'A project id is required.');

    const { error } = await db.from('projects').delete().eq('id', id).eq('user_id', user.id);
    if (error) return apiError('server-error', 500, 'Unable to delete project.');
    return NextResponse.json({ ok: true }, noStore);
}
