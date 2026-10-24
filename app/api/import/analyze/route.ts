import { NextResponse } from 'next/server';
import { authorizeImport, parseImportCsv } from '../../../../lib/import.server';
import { suggestMapping } from '../../../../domain/import/importCatalog';

/** Step 1: reads the file and suggests what each column is. Nothing is imported or metered yet. */
export async function POST(request: Request) {
    const auth = await authorizeImport();
    if ('error' in auth) return auth.error;

    const body = await request.json().catch(() => null);
    const result = parseImportCsv(body);
    if ('error' in result) return result.error;
    const { parsed } = result;

    const samples: Record<string, string> = {};
    for (const header of parsed.headers) {
        samples[header] = (parsed.rows.find((row) => row[header]?.trim())?.[header] ?? '').trim().slice(0, 80);
    }

    return NextResponse.json({
        headers: parsed.headers,
        rowCount: parsed.rows.length,
        samples,
        // Content-based ("smart") detection is a Scale feature; Pro matches on column names only.
        mapping: suggestMapping(parsed, auth.access.entitlements.canUseAiMapping),
    }, { headers: { 'Cache-Control': 'private, no-store' } });
}
