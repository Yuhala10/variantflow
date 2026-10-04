/** Brand colors for generated images (next/og has no access to the CSS tokens). */
export const OG = {
    canvas: '#f6f6fb',
    surface: '#ffffff',
    ink: '#0e1020',
    ink2: '#4a4d63',
    line: '#e5e5f0',
    brand: '#5a4ff0',
    success: '#128a5a',
    successSoft: '#e2f6ec',
    gradient: 'linear-gradient(135deg, #5a4ff0 10%, #c14ad6 100%)',
    sunrise: 'linear-gradient(100deg, #5a4ff0 0%, #e0489b 55%, #ff9d3c 100%)',
};

/** The logo mark as plain JSX for next/og image generation (no Tailwind available there). */
export function OgMark({ size, radius }: { size: number; radius: number }) {
    const glyph = Math.round(size * 0.62);
    return (
        <div style={{ width: size, height: size, borderRadius: radius, backgroundImage: OG.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width={glyph} height={glyph} viewBox="0 0 24 24" fill="none">
                <path d="M12 3 3 7.5l9 4.5 9-4.5L12 3Z" fill="#ffffff" />
                <path d="m3 12 9 4.5 9-4.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.78" />
                <path d="m3 16.5 9 4.5 9-4.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
            </svg>
        </div>
    );
}
