import { InternalVariant, OptionGroup, ValidationCode, ValidationError, ValidationErrorSeverity } from '../../types';

interface ProductValidationInput {
  productTitle: string;
  options: OptionGroup[];
  variants: InternalVariant[];
}

interface ValidationOptions {
  /** Extra quality checks included in Pro and Scale. They produce warnings and never block export. */
  advanced?: boolean;
}

// Shopify's current per-product limits.
const SHOPIFY_MAX_VARIANTS = 2048;
const SHOPIFY_MAX_TITLE = 255;
const RECOMMENDED_MAX_SKU = 64;

const isValidSku = (value: string): boolean => /^[A-Za-z0-9_-]+$/.test(value.trim());

const ENGLISH: Record<ValidationCode, (p: Record<string, string | number>) => string> = {
  'title-missing': () => 'Product title is required before export.',
  'option-name-empty': (p) => `Option ${p.index} is missing a name.`,
  'option-name-duplicate': (p) => `Option name "${p.name}" appears more than once.`,
  'option-values-empty': (p) => `Option "${p.name}" has no valid values.`,
  'option-value-duplicate': (p) => `Option "${p.name}" contains duplicate value "${p.value}".`,
  'variant-duplicate': () => 'Duplicate variant combination detected.',
  'variant-missing-values': (p) => `Variant is missing values for: ${p.names}`,
  'variant-unexpected-options': (p) => `Variant contains unexpected option names: ${p.names}`,
  'sku-missing': () => 'SKU is missing for this variant.',
  'sku-invalid': (p) => `SKU "${p.sku}" contains invalid characters. Use letters, numbers, hyphen, or underscore only.`,
  'sku-duplicate': (p) => `Duplicate SKU detected: ${p.sku}.`,
  'price-invalid': () => 'Price is missing or invalid.',
  'price-negative': () => 'Price cannot be negative.',
  'title-too-long': (p) => `Product title is longer than Shopify's ${p.max}-character limit.`,
  'value-whitespace': (p) => `Value "${p.value}" in "${p.name}" has extra spaces.`,
  'value-casing': (p) => `Values in "${p.name}" use inconsistent capitalization.`,
  'sku-too-long': (p) => `SKU "${p.sku}" is longer than ${p.max} characters, which some marketplaces reject.`,
  'price-zero': (p) => `${p.count} variant(s) have a price of 0.`,
  'price-outlier': (p) => `Price ${p.price} for ${p.variant} is far from the typical price of ${p.median}.`,
  'shopify-variant-limit': (p) => `Shopify allows up to ${p.max} variants per product; this catalog has ${p.count}.`,
};

