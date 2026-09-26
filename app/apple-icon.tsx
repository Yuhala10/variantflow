import { ImageResponse } from 'next/og';
import { OgMark } from '../lib/og-mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// iOS applies its own rounded mask, so the mark fills the square.
export default function AppleIcon() {
    return new ImageResponse(<OgMark size={180} radius={0} />, size);
}
