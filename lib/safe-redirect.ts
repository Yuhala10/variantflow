/** Only allow same-site relative paths, so `?next=` can never send users to another domain. */
export function safeRedirectPath(value: string | null | undefined, fallback = '/workspace') {
    if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return fallback;
    return value;
}
