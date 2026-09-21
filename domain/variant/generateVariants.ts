import { AttributeMap, OptionGroup } from '../../types';

const normalizeVariantValue = (value: string): string => value.trim();

export function generateVariantId(attributes: AttributeMap): string {
  return Object.entries(attributes)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}:${normalizeVariantValue(String(value))}`)
    .join('|');
}

export function generateCartesianMatrix(options: OptionGroup[]): AttributeMap[] {
  const validGroups = (options ?? [])
    .filter((option) => option && typeof option.name === 'string' && option.name.trim() !== '')
    .map((option) => ({
      ...option,
      name: option.name.trim(),
      values: [...new Set((option.values ?? []).map((value) => String(value).trim()).filter(Boolean))],
    }))
    .filter((option) => option.values.length > 0);

  if (validGroups.length === 0) {
    return [];
  }

  let combinations: AttributeMap[] = [{}];

  validGroups.forEach((group) => {
    const nextLayer: AttributeMap[] = [];

    group.values.forEach((value) => {
      combinations.forEach((existing) => {
        nextLayer.push({
          ...existing,
          [group.name]: value,
        });
      });
    });

    combinations = nextLayer;
  });

  return combinations;
}
