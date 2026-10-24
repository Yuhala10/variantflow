/**
 * Only allow same-site relative paths, so `?next=` can never send users to another domain.
 * Browsers silently remove tabs and line breaks from URLs and treat "\" like "/", so
 * "/\t/evil.com" would become "//evil.com"; any control character or backslash is refused.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = '/workspace') {
    if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
    if (/[\u0000-\u001f\u007f\\]/.test(value)) return fallback;
    return value;
}
