/* Перемикач теми: системна → світла → темна.

   Антиспалаховий код переїхав у маленький інлайн у <head>: модулі
   виконуються після розбору документа, і сторінка встигла б блимнути
   світлою темою. Тут лишилася логіка самої кнопки. */

const STORAGE_KEY = 'course-project-theme';
const MODES = ['system', 'light', 'dark'];
const LABELS = {
    system: 'як у системі',
    light: 'світла',
    dark: 'темна'
};

/* Сховище може бути недоступним: приватний режим, заборонені дані сайту.
   У такому разі перемикач працює, просто вибір не переживе перезавантаження. */
function readMode() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        return MODES.includes(saved) ? saved : 'system';
    } catch {
        return 'system';
    }
}

function saveMode(mode) {
    try {
        localStorage.setItem(STORAGE_KEY, mode);
    } catch {
        /* мовчки: незбережений вибір не ламає сторінку */
    }
}

/* Системна тема — це відсутність атрибута: далі вирішує медіазапит у CSS. */
function applyMode(mode) {
    if (mode === 'system') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.dataset.theme = mode;
    }
}

export function initTheme() {
    const button = document.querySelector('[data-theme-toggle]');

    if (!button) {
        return;
    }

    const label = button.querySelector('[data-theme-label]');
    let mode = readMode();

    function render() {
        label.textContent = LABELS[mode];
    }

    applyMode(mode);
    render();

    /* Кнопка прихована в розмітці й зʼявляється лише тут: без JavaScript
       вона нічого не робила б. */
    button.hidden = false;

    button.addEventListener('click', () => {
        mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
        applyMode(mode);
        saveMode(mode);
        render();
    });
}
