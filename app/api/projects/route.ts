import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { getAccountAccess } from '../../../lib/entitlements.server';
import { apiError } from '../../../lib/api-errors';

const PROJECT_FIELDS = 'id, name, catalog, created_at, updated_at';
const noStore = { headers: { 'Cache-Control': 'private, no-store' } };

const getUserAndClient = async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { supabase: null, user: null };

    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user };
};

const projectName = (value: unknown) => String(value || '').trim().slice(0, 200) || 'Untitled catalog';

export async function GET() {
    const { supabase, user } = await getUserAndClient();
    if (!supabase) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before loading projects.');

    const { data, error } = await supabase
        .from('projects')
        .select(PROJECT_FIELDS)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) return apiError('server-error', 500, 'Unable to load projects.');
    return NextResponse.json({ projects: data ?? [] }, noStore);
}

export async function POST(request: NextRequest) {
    const { supabase, user } = await getUserAndClient();
    if (!supabase) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before saving projects.');

    const body = await request.json().catch(() => null);
    if (!body?.catalog || typeof body.catalog !== 'object') return apiError('invalid-payload', 400, 'A catalog payload is required.');

    const { entitlements } = await getAccountAccess(supabase, user).catch(() => ({ entitlements: null }));
    if (!entitlements) return apiError('plan-check-failed', 500, 'Unable to confirm your plan.');
    if (entitlements.maxProjects !== null) {
        const { count } = await supabase.from('projects').select('id', { count: 'exact', head: true }).eq('user_id', user.id);
        if ((count ?? 0) >= entitlements.maxProjects) {
            return apiError('project-limit', 403, `Your plan includes ${entitlements.maxProjects} project.`, { limit: entitlements.maxProjects });
        }
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name: projectName(body.name), catalog: body.catalog })
        .select(PROJECT_FIELDS)
        .single();

    if (error) return apiError('server-error', 500, 'Unable to save project.');
    return NextResponse.json({ project: data }, { status: 201, ...noStore });
}

export async function PUT(request: NextRequest) {
    const { supabase, user } = await getUserAndClient();
    if (!supabase) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before updating projects.');

    const body = await request.json().catch(() => null);
    if (!body?.id || !body.catalog) return apiError('invalid-payload', 400, 'Project id and catalog are required.');

    const { data, error } = await supabase
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
    const { supabase, user } = await getUserAndClient();
    if (!supabase) return apiError('not-configured', 503, 'Cloud storage is not configured yet.');
    if (!user) return apiError('unauthorized', 401, 'Sign in before deleting projects.');

    const id = request.nextUrl.searchParams.get('id');
    if (!id) return apiError('invalid-payload', 400, 'A project id is required.');

    const { error } = await supabase.from('projects').delete().eq('id', id).eq('user_id', user.id);
    if (error) return apiError('server-error', 500, 'Unable to delete project.');
    return NextResponse.json({ ok: true }, noStore);
}
