import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '../../../../lib/supabase/server';
import { convertCatalogToShopifyCsv, CatalogExportInput } from '../../../../exporters/shopify/csvAdapter';
import { validateProductData } from '../../../../domain/validation/validateProduct';
import { SubscriptionTier } from '../../../../types';

const isSubscriptionTier = (value: unknown): value is SubscriptionTier => value === 'FREE' || value === 'PRO' || value === 'SCALE';

export async function POST(request: NextRequest) {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
        return NextResponse.json({ error: 'Cloud export is not configured yet.' }, { status: 503 });
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
        return NextResponse.json({ error: 'Sign in before exporting.' }, { status: 401 });
    }

    let catalog: CatalogExportInput;
    try {
        catalog = await request.json() as CatalogExportInput;
    } catch {
        return NextResponse.json({ error: 'The catalog payload is invalid.' }, { status: 400 });
    }

    if (!catalog || typeof catalog.productTitle !== 'string' || !Array.isArray(catalog.options) || !Array.isArray(catalog.variants)) {
        return NextResponse.json({ error: 'The catalog payload is incomplete.' }, { status: 400 });
    }

    const { data: subscription } = await supabase
        .from('subscriptions')
        .select('tier, status')
        .eq('user_id', user.id)
        .maybeSingle();

    const tier = isSubscriptionTier(subscription?.tier) ? subscription.tier : 'FREE';
    if (subscription?.status && subscription.status !== 'active') {
        return NextResponse.json({ error: 'Your subscription is not active.' }, { status: 403 });
    }

    if (tier === 'FREE' && catalog.variants.length > 50) {
        return NextResponse.json({ error: 'Free exports are limited to 50 variants. Upgrade to export larger catalogs.' }, { status: 403 });
    }

    const validationErrors = validateProductData({
        productTitle: catalog.productTitle,
        options: catalog.options,
        variants: catalog.variants,
    });
    if (validationErrors.length > 0) {
        return NextResponse.json({ error: 'Fix catalog validation errors before exporting.', validationErrors }, { status: 422 });
    }

    const csv = convertCatalogToShopifyCsv(catalog);
    const fileName = `${catalog.productTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'variantflow_export'}.csv`;

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'private, no-store',
        },
    });
}
