// Marketing copy shared between the visible pages and their structured data,
// so what search engines read always matches what visitors see.

export const HOME_FAQ = [
    {
        question: 'What does VariantFlow do?',
        answer: 'VariantFlow turns your product options — like size, color and material — into every possible variant, gives each one a consistent SKU and price, checks the whole catalog for mistakes, and exports a CSV you can import straight into Shopify.',
    },
    {
        question: 'Does VariantFlow change my existing Shopify products?',
        answer: 'No. VariantFlow never connects to your store. It creates a validated CSV file, and you decide when and how to import it in Shopify.',
    },
    {
        question: 'How many variants can I create for free?',
        answer: 'The Free plan generates and exports catalogs of up to 50 variants. Pro and Scale remove the variant limit and add CSV import, column mapping and supplier cleanup tools.',
    },
    {
        question: 'Where is my catalog stored?',
        answer: 'Variants are generated instantly in your browser. When you are signed in, your catalog is saved privately to your account so you can continue on any device. Your data is never sold or shared.',
    },
    {
        question: 'How do SKU templates work?',
        answer: 'Write a pattern such as TSH-{COLOR}-{SIZE}. VariantFlow replaces each token with the matching option value for every variant, producing SKUs like TSH-BLACK-XL, and flags any duplicates before export.',
    },
    {
        question: 'Does it work on my phone?',
        answer: 'Yes. VariantFlow is designed for desktop, tablet and mobile, including iPhone and Android, so you can review and export catalogs from anywhere.',
    },
] as const;

export const PRICING_FAQ = [
    {
        question: 'How do I pay for Pro or Scale?',
        answer: 'Plans are paid monthly in USDT on the TRON (TRC20) network through our payment partner Paymento. Your plan activates automatically once the payment is confirmed.',
    },
    {
        question: 'Can I start without paying?',
        answer: 'Yes. The Free plan includes the full variant, SKU, pricing and validation workflow for catalogs of up to 50 variants, with no card or wallet required.',
    },
    {
        question: 'What happens when my month ends?',
        answer: 'Each payment unlocks 30 days. If you do not renew, your account returns to the Free plan and your saved catalogs stay safe.',
    },
    {
        question: 'Which email should I use when paying?',
        answer: 'Use the same email address as your VariantFlow account so the payment is matched to you automatically.',
    },
] as const;

export const WORKFLOW_STEPS = [
    {
        title: 'Define your options',
        text: 'Name your product and list its options — sizes, colors, materials or anything custom. Every combination is generated instantly.',
    },
    {
        title: 'Set SKU and price rules',
        text: 'Write one SKU pattern and a few pricing rules. VariantFlow applies them to every variant, and you can still override any single row.',
    },
    {
        title: 'Validate and export',
        text: 'Duplicates, empty values and missing prices are caught automatically. When everything passes, download a Shopify-ready CSV.',
    },
] as const;