export function validateProductData({ productTitle, options, variants }: ProductValidationInput, { advanced = false }: ValidationOptions = {}): ValidationError[] {
  const errors: ValidationError[] = [];

  const add = (
    code: ValidationCode,
    id: string,
    field: ValidationError['field'],
    params: Record<string, string | number> = {},
    extra: { rowId?: string; severity?: ValidationErrorSeverity } = {},
  ) => {
    errors.push({ id, code, field, params, rowId: extra.rowId, severity: extra.severity ?? 'error', message: ENGLISH[code](params) });
  };

  if (!productTitle.trim()) add('title-missing', 'product-title-missing', 'title');

  const seenOptionNames = new Map<string, number>();

  options.forEach((option, index) => {
    const safeName = option.name.trim();

    if (!safeName) {
      add('option-name-empty', `option-name-empty-${index}`, 'option-name', { index: index + 1 });
      return;
    }

    if (seenOptionNames.has(safeName.toLowerCase())) {
      add('option-name-duplicate', `option-name-duplicate-${safeName}`, 'option-name', { name: safeName });
    }
    seenOptionNames.set(safeName.toLowerCase(), index);

    const cleanValues = option.values.map((value) => value.trim()).filter(Boolean);
    if (cleanValues.length === 0) {
      add('option-values-empty', `option-values-empty-${option.id}`, 'option-value', { name: safeName });
      return;
    }

    const duplicateValues = new Set<string>();
    cleanValues.forEach((value) => {
      const key = value.toLowerCase();
      if (duplicateValues.has(key)) {
        add('option-value-duplicate', `option-value-duplicate-${option.id}-${value}`, 'option-value', { name: safeName, value });
      }
      duplicateValues.add(key);
    });

    if (advanced) {
      option.values.forEach((value) => {
        if (value.trim() && (value !== value.trim() || /\s{2,}/.test(value))) {
          add('value-whitespace', `value-whitespace-${option.id}-${value}`, 'option-value', { name: safeName, value: value.trim() }, { severity: 'warning' });
        }
      });
      const letterValues = cleanValues.filter((value) => /^[a-zA-Z]/.test(value) && value.length > 2);
      const styles = new Set(letterValues.map((value) => (value === value.toUpperCase() ? 'upper' : value === value.toLowerCase() ? 'lower' : 'mixed')));
      if (styles.size > 1) {
        add('value-casing', `value-casing-${option.id}`, 'option-value', { name: safeName }, { severity: 'warning' });
      }
    }
  });

  const expectedOptionNames = options.map((option) => option.name.trim()).filter(Boolean);
  const seenVariantKeys = new Set<string>();
  const seenSkuValues = new Map<string, string>();

  variants.forEach((variant) => {
    const variantKey = Object.entries(variant.attributes)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}:${String(value).trim()}`)
      .join('|');

    if (seenVariantKeys.has(variantKey)) {
      add('variant-duplicate', `duplicate-variant-${variant.id}`, 'structure', {}, { rowId: variant.id });
    }
    seenVariantKeys.add(variantKey);

    const missingAttributes = expectedOptionNames.filter(
      (optionName) => !variant.attributes[optionName] || !String(variant.attributes[optionName]).trim(),
    );
    if (missingAttributes.length > 0) {
      add('variant-missing-values', `missing-variant-attrs-${variant.id}`, 'structure', { names: missingAttributes.join(', ') }, { rowId: variant.id });
    }

    const extraAttributes = Object.keys(variant.attributes).filter((attributeName) => !expectedOptionNames.includes(attributeName));
    if (extraAttributes.length > 0) {
      add('variant-unexpected-options', `unexpected-variant-attrs-${variant.id}`, 'structure', { names: extraAttributes.join(', ') }, { rowId: variant.id });
    }

    if (!variant.sku || !variant.sku.trim()) {
      add('sku-missing', `missing-sku-${variant.id}`, 'sku', {}, { rowId: variant.id });
    } else if (!isValidSku(variant.sku)) {
      add('sku-invalid', `invalid-sku-${variant.id}`, 'sku', { sku: variant.sku }, { rowId: variant.id });
    } else if (advanced && variant.sku.trim().length > RECOMMENDED_MAX_SKU) {
      add('sku-too-long', `sku-too-long-${variant.id}`, 'sku', { sku: variant.sku, max: RECOMMENDED_MAX_SKU }, { rowId: variant.id, severity: 'warning' });
    }

    const normalizedSku = (variant.sku ?? '').trim();
    if (normalizedSku) {
      const existingSkuRowId = seenSkuValues.get(normalizedSku.toUpperCase());
      if (existingSkuRowId && existingSkuRowId !== variant.id) {
        add('sku-duplicate', `duplicate-sku-${variant.id}`, 'sku', { sku: normalizedSku }, { rowId: variant.id });
      }
      seenSkuValues.set(normalizedSku.toUpperCase(), variant.id);
    }

    if (typeof variant.price !== 'number' || Number.isNaN(variant.price)) {
      add('price-invalid', `invalid-price-${variant.id}`, 'price', {}, { rowId: variant.id });
    } else if (variant.price < 0) {
      add('price-negative', `negative-price-${variant.id}`, 'price', {}, { rowId: variant.id });
    }
  });

  if (advanced) {
    if (productTitle.trim().length > SHOPIFY_MAX_TITLE) {
      add('title-too-long', 'title-too-long', 'title', { max: SHOPIFY_MAX_TITLE }, { severity: 'warning' });
    }

    if (variants.length > SHOPIFY_MAX_VARIANTS) {
      add('shopify-variant-limit', 'shopify-variant-limit', 'structure', { max: SHOPIFY_MAX_VARIANTS, count: variants.length }, { severity: 'warning' });
    }

    const zeroPriced = variants.filter((variant) => variant.price === 0);
    if (zeroPriced.length > 0) {
      add('price-zero', 'price-zero', 'price', { count: zeroPriced.length }, { severity: 'warning' });
    }

    const positive = variants.map((variant) => variant.price).filter((price) => price > 0).sort((a, b) => a - b);
    if (positive.length >= 4) {
      const median = positive[Math.floor(positive.length / 2)];
      variants.forEach((variant) => {
        if (variant.price > 0 && (variant.price > median * 5 || variant.price < median / 5)) {
          add('price-outlier', `price-outlier-${variant.id}`, 'price', {
            price: variant.price.toFixed(2),
            median: median.toFixed(2),
            variant: Object.values(variant.attributes).join(' / '),
          }, { rowId: variant.id, severity: 'warning' });
        }
      });
    }
  }

  return errors;
}

export const blockingIssues = (issues: ValidationError[]) => issues.filter((issue) => issue.severity === 'error');
