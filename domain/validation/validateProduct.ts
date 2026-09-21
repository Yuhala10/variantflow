import { InternalVariant, OptionGroup, ValidationError } from '../../types';

interface ProductValidationInput {
  productTitle: string;
  options: OptionGroup[];
  variants: InternalVariant[];
}

const isValidSku = (value: string): boolean => /^[A-Za-z0-9_-]+$/.test(value.trim());

export function validateProductData({ productTitle, options, variants }: ProductValidationInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!productTitle.trim()) {
    errors.push({
      id: 'product-title-missing',
      field: 'title',
      severity: 'error',
      message: 'Product title is required before export.',
    });
  }

  const seenOptionNames = new Map<string, number>();

  options.forEach((option, index) => {
    const safeName = option.name.trim();

    if (!safeName) {
      errors.push({
        id: `option-name-empty-${index}`,
        field: 'option-name',
        severity: 'error',
        message: `Option ${index + 1} is missing a name.`,
      });
      return;
    }

    const seenIndex = seenOptionNames.get(safeName.toLowerCase());
    if (seenIndex !== undefined) {
      errors.push({
        id: `option-name-duplicate-${safeName}`,
        field: 'option-name',
        severity: 'error',
        message: `Option name "${safeName}" appears more than once.`,
      });
    }
    seenOptionNames.set(safeName.toLowerCase(), index);

    const cleanValues = option.values.map((value) => value.trim()).filter(Boolean);
    if (cleanValues.length === 0) {
      errors.push({
        id: `option-values-empty-${option.id}`,
        field: 'option-value',
        severity: 'error',
        message: `Option "${safeName}" has no valid values.`,
      });
      return;
    }

    const duplicateValues = new Set<string>();
    cleanValues.forEach((value) => {
      const key = value.toLowerCase();
      if (duplicateValues.has(key)) {
        errors.push({
          id: `option-value-duplicate-${option.id}-${value}`,
          field: 'option-value',
          severity: 'error',
          message: `Option "${safeName}" contains duplicate value "${value}".`,
        });
      }
      duplicateValues.add(key);
    });
  });

  const expectedOptionNames = options
    .map((option) => option.name.trim())
    .filter(Boolean);

  const seenVariantKeys = new Set<string>();
  const seenSkuValues = new Map<string, string>();

  variants.forEach((variant) => {
    const variantKey = Object.entries(variant.attributes)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, value]) => `${key}:${String(value).trim()}`)
      .join('|');

    if (seenVariantKeys.has(variantKey)) {
      errors.push({
        id: `duplicate-variant-${variant.id}`,
        rowId: variant.id,
        field: 'structure',
        severity: 'error',
        message: 'Duplicate variant combination detected.',
      });
    }
    seenVariantKeys.add(variantKey);

    const missingAttributes = expectedOptionNames.filter(
      (optionName) => !variant.attributes[optionName] || !String(variant.attributes[optionName]).trim(),
    );
    if (missingAttributes.length > 0) {
      errors.push({
        id: `missing-variant-attrs-${variant.id}`,
        rowId: variant.id,
        field: 'structure',
        severity: 'error',
        message: `Variant is missing values for: ${missingAttributes.join(', ')}`,
      });
    }

    const extraAttributes = Object.keys(variant.attributes).filter(
      (attributeName) => !expectedOptionNames.includes(attributeName),
    );
    if (extraAttributes.length > 0) {
      errors.push({
        id: `unexpected-variant-attrs-${variant.id}`,
        rowId: variant.id,
        field: 'structure',
        severity: 'error',
        message: `Variant contains unexpected option names: ${extraAttributes.join(', ')}`,
      });
    }

    if (!variant.sku || !variant.sku.trim()) {
      errors.push({
        id: `missing-sku-${variant.id}`,
        rowId: variant.id,
        field: 'sku',
        severity: 'error',
        message: 'SKU is missing for this variant.',
      });
    } else if (!isValidSku(variant.sku)) {
      errors.push({
        id: `invalid-sku-${variant.id}`,
        rowId: variant.id,
        field: 'sku',
        severity: 'error',
        message: `SKU "${variant.sku}" contains invalid characters. Use letters, numbers, hyphen, or underscore only.`,
      });
    }

    const normalizedSku = variant.sku.trim();
    if (normalizedSku) {
      const existingSkuRowId = seenSkuValues.get(normalizedSku.toUpperCase());
      if (existingSkuRowId && existingSkuRowId !== variant.id) {
        errors.push({
          id: `duplicate-sku-${variant.id}`,
          rowId: variant.id,
          field: 'sku',
          severity: 'error',
          message: `Duplicate SKU detected: ${normalizedSku}.`,
        });
      }
      seenSkuValues.set(normalizedSku.toUpperCase(), variant.id);
    }

    if (typeof variant.price !== 'number' || Number.isNaN(variant.price)) {
      errors.push({
        id: `invalid-price-${variant.id}`,
        rowId: variant.id,
        field: 'price',
        severity: 'error',
        message: 'Price is missing or invalid.',
      });
    } else if (variant.price < 0) {
      errors.push({
        id: `negative-price-${variant.id}`,
        rowId: variant.id,
        field: 'price',
        severity: 'error',
        message: 'Price cannot be negative.',
      });
    }
  });

  return errors;
}
