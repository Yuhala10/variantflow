import { describe, expect, it } from 'vitest';
import { computeSkuFromTemplate } from '../domain/sku/generateSku';
import { computeVariantPrice } from '../domain/pricing/calculatePrice';
import { parseDecimal, isPartialDecimal } from '../lib/number';

describe('computeSkuFromTemplate', () => {
    it('replaces tokens case-insensitively and uppercases', () => {
        expect(computeSkuFromTemplate('ts-{size}-{Color}', { Size: 'm', Color: 'Navy Blue' })).toBe('TS-M-NAVY-BLUE');
    });

    it('transliterates accents instead of dropping letters', () => {
        expect(computeSkuFromTemplate('{COULEUR}', { Couleur: 'Rouge Écarlate' })).toBe('ROUGE-ECARLATE');
        expect(computeSkuFromTemplate('{C}', { C: 'Straße' })).toBe('STRASSE');
    });

    it('keeps punctuated values distinct', () => {
        const half = computeSkuFromTemplate('SH-{SIZE}', { Size: '10.5' });
        const whole = computeSkuFromTemplate('SH-{SIZE}', { Size: '105' });
        expect(half).toBe('SH-10-5');
        expect(half).not.toBe(whole);
    });

    it('drops unknown tokens without leaving doubled or dangling separators', () => {
        expect(computeSkuFromTemplate('TS-{SIZE}-{MISSING}', { Size: 'S' })).toBe('TS-S');
        expect(computeSkuFromTemplate('{MISSING}-TS', {})).toBe('TS');
    });

    it('supports option names with regex characters', () => {
        expect(computeSkuFromTemplate('{SIZE (EU)}', { 'Size (EU)': '42' })).toBe('42');
    });

    it('returns an empty SKU for an empty pattern', () => {
        expect(computeSkuFromTemplate('', { Size: 'S' })).toBe('');
    });
});

describe('computeVariantPrice', () => {
    it('adds every matching rule and rounds to cents', () => {
        const rules = [{ id: '1', targetValue: 'xl', modifier: 2.1 }, { id: '2', targetValue: 'Cotton', modifier: 0.2 }];
        expect(computeVariantPrice(10, rules, { Size: 'XL', Material: 'Cotton' })).toBe(12.3);
        expect(computeVariantPrice(10, rules, { Size: 'S', Material: 'Wool' })).toBe(10);
    });
});

describe('parseDecimal', () => {
    it.each([
        ['19.90', 19.9], ['19,90', 19.9], [' 5 ', 5], ['-2', -2], ['.5', 0.5], ['0', 0], ['1 299,5', 1299.5],
    ])('parses %s', (text, expected) => expect(parseDecimal(text)).toBe(expected));

    it.each(['', '-', 'abc', '1.2.3', '12a'])('rejects %s', (text) => expect(parseDecimal(text)).toBeNull());

    it('accepts partially typed numbers', () => {
        ['', '-', '0', '0.', '12,', '-3.'].forEach((text) => expect(isPartialDecimal(text)).toBe(true));
        ['a', '1.2.', '--1'].forEach((text) => expect(isPartialDecimal(text)).toBe(false));
    });
});
