import { AttributeMap } from '../../types';

export function computeSkuFromTemplate(pattern: string, attributes: AttributeMap): string {
    let sku = pattern;

    Object.entries(attributes).forEach(([optionName, optionValue]) => {
        const tokenRegex = new RegExp(`\\{${optionName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\}`, 'gi');
        sku = sku.replace(tokenRegex, optionValue.trim());
    });

    return sku
        .replace(/\{([^}]+)\}/g, '')
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9\-_]/g, '');
}
