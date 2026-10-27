/* Перемикач теми: системна → світла → темна. */

import type { ThemeMode } from '../types/theme.js';
import { isThemeMode, THEME_MODES } from '../types/theme.js';
import { findElement, requireElement } from './dom.js';

export const THEME_STORAGE_KEY = 'course-project-theme';

const LABELS: Record<ThemeMode, string> = {
    system: 'як у системі',
    light: 'світла',
    dark: 'темна'
};

/* Сховище може бути недоступним: приватний режим, заборонені дані сайту.
   У такому разі перемикач працює, просто вибір не переживе перезавантаження. */
function readMode(): ThemeMode {
    try {
        const saved: unknown = localStorage.getItem(THEME_STORAGE_KEY);

        return isThemeMode(saved) ? saved : 'system';
    } catch {
        return 'system';
    }
}

function saveMode(mode: ThemeMode): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
        /* мовчки: незбережений вибір не ламає сторінку */
    }
}

/* Системна тема — це відсутність атрибута: далі вирішує медіазапит у CSS. */
function applyMode(mode: ThemeMode): void {
    if (mode === 'system') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.dataset.theme = mode;
    }
}

export function initTheme(): void {
    const button = findElement<HTMLButtonElement>('[data-theme-toggle]');

    if (button === null) {
        return;
    }

    const label = requireElement('[data-theme-label]', button);
    let mode = readMode();

    function render(): void {
        label.textContent = LABELS[mode];
    }

    applyMode(mode);
    render();

    /* Кнопка прихована в розмітці й зʼявляється лише тут: без JavaScript
       вона нічого не робила б. */
    button.hidden = false;

    button.addEventListener('click', () => {
        const next = THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length];

        if (next === undefined) {
            return;
        }

        mode = next;
        applyMode(mode);
        saveMode(mode);
        render();
    });
}
