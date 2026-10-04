import { ImageResponse } from 'next/og';
import { OG, OgMark } from '../../lib/og-mark';

export const dynamic = 'force-static';

// 512×512 PNG used by the web app manifest and the Organization structured data logo.
export function GET() {
    return new ImageResponse(
        (
            <div style={{ width: 512, height: 512, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: OG.gradient }}>
                <OgMark size={400} radius={0} />
            </div>
        ),
        { width: 512, height: 512 },
    );
}
