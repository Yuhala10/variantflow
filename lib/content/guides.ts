import type { Locale } from '../i18n/config';
import type { GuideKey, LandingKey } from '../i18n/routes';

export interface GuideSection {
    heading: string;
    paragraphs?: string[];
    list?: { ordered?: boolean; items: string[] };
}

export interface GuideContent {
    title: string;
    description: string;
    intro: string;
    minutes: number;
    sections: GuideSection[];
    /** The product page this guide leads to */
    related: LandingKey;
}

/** ISO dates shown on the page and in Article structured data. Update when a guide changes. */
export const GUIDE_DATES: Record<GuideKey, { published: string; modified: string }> = {
    'shopify-csv-variants': { published: '2026-10-04', modified: '2026-10-04' },
    'sku-naming': { published: '2026-10-04', modified: '2026-10-04' },
    'shopify-variant-limits': { published: '2026-10-04', modified: '2026-10-04' },
};

const en: Record<GuideKey, GuideContent> = {
    'shopify-csv-variants': {
        title: 'How to create a Shopify product CSV with variants',
        description: 'A practical guide to Shopify’s product CSV: how variants are structured, which columns matter, the limits to know and the mistakes that make imports fail.',
        intro: 'Importing products by CSV is the fastest way to add many variants to Shopify — if the file is structured correctly. Here is how the format works and how to avoid the errors that stop imports.',
        minutes: 5,
        related: 'shopify-csv',
        sections: [
            {
                heading: 'How Shopify structures variants in a CSV',
                paragraphs: [
                    'In a Shopify product CSV, every variant is its own row. Rows that share the same URL handle belong to the same product.',
                    'The first row of a product carries the product details, such as the title. The rows that follow only need the handle and the details that change from one variant to the next: option values, SKU and price.',
                ],
            },
            {
                heading: 'The columns that matter for variants',
                list: {
                    items: [
                        'URL handle — the product’s unique identifier in the file. Every row of the same product uses the same handle.',
                        'Title — required on the first row of each new product.',
                        'Option1 name and Option1 value — for example Size and M. Option2 and Option3 work the same way.',
                        'SKU — the stock code for that variant.',
                        'Price — the variant’s price, as a number.',
                    ],
                },
                paragraphs: [
                    'Shopify renamed several columns in its current template. Older files use Handle, Option1 Name, Variant SKU and Variant Price. Shopify still accepts the older names, so files in either style import correctly.',
                ],
            },
            {
                heading: 'Limits to keep in mind',
                list: {
                    items: [
                        'A product can have up to three options.',
                        'A product can have up to 2,048 variants.',
                        'The file must be saved in UTF-8, otherwise accented characters can break.',
                    ],
                },
            },
            {
                heading: 'Mistakes that make imports fail',
                list: {
                    items: [
                        'Option names that change between rows of the same product, such as Size on one row and Sizes on another.',
                        'Option values missing on some rows.',
                        'Two rows with the same combination of option values.',
                        'The same SKU used on more than one variant.',
                        'Currency symbols or text in the price column.',
                    ],
                },
            },
            {
                heading: 'A faster way to build the file',
                paragraphs: [
                    'Building this file by hand means repeating the handle, keeping option names identical and writing a SKU and a price on every row. For 3 colors and 4 sizes that is 12 rows. Add a material and it is 24.',
                    'VariantFlow generates every row from your options, applies a SKU pattern and pricing rules, checks the result and exports the CSV. The Free plan covers up to 50 variants per export.',
                ],
            },
        ],
    },
    'sku-naming': {
        title: 'SKU naming: a practical guide for product variants',
        description: 'How to design SKUs that stay readable and unique as your catalog grows: structure, separators, what to avoid, and patterns you can copy.',
        intro: 'A SKU is the code that identifies exactly one sellable item. Good SKUs make picking, restocking and reporting easier. Bad ones cause mix-ups that cost real money. A few simple rules make the difference.',
        minutes: 4,
        related: 'sku-generator',
        sections: [
            {
                heading: 'Start with a structure',
                paragraphs: [
                    'The most reliable SKUs follow the same order every time: a short product code, then the option values from the most general to the most specific.',
                    'For a t-shirt, that could be TSH-BLACK-M: product, color, size. Anyone on your team can read it without looking anything up.',
                ],
            },
            {
                heading: 'Rules that keep SKUs clean',
                list: {
                    items: [
                        'Keep them short. Eight to sixteen characters is easy to read and to type.',
                        'Use capital letters and numbers, with hyphens as separators.',
                        'Avoid spaces, accents and special characters, which some systems change or reject.',
                        'Do not start a SKU with a zero. Spreadsheets often drop leading zeros.',
                        'In short codes, avoid letters that look like numbers, such as O and I.',
                        'Never reuse a SKU, even for a product you stopped selling.',
                    ],
                },
            },
            {
                heading: 'Use the same order everywhere',
                paragraphs: [
                    'Decide the order once — product, then color, then size, for example — and apply it to every product. Consistency matters more than the exact scheme you choose.',
                ],
            },
            {
                heading: 'Patterns you can copy',
                list: {
                    items: [
                        'Clothing: TSH-{COLOR}-{SIZE} gives TSH-BLACK-M.',
                        'Shoes: SNK-{MODEL}-{COLOR}-{SIZE} gives SNK-AIR-WHITE-42.',
                        'With a material: BAG-{MATERIAL}-{COLOR} gives BAG-LEATHER-TAN.',
                    ],
                },
            },
            {
                heading: 'Generate them instead of typing them',
                paragraphs: [
                    'Typing SKUs by hand is where duplicates and typos come from. In VariantFlow you write the pattern once and every variant gets its SKU. Two variants with the same SKU are flagged before you export.',
                ],
            },
        ],
    },
    'shopify-variant-limits': {
        title: 'Shopify variant limits explained: options, variants and what to do',
        description: 'Shopify allows up to 3 options and 2,048 variants per product. Here is what that means, how to count your variants and what to do when you need more.',
        intro: 'Every Shopify product has two limits that shape how you build your catalog: the number of options and the number of variants. Knowing them before you start saves rework.',
        minutes: 4,
        related: 'variant-generator',
        sections: [
            {
                heading: 'The two limits',
                list: {
                    items: [
                        'Options: a product can have up to three, such as Size, Color and Material.',
                        'Variants: a product can have up to 2,048 combinations of those options.',
                    ],
                },
                paragraphs: ['For years the variant limit was 100 per product. Shopify raised it to 2,048, which covers most catalogs.'],
            },
            {
                heading: 'How to count your variants',
                paragraphs: [
                    'Multiply the number of values in each option. 4 sizes × 6 colors is 24 variants. Add 3 materials and it becomes 72.',
                    'The numbers grow quickly: 12 sizes × 15 colors × 12 materials is 2,160 variants, just over the limit.',
                ],
            },
            {
                heading: 'When you need more than three options',
                list: {
                    items: [
                        'Combine two options into one, such as “Black / Cotton”.',
                        'Split the product into several products, for example one per material.',
                        'Use an app from the Shopify App Store, or line item properties in your theme, to collect extra choices that do not need their own stock.',
                    ],
                },
            },
            {
                heading: 'When you would exceed 2,048 variants',
                paragraphs: [
                    'Ask whether every combination is really sold. Removing values nobody buys is often enough. Otherwise, split the product along its biggest option.',
                ],
            },
            {
                heading: 'Check before you import',
                paragraphs: [
                    'VariantFlow limits a product to three options and shows the variant count as you build. On Pro and Scale, advanced validation tells you when a catalog passes 2,048 variants, before Shopify does.',
                ],
            },
        ],
    },
};

