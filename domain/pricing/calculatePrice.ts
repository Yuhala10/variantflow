import { AttributeMap, PriceModifierRule } from '../../types';

export function computeVariantPrice(basePrice: number, rules: PriceModifierRule[], attributes: AttributeMap): number {
    let calculatedPrice = basePrice;
    const attributeValuesSet = new Set(Object.values(attributes).map(val => val.toLowerCase().trim()));

    rules.forEach(rule => {
        const cleanTarget = rule.targetValue.toLowerCase().trim();
        if (cleanTarget && attributeValuesSet.has(cleanTarget)) {
            calculatedPrice += rule.modifier;
        }
    });

    return parseFloat(calculatedPrice.toFixed(2));
}
