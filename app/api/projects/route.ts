import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

const getUserAndClient = async () => {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { supabase: null, user: null };

    const { data: { user } } = await supabase.auth.getUser();
    return { supabase, user };
};

export async function GET() {
    const { supabase, user } = await getUserAndClient();
    if (!supabase) return NextResponse.json({ error: 'Cloud storage is not configured yet.' }, { status: 503 });
    if (!user) return NextResponse.json({ error: 'Sign in before loading projects.' }, { status: 401 });

    const { data, error } = await supabase
        .from('projects')
        .select('id, name, catalog, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

    if (error) return NextResponse.json({ error: 'Unable to load projects.' }, { status: 500 });
    return NextResponse.json({ projects: data ?? [] });
}

export async function POST(request: NextRequest) {
    const { supabase, user } = await getUserAndClient();
    if (!supabase) return NextResponse.json({ error: 'Cloud storage is not configured yet.' }, { status: 503 });
    if (!user) return NextResponse.json({ error: 'Sign in before saving projects.' }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body?.catalog || typeof body.catalog !== 'object') {
        return NextResponse.json({ error: 'A catalog payload is required.' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({ user_id: user.id, name: String(body.name || 'Untitled catalog'), catalog: body.catalog })
        .select('id, name, catalog, created_at, updated_at')
        .single();

    if (error) return NextResponse.json({ error: 'Unable to save project.' }, { status: 500 });
    return NextResponse.json({ project: data }, { status: 201 });
}

export async function PUT(request: NextRequest) {
    const { supabase, user } = await getUserAndClient();
    if (!supabase) return NextResponse.json({ error: 'Cloud storage is not configured yet.' }, { status: 503 });
    if (!user) return NextResponse.json({ error: 'Sign in before updating projects.' }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body?.id || !body.catalog) return NextResponse.json({ error: 'Project id and catalog are required.' }, { status: 400 });

    const { data, error } = await supabase
        .from('projects')
        .update({ name: String(body.name || 'Untitled catalog'), catalog: body.catalog, updated_at: new Date().toISOString() })
        .eq('id', body.id)
        .eq('user_id', user.id)
        .select('id, name, catalog, created_at, updated_at')
        .single();

    if (error) return NextResponse.json({ error: 'Unable to update project.' }, { status: 500 });
    return NextResponse.json({ project: data });
}