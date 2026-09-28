import { NextResponse } from 'next/server';

/** Stable error codes the browser translates; `error` is an English fallback. */
export type ApiErrorCode =
    | 'not-configured'
    | 'unauthorized'
    | 'invalid-payload'
    | 'plan-check-failed'
    | 'export-locked'
    | 'platform-locked'
    | 'variant-limit'
    | 'validation-failed'
    | 'row-runs-exhausted'
    | 'usage-unavailable'
    | 'import-locked'
    | 'project-limit'
    | 'not-found'
    | 'forbidden'
    | 'rate-limited'
    | 'account-exists'
    | 'weak-password'
    | 'invalid-email'
    | 'server-error';

export const apiError = (code: ApiErrorCode, status: number, error: string, extra: Record<string, unknown> = {}) =>
    NextResponse.json({ code, error, ...extra }, { status, headers: { 'Cache-Control': 'private, no-store' } });
