/* Типи предметної області: оформлення сторінки. */

export const THEME_MODES = ['system', 'light', 'dark'] as const;

export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: unknown): value is ThemeMode {
    return typeof value === 'string' && (THEME_MODES as readonly string[]).includes(value);
}
