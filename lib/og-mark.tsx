/** The logo mark as plain JSX for next/og image generation (no Tailwind available there). */
export function OgMark({ size, radius }: { size: number; radius: number }) {
    const glyph = Math.round(size * 0.62);
    return (
        <div style={{ width: size, height: size, borderRadius: radius, background: '#1f5b4a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none">
                <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" fill="#ffffff" />
                <path d="m3 12 9 4.5 9-4.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
                <path d="m3 16.5 9 4.5 9-4.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.45" />
            </svg>
        </div>
    );
}
