import { en, type Dictionary } from './dictionaries/en';
import { fr } from './dictionaries/fr';
import type { Locale } from './config';

export type { Dictionary };
export * from './config';

const dictionaries: Record<Locale, Dictionary> = { en, fr };

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

type ParamFn = (params: Record<string, string | number>) => string;

/** Translates a stable code (validation issue, API error) with an English fallback. */
export function translateCode(table: Record<string, ParamFn>, code: string | undefined, params: Record<string, string | number> = {}, fallback = '') {
    const fn = code ? table[code] : undefined;
    return fn ? fn(params) : fallback;
}