const fr: Record<GuideKey, GuideContent> = {
    'shopify-csv-variants': {
        title: 'Comment créer un CSV produits Shopify avec des variantes',
        description: 'Un guide pratique du CSV produits de Shopify : la structure des variantes, les colonnes qui comptent, les limites à connaître et les erreurs qui font échouer les imports.',
        intro: 'L’import par CSV est le moyen le plus rapide d’ajouter de nombreuses variantes à Shopify — à condition que le fichier soit bien structuré. Voici comment fonctionne le format et comment éviter les erreurs qui bloquent les imports.',
        minutes: 5,
        related: 'shopify-csv',
        sections: [
            {
                heading: 'Comment Shopify structure les variantes dans un CSV',
                paragraphs: [
                    'Dans un CSV produits Shopify, chaque variante occupe sa propre ligne. Les lignes qui partagent le même identifiant d’URL (URL handle) appartiennent au même produit.',
                    'La première ligne d’un produit porte ses informations générales, comme le titre. Les lignes suivantes n’ont besoin que de l’identifiant et de ce qui change d’une variante à l’autre : valeurs d’options, SKU et prix.',
                ],
            },
            {
                heading: 'Les colonnes qui comptent pour les variantes',
                list: {
                    items: [
                        'URL handle — l’identifiant unique du produit dans le fichier. Toutes les lignes d’un même produit utilisent le même.',
                        'Title — obligatoire sur la première ligne de chaque nouveau produit.',
                        'Option1 name et Option1 value — par exemple Taille et M. Option2 et Option3 fonctionnent de la même façon.',
                        'SKU — la référence de stock de la variante.',
                        'Price — le prix de la variante, sous forme de nombre.',
                    ],
                },
                paragraphs: [
                    'Shopify a renommé plusieurs colonnes dans son modèle actuel. Les anciens fichiers utilisent Handle, Option1 Name, Variant SKU et Variant Price. Shopify accepte toujours les anciens noms : les deux styles de fichiers s’importent correctement.',
                ],
            },
            {
                heading: 'Les limites à garder en tête',
                list: {
                    items: [
                        'Un produit peut avoir jusqu’à trois options.',
                        'Un produit peut avoir jusqu’à 2 048 variantes.',
                        'Le fichier doit être enregistré en UTF-8, sinon les caractères accentués risquent d’être abîmés.',
                    ],
                },
            },
            {
                heading: 'Les erreurs qui font échouer les imports',
                list: {
                    items: [
                        'Des noms d’options qui changent d’une ligne à l’autre pour un même produit, comme Taille sur une ligne et Tailles sur une autre.',
                        'Des valeurs d’options manquantes sur certaines lignes.',
                        'Deux lignes avec la même combinaison de valeurs d’options.',
                        'Le même SKU utilisé pour plusieurs variantes.',
                        'Des symboles monétaires ou du texte dans la colonne du prix.',
                    ],
                },
            },
            {
                heading: 'Une façon plus rapide de créer le fichier',
                paragraphs: [
                    'Construire ce fichier à la main, c’est répéter l’identifiant, garder des noms d’options identiques et écrire un SKU et un prix sur chaque ligne. Pour 3 couleurs et 4 tailles, cela fait 12 lignes. Ajoutez une matière : 24.',
                    'VariantFlow génère chaque ligne à partir de vos options, applique un modèle de SKU et des règles de prix, vérifie le résultat et exporte le CSV. Le forfait Gratuit couvre jusqu’à 50 variantes par export.',
                ],
            },
        ],
    },
    'sku-naming': {
        title: 'Bien nommer ses SKU : guide pratique pour les variantes produit',
        description: 'Comment concevoir des SKU qui restent lisibles et uniques quand votre catalogue grandit : structure, séparateurs, pièges à éviter et modèles à copier.',
        intro: 'Un SKU est le code qui identifie exactement un article vendable. De bons SKU facilitent la préparation des commandes, le réassort et le suivi. De mauvais SKU provoquent des confusions qui coûtent cher. Quelques règles simples font la différence.',
        minutes: 4,
        related: 'sku-generator',
        sections: [
            {
                heading: 'Commencez par une structure',
                paragraphs: [
                    'Les SKU les plus fiables suivent toujours le même ordre : un code produit court, puis les valeurs d’options, de la plus générale à la plus précise.',
                    'Pour un t-shirt, cela peut donner TSH-NOIR-M : produit, couleur, taille. Toute votre équipe peut le lire sans rien chercher.',
                ],
            },
            {
                heading: 'Les règles qui gardent vos SKU propres',
                list: {
                    items: [
                        'Faites court. De huit à seize caractères, c’est facile à lire et à saisir.',
                        'Utilisez des majuscules et des chiffres, avec des tirets comme séparateurs.',
                        'Évitez les espaces, les accents et les caractères spéciaux, que certains systèmes modifient ou refusent.',
                        'Ne commencez pas un SKU par un zéro. Les tableurs suppriment souvent les zéros en tête.',
                        'Dans les codes courts, évitez les lettres qui ressemblent à des chiffres, comme O et I.',
                        'Ne réutilisez jamais un SKU, même pour un produit que vous ne vendez plus.',
                    ],
                },
            },
            {
                heading: 'Gardez le même ordre partout',
                paragraphs: [
                    'Choisissez l’ordre une fois pour toutes — produit, puis couleur, puis taille, par exemple — et appliquez-le à tous vos produits. La cohérence compte davantage que le système choisi.',
                ],
            },
            {
                heading: 'Des modèles à copier',
                list: {
                    items: [
                        'Vêtements : TSH-{COULEUR}-{TAILLE} donne TSH-NOIR-M.',
                        'Chaussures : SNK-{MODELE}-{COULEUR}-{POINTURE} donne SNK-AIR-BLANC-42.',
                        'Avec une matière : SAC-{MATIERE}-{COULEUR} donne SAC-CUIR-CAMEL.',
                    ],
                },
            },
            {
                heading: 'Générez-les au lieu de les saisir',
                paragraphs: [
                    'C’est la saisie manuelle qui crée les doublons et les fautes de frappe. Dans VariantFlow, vous écrivez le modèle une fois et chaque variante reçoit son SKU. Deux variantes avec le même SKU sont signalées avant l’export.',
                ],
            },
        ],
    },
    'shopify-variant-limits': {
        title: 'Les limites de variantes Shopify : options, variantes et solutions',
        description: 'Shopify autorise jusqu’à 3 options et 2 048 variantes par produit. Voici ce que cela signifie, comment compter vos variantes et que faire s’il vous en faut davantage.',
        intro: 'Chaque produit Shopify est soumis à deux limites qui déterminent la façon de construire votre catalogue : le nombre d’options et le nombre de variantes. Les connaître avant de commencer évite de tout refaire.',
        minutes: 4,
        related: 'variant-generator',
        sections: [
            {
                heading: 'Les deux limites',
                list: {
                    items: [
                        'Options : un produit peut en avoir jusqu’à trois, comme Taille, Couleur et Matière.',
                        'Variantes : un produit peut compter jusqu’à 2 048 combinaisons de ces options.',
                    ],
                },
                paragraphs: ['Pendant des années, la limite était de 100 variantes par produit. Shopify l’a portée à 2 048, ce qui couvre la plupart des catalogues.'],
            },
            {
                heading: 'Comment compter vos variantes',
                paragraphs: [
                    'Multipliez le nombre de valeurs de chaque option. 4 tailles × 6 couleurs donnent 24 variantes. Ajoutez 3 matières : 72.',
                    'Les chiffres montent vite : 12 tailles × 15 couleurs × 12 matières donnent 2 160 variantes, juste au-dessus de la limite.',
                ],
            },
            {
                heading: 'S’il vous faut plus de trois options',
                list: {
                    items: [
                        'Regroupez deux options en une seule, comme « Noir / Coton ».',
                        'Séparez le produit en plusieurs produits, par exemple un par matière.',
                        'Utilisez une application du Shopify App Store, ou les propriétés d’article de votre thème, pour recueillir des choix supplémentaires qui n’ont pas besoin de leur propre stock.',
                    ],
                },
            },
            {
                heading: 'Si vous dépassez 2 048 variantes',
                paragraphs: [
                    'Demandez-vous si chaque combinaison est réellement vendue. Retirer les valeurs que personne n’achète suffit souvent. Sinon, séparez le produit selon son option la plus fournie.',
                ],
            },
            {
                heading: 'Vérifiez avant d’importer',
                paragraphs: [
                    'VariantFlow limite un produit à trois options et affiche le nombre de variantes pendant que vous construisez. Avec Pro et Scale, la validation avancée vous prévient quand un catalogue dépasse 2 048 variantes, avant que Shopify ne le fasse.',
                ],
            },
        ],
    },
};

const content: Record<Locale, Record<GuideKey, GuideContent>> = { en, fr };

export const getGuide = (locale: Locale, key: GuideKey) => content[locale][key];
