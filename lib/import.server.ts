import 'server-only';
import { createSupabaseServerClient } from './supabase/server';
import { getSessionUser, type SessionUser } from './supabase/session';
import { getAccountAccess } from './entitlements.server';
import { apiError } from './api-errors';
import { parseCsv, type ColumnMapping, type ColumnRole, type ParsedCsv } from '../domain/import/importCatalog';
import type { AccountAccess } from '../types';

// Vercel accepts request bodies up to 4.5 MB; one product's supplier file is far smaller.
export const MAX_IMPORT_CSV_CHARS = 4_000_000;
export const MAX_IMPORT_ROWS = 20_000;

const ROLES = new Set<ColumnRole>(['title', 'sku', 'price', 'option', 'ignore']);

/**
 * Supplier import runs on the server: the browser only shows the screens. That keeps the
 * Pro/Scale import tools behind the plan check and meters every imported row.
 */
export async function authorizeImport(): Promise<{ user: SessionUser; access: AccountAccess } | { error: Response }> {
    const supabase = await createSupabaseServerClient();
    if (!supabase) return { error: apiError('not-configured', 503, 'Cloud account is not configured yet.') };

    const user = await getSessionUser(supabase);
    if (!user) return { error: apiError('unauthorized', 401, 'Sign in before importing.') };

    let access: AccountAccess;
    try {
        access = await getAccountAccess(supabase, user);
    } catch {
        return { error: apiError('plan-check-failed', 500, 'Unable to confirm your plan. Please try again.') };
    }
    if (!access.entitlements.canImportCsv) return { error: apiError('import-locked', 403, 'CSV import is included in Pro and Scale.') };
    return { user, access };
}

/** Reads and parses the CSV from a request body, enforcing size limits. */
export function parseImportCsv(body: unknown): { parsed: ParsedCsv } | { error: Response } {
    const csv = (body as { csv?: unknown } | null)?.csv;
    if (typeof csv !== 'string' || !csv.trim()) return { error: apiError('invalid-payload', 400, 'A CSV file is required.') };
    if (csv.length > MAX_IMPORT_CSV_CHARS) return { error: apiError('invalid-payload', 413, 'This file is too large to import.') };

    const parsed = parseCsv(csv);
    if (parsed.headers.length === 0 || parsed.rows.length === 0) return { error: apiError('invalid-payload', 422, 'The file has no header row or no data.') };
    if (parsed.rows.length > MAX_IMPORT_ROWS) return { error: apiError('invalid-payload', 413, `Imports are limited to ${MAX_IMPORT_ROWS} rows.`) };
    return { parsed };
}

/** Keeps only valid roles for columns that exist in the file; never trusts the browser's shape. */
export function sanitizeMapping(raw: unknown, headers: string[]): Record<string, ColumnMapping> {
    const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, { role?: unknown; optionName?: unknown }>;
    const mapping: Record<string, ColumnMapping> = {};
    for (const header of headers) {
        const column = input[header];
        const role = ROLES.has(column?.role as ColumnRole) ? (column?.role as ColumnRole) : 'ignore';
        const optionName = typeof column?.optionName === 'string' ? column.optionName.trim().slice(0, 60) : undefined;
        mapping[header] = role === 'option' ? { role, optionName: optionName || header } : { role };
    }
    return mapping;
}

/** Cleanup is a Pro tool and normalization a Scale tool; the plan decides, not the request. */
export function importOptions(body: unknown, access: AccountAccess) {
    const request = (body ?? {}) as { clean?: unknown; normalize?: unknown };
    return {
        clean: request.clean === true && access.entitlements.canTransformCatalog,
        normalize: request.normalize === true && access.entitlements.canNormalizeSuppliers,
    };
}
