import type { Locale } from '../i18n/config';
import type { LandingKey } from '../i18n/routes';

export interface LandingContent {
    /** <title> and social title */
    title: string;
    description: string;
    eyebrow: string;
    h1: string;
    h1Accent: string;
    intro: string;
    benefits: Array<{ title: string; text: string }>;
    steps: Array<{ title: string; text: string }>;
    faq: Array<{ question: string; answer: string }>;
    cta: string;
    /** Short label for navigation, footers and related links */
    nav: string;
}

const en: Record<LandingKey, LandingContent> = {
    'variant-generator': {
        nav: 'Variant generator',
        title: 'Shopify Variant Generator — Create Every Product Variant in Seconds',
        description: 'Generate every product variant from your options — sizes, colors, materials — with SKUs and prices, then export a Shopify-ready CSV. Free up to 50 variants.',
        eyebrow: 'Variant generator',
        h1: 'Shopify variant generator:',
        h1Accent: 'every combination, instantly.',
        intro: 'List your options once — sizes, colors, materials. VariantFlow builds every combination as a clean table you can review, edit and export. No formulas, no copy-paste.',
        benefits: [
            { title: 'Every combination, no gaps', text: '3 colors × 4 sizes is 12 variants. Add a material and it is 24. VariantFlow generates them all the moment you type, so nothing is missed.' },
            { title: 'Built around Shopify’s limits', text: 'Shopify allows up to 3 options and 2,048 variants per product. The builder keeps you to three options and shows your variant count as you go.' },
            { title: 'Each variant ready to sell', text: 'Every row gets a SKU from your pattern and a price from your rules. Change any single row by hand and reset it with one tap.' },
        ],
        steps: [
            { title: 'Name your product', text: 'Give it a title and add up to three options, such as Size, Color and Material.' },
            { title: 'Add the values', text: 'Type S, M, L, XL — or paste a whole list. Variants appear instantly.' },
            { title: 'Export', text: 'When validation passes, download the CSV and import it in Shopify.' },
        ],
        faq: [
            { question: 'How many variants can I generate for free?', answer: 'The Free plan generates and exports up to 50 variants per export. Pro and Scale have no variant limit.' },
            { question: 'How many options can a product have?', answer: 'Up to three, which is Shopify’s limit per product. A Shopify product can have up to 2,048 variants.' },
            { question: 'Does VariantFlow change my store?', answer: 'No. VariantFlow never connects to your store. You download a CSV and import it yourself, when you are ready.' },
        ],
        cta: 'Generate your variants',
    },
    'sku-generator': {
        nav: 'SKU generator',
        title: 'SKU Generator — Consistent SKUs for Every Product Variant',
        description: 'Create consistent, unique SKUs for every product variant from one pattern like TSH-{COLOR}-{SIZE}. Duplicates are flagged automatically. Free to start.',
        eyebrow: 'SKU generator',
        h1: 'SKU generator:',
        h1Accent: 'one pattern, every variant.',
        intro: 'Write a pattern once. VariantFlow fills in each variant’s own values and gives you clean, unique SKUs — and tells you if two ever collide.',
        benefits: [
            { title: 'Patterns, not typing', text: 'Write TSH-{COLOR}-{SIZE} and get TSH-BLACK-S, TSH-BLACK-M and all the rest. Click an option name to insert its token.' },
            { title: 'Clean by default', text: 'SKUs are uppercased, spaces become hyphens and unsupported characters are removed, so every SKU imports cleanly.' },
            { title: 'Duplicates caught early', text: 'If two variants end up with the same SKU, or one is missing, VariantFlow flags the row before you export.' },
        ],
        steps: [
            { title: 'Add your options', text: 'Size, Color, Material — whatever defines your variants.' },
            { title: 'Write the pattern', text: 'Mix fixed text with option names in curly braces.' },
            { title: 'Review and adjust', text: 'Edit any SKU by hand. Edited fields are highlighted and can be reset.' },
        ],
        faq: [
            { question: 'What makes a good SKU?', answer: 'Short, consistent and readable: a product code followed by the option values in the same order every time, separated by hyphens.' },
            { question: 'Which characters can a SKU contain?', answer: 'VariantFlow keeps letters, numbers, hyphens and underscores, which import reliably on every platform.' },
            { question: 'Can I change one SKU without changing the pattern?', answer: 'Yes. Type over any SKU in the table. It stays as you set it until you reset it.' },
        ],
        cta: 'Generate SKUs free',
    },
    'shopify-csv': {
        nav: 'Shopify CSV export',
        title: 'Shopify Product CSV Export — Variants Ready to Import',
        description: 'Build your product variants and export a CSV in Shopify’s product import format, validated before download. Free up to 50 variants per export.',
        eyebrow: 'Shopify CSV export',
        h1: 'Shopify product CSV export,',
        h1Accent: 'right the first time.',
        intro: 'Shopify’s product CSV has dozens of columns and strict rules. VariantFlow fills them in correctly and checks every row before you download.',
        benefits: [
            { title: 'Shopify’s format, handled', text: 'Handle, title, option names and values, SKU and price are written in the columns Shopify expects, one row per variant.' },
            { title: 'Validated before download', text: 'Export stays locked until duplicate SKUs, missing prices and empty options are fixed, so your import does not fail halfway.' },
            { title: 'You stay in control', text: 'VariantFlow never touches your store. You import the file in your Shopify admin when you are ready.' },
        ],
        steps: [
            { title: 'Build your variants', text: 'Add options, a SKU pattern and prices.' },
            { title: 'Fix what validation finds', text: 'Each issue is listed in plain language, with the row highlighted.' },
            { title: 'Import in Shopify', text: 'In your Shopify admin, open Products, choose Import and upload the file.' },
        ],
        faq: [
            { question: 'Will the file work with Shopify’s importer?', answer: 'Yes. The export follows Shopify’s product CSV format, with one row per variant grouped under the same handle.' },
            { question: 'Does importing overwrite my existing products?', answer: 'Only if you choose to. During import, Shopify lets you decide whether to overwrite products that have the same handle.' },
            { question: 'Is there a limit?', answer: 'The Free plan exports up to 50 variants per file. Pro and Scale remove the limit.' },
        ],
        cta: 'Create your Shopify CSV',
    },
    'woocommerce-csv': {
        nav: 'WooCommerce CSV',
        title: 'WooCommerce Variations CSV — Variable Products Without the Spreadsheet',
        description: 'Export variable products and their variations as a CSV for WooCommerce’s built-in product importer. Included in the Scale plan.',
        eyebrow: 'WooCommerce export',
        h1: 'WooCommerce variations CSV,',
        h1Accent: 'without the spreadsheet.',
        intro: 'Variable products in WooCommerce need a parent row and a row per variation, linked correctly. VariantFlow writes that structure for you.',
        benefits: [
            { title: 'Parent and variations linked', text: 'The file contains one variable product row and one variation row per variant, connected through the parent SKU.' },
            { title: 'Attributes filled in', text: 'Each attribute’s name and full list of values go on the parent. Each variation carries its own value, SKU and price.' },
            { title: 'One catalog, several platforms', text: 'Build once, then export for Shopify, for WooCommerce, or as a universal CSV for any other platform.' },
        ],
        steps: [
            { title: 'Build your variants', text: 'Options, SKUs and prices, exactly as for any other export.' },
            { title: 'Choose WooCommerce CSV', text: 'Open the export menu and pick the WooCommerce format.' },
            { title: 'Import in WooCommerce', text: 'In WordPress, go to Products, choose Import and upload the file.' },
        ],
        faq: [
            { question: 'Which plan includes WooCommerce export?', answer: 'WooCommerce and Universal CSV exports are part of the Scale plan. Shopify export is included in every plan.' },
            { question: 'Does it work with the built-in importer?', answer: 'Yes. The columns follow WooCommerce’s product CSV importer: Type, SKU, Name, Parent, attributes and Regular price.' },
            { question: 'What is the universal CSV?', answer: 'A clean spreadsheet with one row per variant — product, options, SKU and price — that opens correctly in Excel and imports into most platforms.' },
        ],
        cta: 'Build your catalog',
    },
    'pricing-rules': {
        nav: 'Pricing rules',
        title: 'Variant Pricing Rules — Price Every Variant Automatically',
        description: 'Set a base price and add rules like “XL +$2”. VariantFlow prices every variant automatically and lets you adjust any row by hand.',
        eyebrow: 'Pricing rules',
        h1: 'Variant pricing rules:',
        h1Accent: 'set it once.',
        intro: 'Stop typing the same price a hundred times. Set a base price, add a few adjustments, and every variant is priced correctly.',
        benefits: [
            { title: 'Base price plus adjustments', text: 'Start from one price, then add or subtract an amount when a variant has a specific value — XL +$2, Organic +$3.' },
            { title: 'Rules that stack', text: 'A variant that is both XL and Organic gets both adjustments. The table updates the moment you add a rule.' },
            { title: 'Override anything', text: 'Type a different price on any row. It is highlighted so you can spot it, and one tap resets it to the rule.' },
        ],
        steps: [
            { title: 'Set the base price', text: 'The price most of your variants share.' },
            { title: 'Add adjustments', text: 'Pick an option value and how much it changes the price.' },
            { title: 'Check the table', text: 'Every variant shows its final price before export.' },
        ],
        faq: [
            { question: 'Can a rule lower the price?', answer: 'Yes. Enter a negative amount, such as −1.50.' },
            { question: 'What if two rules apply to one variant?', answer: 'Both are applied, on top of the base price.' },
            { question: 'Will VariantFlow warn me about odd prices?', answer: 'Missing or negative prices block export. On Pro and Scale, advanced validation also points out zero prices and prices far from the rest.' },
        ],
        cta: 'Price your variants',
    },
    validation: {
        nav: 'Catalog validation',
        title: 'Product Catalog Validation — Catch Errors Before You Import',
        description: 'VariantFlow checks every variant for duplicate SKUs, missing prices and empty options before export, so your product import works the first time.',
        eyebrow: 'Catalog validation',
        h1: 'Product catalog validation:',
        h1Accent: 'import with confidence.',
        intro: 'A failed import costs an afternoon. VariantFlow checks your catalog as you build it and will not export a file that is not ready.',
        benefits: [
            { title: 'Checked as you type', text: 'Duplicate SKUs, invalid characters, missing or negative prices, empty options and repeated values are flagged the moment they appear.' },
            { title: 'Plain-language issues', text: 'Every problem is listed in words a person can act on, and the affected rows are highlighted in the table.' },
            { title: 'Advanced checks on Pro', text: 'Zero prices, prices far from the rest, extra spaces, inconsistent capitalization, very long SKUs and Shopify’s 2,048-variant limit.' },
        ],
        steps: [
            { title: 'Build or import your catalog', text: 'Validation starts immediately.' },
            { title: 'Open the issue list', text: 'See exactly what is wrong and where.' },
            { title: 'Export when it says Ready', text: 'The file downloads once every error is fixed.' },
        ],
        faq: [
            { question: 'What stops an export?', answer: 'Errors do: duplicate or invalid SKUs, missing or negative prices, a missing title and empty options. Suggestions from advanced validation never block you.' },
            { question: 'Is validation included in the Free plan?', answer: 'Yes. Core validation is in every plan. Advanced validation is part of Pro and Scale.' },
            { question: 'Does it check my existing store?', answer: 'No. VariantFlow checks the catalog you build or import in the workspace. It never connects to your store.' },
        ],
        cta: 'Check your catalog',
    },
    'supplier-import': {
        nav: 'Supplier import',
        title: 'Supplier CSV Import — Turn Supplier Files Into Clean Variants',
        description: 'Upload a supplier CSV and VariantFlow maps the columns, cleans messy values and builds your options, SKUs and prices. Included in Pro and Scale.',
        eyebrow: 'Supplier import',
        h1: 'Supplier CSV import:',
        h1Accent: 'from messy to ready.',
        intro: 'Supplier files are never in the format you need. Upload one and VariantFlow works out which column is which, tidies the values and builds your variants.',
        benefits: [
            { title: 'Columns matched for you', text: 'Title, SKU, price, size, color and material are recognized from their headers, in English and French. You can change any match.' },
            { title: 'Messy values cleaned', text: 'Extra spaces, underscores and stray quotes are removed. On Scale, sizes like “small” become S and capitalization is made consistent.' },
            { title: 'Your SKUs and prices kept', text: 'Each row keeps its own SKU and price. The most common price becomes the base price.' },
        ],
        steps: [
            { title: 'Upload or paste the file', text: 'A CSV with a header row. Commas and semicolons both work.' },
            { title: 'Review the mapping', text: 'Check the preview of options, variants and prices.' },
            { title: 'Import', text: 'The catalog opens in the workspace, ready to validate and export.' },
        ],
        faq: [
            { question: 'Which plans include import?', answer: 'CSV import with automatic column mapping and cleanup is in Pro. Smart mapping from column values and full normalization are in Scale.' },
            { question: 'Can I import several products in one file?', answer: 'Each import builds one product. Split a multi-product file into one file per product.' },
            { question: 'Does an import use my monthly row-runs?', answer: 'Yes. Each imported supplier row counts as one row-run, the same as each exported variant row.' },
        ],
        cta: 'Import a supplier file',
    },
};

