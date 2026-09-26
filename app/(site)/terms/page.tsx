import { LegalPage } from '../../../components/site/legal-page';
import { JsonLd, breadcrumbSchema, pageMetadata } from '../../../lib/seo';

export const metadata = pageMetadata({
    title: 'Terms of Service',
    description: 'The terms that apply when you use VariantFlow, including plans, payments and acceptable use.',
    path: '/terms',
});

export default function TermsPage() {
    return (
        <LegalPage eyebrow="Legal" title="Terms of service" updated="September 2026">
            <JsonLd data={breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Terms', path: '/terms' }])} />

            <h2>The service</h2>
            <p>VariantFlow provides software for generating product variants, building SKUs, applying pricing rules, validating catalogs and exporting CSV files. Access to paid features depends on your active plan.</p>

            <h2>Plans and payments</h2>
            <p>Paid plans are billed in USDT on the TRON (TRC20) network through our payment partner. Each confirmed payment activates the selected plan for 30 days. If a plan is not renewed, the account returns to the Free plan and saved catalogs are kept.</p>
            <p>Blockchain payments cannot be reversed. Please check the network, amount and email address before sending.</p>

            <h2>Your responsibilities</h2>
            <p>You are responsible for the accuracy, legality and compliance of the data you enter, generate or export, and for reviewing files before importing them into any store.</p>

            <h2>Availability and changes</h2>
            <p>VariantFlow is provided “as is”. Features may change as the product evolves, and you should rely only on the features included in your active plan.</p>

            <h2>Contact</h2>
            <p>Report billing concerns, disputes or product issues promptly using the feedback form in the workspace.</p>
        </LegalPage>
    );
}
