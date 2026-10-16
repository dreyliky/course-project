/* Перемикач теми: системна → світла → темна.

   Файл підключений у <head> синхронно, а не як модуль: модулі виконуються
   після розбору документа, і сторінка встигла б блимнути світлою темою
   перед тим, як застосується збережений вибір. */

(function () {
    'use strict';

    var STORAGE_KEY = 'course-project-theme';
    var MODES = ['system', 'light', 'dark'];
    var LABELS = {
        system: 'як у системі',
        light: 'світла',
        dark: 'темна'
    };

    /* Сховище може бути недоступним: приватний режим, заборонені дані сайту.
       У такому разі перемикач працює, просто вибір не переживе перезавантаження. */
    function readMode() {
        try {
            var saved = localStorage.getItem(STORAGE_KEY);
            return MODES.indexOf(saved) === -1 ? 'system' : saved;
        } catch (error) {
            return 'system';
        }
    }

    function saveMode(mode) {
        try {
            localStorage.setItem(STORAGE_KEY, mode);
        } catch (error) {
            /* мовчки: незбережений вибір не ламає сторінку */
        }
    }

    /* Системна тема — це відсутність атрибута: далі вирішує медіазапит у CSS. */
    function applyMode(mode) {
        if (mode === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', mode);
        }
    }

    var mode = readMode();
    applyMode(mode);

    function initToggle() {
        var button = document.querySelector('[data-theme-toggle]');

        if (!button) {
            return;
        }

        var label = button.querySelector('[data-theme-label]');

        function render() {
            label.textContent = LABELS[mode];
        }

        /* Кнопка прихована в розмітці й зʼявляється лише тут: без JavaScript
           вона нічого не робила б. */
        button.hidden = false;
        render();

        button.addEventListener('click', function () {
            mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
            applyMode(mode);
            saveMode(mode);
            render();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggle);
    } else {
        initToggle();
    }
})();