const fr: Record<LandingKey, LandingContent> = {
    'variant-generator': {
        nav: 'Générateur de variantes',
        title: 'Générateur de variantes Shopify — Toutes vos variantes en quelques secondes',
        description: 'Générez toutes les variantes de vos produits à partir de vos options — tailles, couleurs, matières — avec SKU et prix, puis exportez un CSV prêt pour Shopify. Gratuit jusqu’à 50 variantes.',
        eyebrow: 'Générateur de variantes',
        h1: 'Générateur de variantes Shopify :',
        h1Accent: 'toutes les combinaisons, instantanément.',
        intro: 'Listez vos options une seule fois — tailles, couleurs, matières. VariantFlow construit chaque combinaison dans un tableau clair que vous pouvez relire, modifier et exporter. Sans formule, sans copier-coller.',
        benefits: [
            { title: 'Toutes les combinaisons, sans oubli', text: '3 couleurs × 4 tailles, cela fait 12 variantes. Ajoutez une matière : 24. VariantFlow les génère toutes dès que vous tapez, pour ne rien oublier.' },
            { title: 'Pensé pour les limites de Shopify', text: 'Shopify autorise jusqu’à 3 options et 2 048 variantes par produit. L’outil vous limite à trois options et affiche le nombre de variantes au fur et à mesure.' },
            { title: 'Chaque variante prête à vendre', text: 'Chaque ligne reçoit un SKU d’après votre modèle et un prix d’après vos règles. Modifiez une ligne à la main et rétablissez-la en un geste.' },
        ],
        steps: [
            { title: 'Nommez votre produit', text: 'Donnez-lui un titre et ajoutez jusqu’à trois options, comme Taille, Couleur et Matière.' },
            { title: 'Ajoutez les valeurs', text: 'Tapez S, M, L, XL — ou collez toute une liste. Les variantes apparaissent aussitôt.' },
            { title: 'Exportez', text: 'Une fois la validation réussie, téléchargez le CSV et importez-le dans Shopify.' },
        ],
        faq: [
            { question: 'Combien de variantes puis-je générer gratuitement ?', answer: 'Le forfait Gratuit génère et exporte jusqu’à 50 variantes par export. Pro et Scale n’ont aucune limite de variantes.' },
            { question: 'Combien d’options un produit peut-il avoir ?', answer: 'Jusqu’à trois, la limite de Shopify par produit. Un produit Shopify peut compter jusqu’à 2 048 variantes.' },
            { question: 'VariantFlow modifie-t-il ma boutique ?', answer: 'Non. VariantFlow ne se connecte jamais à votre boutique. Vous téléchargez un CSV et l’importez vous-même, quand vous êtes prêt.' },
        ],
        cta: 'Générer mes variantes',
    },
    'sku-generator': {
        nav: 'Générateur de SKU',
        title: 'Générateur de SKU — Des SKU cohérents pour chaque variante',
        description: 'Créez des SKU cohérents et uniques pour chaque variante à partir d’un seul modèle comme TSH-{COULEUR}-{TAILLE}. Les doublons sont signalés automatiquement. Gratuit pour commencer.',
        eyebrow: 'Générateur de SKU',
        h1: 'Générateur de SKU :',
        h1Accent: 'un modèle, toutes les variantes.',
        intro: 'Écrivez un modèle une seule fois. VariantFlow y insère les valeurs de chaque variante et vous donne des SKU propres et uniques — et vous prévient si deux se ressemblent.',
        benefits: [
            { title: 'Des modèles, pas de saisie', text: 'Écrivez TSH-{COULEUR}-{TAILLE} et obtenez TSH-NOIR-S, TSH-NOIR-M et tous les autres. Cliquez sur un nom d’option pour l’insérer.' },
            { title: 'Propres par défaut', text: 'Les SKU passent en majuscules, les espaces deviennent des tirets et les caractères non pris en charge sont retirés : chaque SKU s’importe sans accroc.' },
            { title: 'Doublons repérés tôt', text: 'Si deux variantes ont le même SKU, ou s’il en manque un, VariantFlow signale la ligne avant l’export.' },
        ],
        steps: [
            { title: 'Ajoutez vos options', text: 'Taille, Couleur, Matière — tout ce qui définit vos variantes.' },
            { title: 'Écrivez le modèle', text: 'Mélangez du texte fixe et des noms d’options entre accolades.' },
            { title: 'Vérifiez et ajustez', text: 'Modifiez n’importe quel SKU à la main. Les champs modifiés sont mis en évidence et peuvent être rétablis.' },
        ],
        faq: [
            { question: 'Qu’est-ce qu’un bon SKU ?', answer: 'Court, cohérent et lisible : un code produit suivi des valeurs d’options, toujours dans le même ordre, séparées par des tirets.' },
            { question: 'Quels caractères un SKU peut-il contenir ?', answer: 'VariantFlow conserve les lettres, les chiffres, les tirets et les tirets bas, qui s’importent de façon fiable sur toutes les plateformes.' },
            { question: 'Puis-je changer un SKU sans changer le modèle ?', answer: 'Oui. Saisissez votre valeur directement dans le tableau. Elle reste telle quelle jusqu’à ce que vous la rétablissiez.' },
        ],
        cta: 'Générer mes SKU gratuitement',
    },
    'shopify-csv': {
        nav: 'Export CSV Shopify',
        title: 'Export CSV produits Shopify — Des variantes prêtes à importer',
        description: 'Créez vos variantes et exportez un CSV au format d’import produits de Shopify, vérifié avant le téléchargement. Gratuit jusqu’à 50 variantes par export.',
        eyebrow: 'Export CSV Shopify',
        h1: 'Export CSV produits Shopify,',
        h1Accent: 'réussi du premier coup.',
        intro: 'Le CSV produits de Shopify compte des dizaines de colonnes et des règles strictes. VariantFlow les remplit correctement et vérifie chaque ligne avant le téléchargement.',
        benefits: [
            { title: 'Le format Shopify, pris en charge', text: 'Identifiant, titre, noms et valeurs d’options, SKU et prix sont écrits dans les colonnes attendues par Shopify, une ligne par variante.' },
            { title: 'Vérifié avant le téléchargement', text: 'L’export reste bloqué tant que les SKU en double, les prix manquants et les options vides ne sont pas corrigés : votre import n’échoue pas en cours de route.' },
            { title: 'Vous gardez le contrôle', text: 'VariantFlow ne touche jamais à votre boutique. Vous importez le fichier dans votre interface Shopify quand vous le décidez.' },
        ],
        steps: [
            { title: 'Créez vos variantes', text: 'Ajoutez des options, un modèle de SKU et des prix.' },
            { title: 'Corrigez ce que la validation signale', text: 'Chaque problème est expliqué clairement, avec la ligne concernée mise en évidence.' },
            { title: 'Importez dans Shopify', text: 'Dans votre interface Shopify, ouvrez Produits, choisissez Importer et envoyez le fichier.' },
        ],
        faq: [
            { question: 'Le fichier fonctionne-t-il avec l’import de Shopify ?', answer: 'Oui. L’export suit le format CSV produits de Shopify, avec une ligne par variante, regroupées sous le même identifiant.' },
            { question: 'L’import écrase-t-il mes produits existants ?', answer: 'Seulement si vous le choisissez. Lors de l’import, Shopify vous laisse décider d’écraser ou non les produits ayant le même identifiant.' },
            { question: 'Y a-t-il une limite ?', answer: 'Le forfait Gratuit exporte jusqu’à 50 variantes par fichier. Pro et Scale suppriment cette limite.' },
        ],
        cta: 'Créer mon CSV Shopify',
    },
    'woocommerce-csv': {
        nav: 'CSV WooCommerce',
        title: 'CSV de variations WooCommerce — Des produits variables sans tableur',
        description: 'Exportez vos produits variables et leurs variations dans un CSV pour l’outil d’import intégré de WooCommerce. Inclus dans le forfait Scale.',
        eyebrow: 'Export WooCommerce',
        h1: 'CSV de variations WooCommerce,',
        h1Accent: 'sans tableur.',
        intro: 'Dans WooCommerce, un produit variable demande une ligne parente et une ligne par variation, correctement reliées. VariantFlow écrit cette structure pour vous.',
        benefits: [
            { title: 'Parent et variations reliés', text: 'Le fichier contient une ligne de produit variable et une ligne de variation par variante, reliées par le SKU du parent.' },
            { title: 'Attributs renseignés', text: 'Le nom de chaque attribut et la liste complète de ses valeurs figurent sur le parent. Chaque variation porte sa valeur, son SKU et son prix.' },
            { title: 'Un catalogue, plusieurs plateformes', text: 'Créez une fois, puis exportez pour Shopify, pour WooCommerce ou en CSV universel pour toute autre plateforme.' },
        ],
        steps: [
            { title: 'Créez vos variantes', text: 'Options, SKU et prix, exactement comme pour tout autre export.' },
            { title: 'Choisissez CSV WooCommerce', text: 'Ouvrez le menu d’export et sélectionnez le format WooCommerce.' },
            { title: 'Importez dans WooCommerce', text: 'Dans WordPress, ouvrez Produits, choisissez Importer et envoyez le fichier.' },
        ],
        faq: [
            { question: 'Quel forfait inclut l’export WooCommerce ?', answer: 'Les exports CSV WooCommerce et universel font partie du forfait Scale. L’export Shopify est inclus dans tous les forfaits.' },
            { question: 'Est-ce compatible avec l’outil d’import intégré ?', answer: 'Oui. Les colonnes suivent celles de l’import CSV produits de WooCommerce : Type, SKU, Name, Parent, attributs et Regular price.' },
            { question: 'Qu’est-ce que le CSV universel ?', answer: 'Un tableur clair avec une ligne par variante — produit, options, SKU et prix — qui s’ouvre correctement dans Excel et s’importe dans la plupart des plateformes.' },
        ],
        cta: 'Créer mon catalogue',
    },
    'pricing-rules': {
        nav: 'Règles de prix',
        title: 'Règles de prix des variantes — Tarifez chaque variante automatiquement',
        description: 'Fixez un prix de base et ajoutez des règles comme « XL +2 $ ». VariantFlow tarife chaque variante automatiquement et vous laisse ajuster n’importe quelle ligne à la main.',
        eyebrow: 'Règles de prix',
        h1: 'Règles de prix des variantes :',
        h1Accent: 'réglez-les une fois.',
        intro: 'Ne retapez plus cent fois le même prix. Fixez un prix de base, ajoutez quelques ajustements, et chaque variante est correctement tarifée.',
        benefits: [
            { title: 'Un prix de base et des ajustements', text: 'Partez d’un prix, puis ajoutez ou retirez un montant quand une variante a une valeur précise — XL +2 $, Bio +3 $.' },
            { title: 'Des règles qui se cumulent', text: 'Une variante à la fois XL et Bio reçoit les deux ajustements. Le tableau se met à jour dès que vous ajoutez une règle.' },
            { title: 'Modifiez ce que vous voulez', text: 'Saisissez un autre prix sur n’importe quelle ligne. Il est mis en évidence pour le repérer, et un geste suffit à le rétablir.' },
        ],
        steps: [
            { title: 'Fixez le prix de base', text: 'Le prix que partagent la plupart de vos variantes.' },
            { title: 'Ajoutez des ajustements', text: 'Choisissez une valeur d’option et son effet sur le prix.' },
            { title: 'Vérifiez le tableau', text: 'Chaque variante affiche son prix final avant l’export.' },
        ],
        faq: [
            { question: 'Une règle peut-elle baisser le prix ?', answer: 'Oui. Saisissez un montant négatif, par exemple −1,50.' },
            { question: 'Et si deux règles s’appliquent à une même variante ?', answer: 'Les deux s’appliquent, en plus du prix de base.' },
            { question: 'VariantFlow me prévient-il des prix anormaux ?', answer: 'Les prix manquants ou négatifs bloquent l’export. Avec Pro et Scale, la validation avancée signale aussi les prix à zéro et ceux très éloignés des autres.' },
        ],
        cta: 'Tarifer mes variantes',
    },
    validation: {
        nav: 'Validation du catalogue',
        title: 'Validation de catalogue produits — Repérez les erreurs avant l’import',
        description: 'VariantFlow vérifie chaque variante — SKU en double, prix manquants, options vides — avant l’export, pour que votre import de produits réussisse du premier coup.',
        eyebrow: 'Validation du catalogue',
        h1: 'Validation de catalogue produits :',
        h1Accent: 'importez en toute confiance.',
        intro: 'Un import raté, c’est un après-midi perdu. VariantFlow vérifie votre catalogue pendant que vous le construisez et n’exporte pas un fichier qui n’est pas prêt.',
        benefits: [
            { title: 'Vérifié pendant la saisie', text: 'SKU en double, caractères invalides, prix manquants ou négatifs, options vides et valeurs répétées sont signalés dès qu’ils apparaissent.' },
            { title: 'Des problèmes expliqués clairement', text: 'Chaque problème est décrit en des termes sur lesquels on peut agir, et les lignes concernées sont mises en évidence dans le tableau.' },
            { title: 'Des contrôles avancés avec Pro', text: 'Prix à zéro, prix très éloignés des autres, espaces superflus, casse incohérente, SKU trop longs et limite de 2 048 variantes de Shopify.' },
        ],
        steps: [
            { title: 'Créez ou importez votre catalogue', text: 'La validation démarre aussitôt.' },
            { title: 'Ouvrez la liste des problèmes', text: 'Voyez précisément ce qui ne va pas, et où.' },
            { title: 'Exportez quand c’est prêt', text: 'Le fichier se télécharge dès que toutes les erreurs sont corrigées.' },
        ],
        faq: [
            { question: 'Qu’est-ce qui bloque un export ?', answer: 'Les erreurs : SKU en double ou invalides, prix manquants ou négatifs, titre manquant et options vides. Les suggestions de la validation avancée ne bloquent jamais.' },
            { question: 'La validation est-elle incluse dans le forfait Gratuit ?', answer: 'Oui. La validation de base est incluse dans tous les forfaits. La validation avancée fait partie de Pro et Scale.' },
            { question: 'Vérifie-t-elle ma boutique existante ?', answer: 'Non. VariantFlow vérifie le catalogue que vous créez ou importez dans l’espace de travail. Il ne se connecte jamais à votre boutique.' },
        ],
        cta: 'Vérifier mon catalogue',
    },
    'supplier-import': {
        nav: 'Import fournisseur',
        title: 'Import CSV fournisseur — Transformez vos fichiers fournisseurs en variantes propres',
        description: 'Importez un CSV fournisseur : VariantFlow associe les colonnes, nettoie les valeurs et construit vos options, SKU et prix. Inclus dans Pro et Scale.',
        eyebrow: 'Import fournisseur',
        h1: 'Import CSV fournisseur :',
        h1Accent: 'du brouillon au prêt à vendre.',
        intro: 'Les fichiers fournisseurs ne sont jamais au format qu’il vous faut. Importez-en un : VariantFlow identifie chaque colonne, met de l’ordre dans les valeurs et construit vos variantes.',
        benefits: [
            { title: 'Les colonnes associées pour vous', text: 'Titre, SKU, prix, taille, couleur et matière sont reconnus d’après leurs en-têtes, en français et en anglais. Vous pouvez modifier chaque association.' },
            { title: 'Les valeurs nettoyées', text: 'Espaces superflus, tirets bas et guillemets parasites sont retirés. Avec Scale, « small » devient S et la casse est harmonisée.' },
            { title: 'Vos SKU et vos prix conservés', text: 'Chaque ligne garde son SKU et son prix. Le prix le plus fréquent devient le prix de base.' },
        ],
        steps: [
            { title: 'Importez ou collez le fichier', text: 'Un CSV avec une ligne d’en-tête. Virgules et points-virgules fonctionnent.' },
            { title: 'Vérifiez les correspondances', text: 'Consultez l’aperçu des options, des variantes et des prix.' },
            { title: 'Importez', text: 'Le catalogue s’ouvre dans l’espace de travail, prêt à être validé et exporté.' },
        ],
        faq: [
            { question: 'Quels forfaits incluent l’import ?', answer: 'L’import CSV avec mappage automatique des colonnes et nettoyage est inclus dans Pro. Le mappage intelligent d’après les valeurs et la normalisation complète sont dans Scale.' },
            { question: 'Puis-je importer plusieurs produits dans un seul fichier ?', answer: 'Chaque import construit un produit. Séparez un fichier multi-produits en un fichier par produit.' },
            { question: 'Un import consomme-t-il mes lignes traitées du mois ?', answer: 'Oui. Chaque ligne fournisseur importée compte pour une ligne traitée, comme chaque ligne de variante exportée.' },
        ],
        cta: 'Importer un fichier fournisseur',
    },
};

const content: Record<Locale, Record<LandingKey, LandingContent>> = { en, fr };

export const getLanding = (locale: Locale, key: LandingKey) => content[locale][key];
