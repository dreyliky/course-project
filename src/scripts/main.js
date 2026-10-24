/* Точка входу сторінок. Кожен ініціалізатор сам перевіряє, чи потрібні
   йому елементи є на поточній сторінці. */

import { initTheme } from './theme.js';
import { initModal } from './modal.js';
import { initCommits } from './commits.js';

initTheme();
initModal();
initCommits();
