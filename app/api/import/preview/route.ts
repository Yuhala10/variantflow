import { NextResponse } from 'next/server';
import { authorizeImport, importOptions, parseImportCsv, sanitizeMapping } from '../../../../lib/import.server';
import { buildCatalogFromRows } from '../../../../domain/import/importCatalog';

const PREVIEW_VALUES = 12;

/** Step 2: a summary of what the import will produce. It omits per-row SKUs and prices, so it can't stand in for an import. */
export async function POST(request: Request) {
    const auth = await authorizeImport();
    if ('error' in auth) return auth.error;

    const body = await request.json().catch(() => null);
    const result = parseImportCsv(body);
    if ('error' in result) return result.error;
    const { parsed } = result;

    const catalog = buildCatalogFromRows(parsed.rows, sanitizeMapping(body?.mapping, parsed.headers), importOptions(body, auth.access));

    return NextResponse.json({
        preview: {
            productTitle: catalog.productTitle,
            basePrice: catalog.basePrice,
            stats: catalog.stats,
            options: catalog.options.map((option) => ({ name: option.name, values: option.values.slice(0, PREVIEW_VALUES), total: option.values.length })),
        },
    }, { headers: { 'Cache-Control': 'private, no-store' } });
}
