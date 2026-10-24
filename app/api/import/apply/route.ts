import { NextResponse } from 'next/server';
import { authorizeImport, importOptions, parseImportCsv, sanitizeMapping } from '../../../../lib/import.server';
import { buildCatalogFromRows } from '../../../../domain/import/importCatalog';
import { consumeRowRuns } from '../../../../lib/usage.server';
import { apiError } from '../../../../lib/api-errors';

/** Step 3: builds the catalog, meters one row-run per supplier row, and returns it to the workspace. */
export async function POST(request: Request) {
    const auth = await authorizeImport();
    if ('error' in auth) return auth.error;

    const body = await request.json().catch(() => null);
    const result = parseImportCsv(body);
    if ('error' in result) return result.error;
    const { parsed } = result;

    const catalog = buildCatalogFromRows(parsed.rows, sanitizeMapping(body?.mapping, parsed.headers), importOptions(body, auth.access));
    if (catalog.options.length === 0) return apiError('invalid-payload', 422, 'Map at least one column as an option.');

    // Metering happens last, so a failed import never consumes row-runs.
    const usage = await consumeRowRuns(auth.user.id, parsed.rows.length, auth.access.entitlements.monthlyRowRuns);
    if (!usage.allowed) {
        return usage.reason === 'limit'
            ? apiError('row-runs-exhausted', 429, 'You have used all row-runs for this month.', { used: usage.used, limit: auth.access.entitlements.monthlyRowRuns })
            : apiError('usage-unavailable', 503, 'Usage tracking is temporarily unavailable.');
    }

    return NextResponse.json({ catalog, used: usage.used, limit: auth.access.entitlements.monthlyRowRuns }, { headers: { 'Cache-Control': 'private, no-store' } });
}
