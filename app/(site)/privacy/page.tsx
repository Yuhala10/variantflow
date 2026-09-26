import { LegalPage } from '../../../components/site/legal-page';
import { JsonLd, breadcrumbSchema, pageMetadata } from '../../../lib/seo';

export const metadata = pageMetadata({
    title: 'Privacy Policy',
    description: 'How VariantFlow collects, stores and protects your account, catalog and payment information.',
    path: '/privacy',
});

export default function PrivacyPage() {
    return (
        <LegalPage eyebrow="Legal" title="Privacy policy" updated="September 2026">
            <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Privacy', path: '/privacy' }])} />

            <h2>What we collect</h2>
            <p>When you create an account we store your email address. When you are signed in, the catalogs you build — product titles, options, SKU patterns, prices and rules — are saved to your account so you can continue on any device.</p>
            <p>When you pay for a plan, we record the plan, the amount, the payment reference and the transaction hash provided by our payment partner so we can activate and support your subscription.</p>

            <h2>How your catalog is processed</h2>
            <p>Variant generation, SKU building, pricing and validation run in your browser. Exports are prepared on our servers only to confirm your plan allows them; exported files are not kept.</p>

            <h2>How we use your information</h2>
            <ul>
                <li>To provide the workspace and keep your catalogs in sync.</li>
                <li>To activate, renew and support paid plans.</li>
                <li>To respond when you contact us with feedback or a complaint.</li>
            </ul>
            <p>We do not sell or rent your information, and we do not use your catalog data for advertising.</p>

            <h2>Security</h2>
            <p>Account data is protected with row-level security so each account can only read its own catalogs and billing records. We use reasonable technical and organizational safeguards, but no internet-connected system can be guaranteed to be completely secure.</p>

            <h2>Your choices</h2>
            <p>You can contact us about your account, your saved catalogs or how your data is handled using the feedback form in the workspace.</p>
        </LegalPage>
    );
}
