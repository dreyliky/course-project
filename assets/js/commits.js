/* Список комітів: завантаження, стани очікування й помилки. */

import { fetchCommits } from './api.js';
import { formatDate } from './format.js';

let elements;

/* Розмітка картки лежить у теґу template в HTML, а не збирається рядками
   в коді: структуру видно в розмітці, і її перевіряє валідатор. */
function createCard(commit) {
    const card = elements.template.content.firstElementChild.cloneNode(true);

    card.querySelector('[data-commit-type]').textContent = commit.type;
    card.querySelector('[data-commit-title]').textContent = commit.title;
    card.querySelector('[data-commit-sha]').textContent = commit.shortSha;

    const time = card.querySelector('[data-commit-date]');
    time.textContent = formatDate(commit.date);
    time.setAttribute('datetime', commit.date);

    return card;
}

/* Усі дані приходять ззовні, тому в DOM вони потрапляють лише через
   textContent. innerHTML тут перетворив би чуже повідомлення коміту
   на розмітку, яку виконає браузер. */
function renderList(commits) {
    elements.list.replaceChildren(...commits.map(createCard));
    elements.empty.hidden = commits.length > 0;
}

function showState({ loading = false, error = '' }) {
    elements.loading.hidden = !loading;
    elements.error.hidden = !error;
    elements.errorText.textContent = error;

    if (loading || error) {
        elements.list.replaceChildren();
        elements.empty.hidden = true;
    }
}

async function load() {
    showState({ loading: true });

    try {
        showState({});
        renderList(await fetchCommits());
    } catch (error) {
        showState({ error: error.message });
    }
}

export function initCommits() {
    const list = document.querySelector('[data-commit-list]');

    if (!list) {
        return;
    }

    elements = {
        list,
        template: document.querySelector('[data-commit-template]'),
        loading: document.querySelector('[data-state-loading]'),
        error: document.querySelector('[data-state-error]'),
        errorText: document.querySelector('[data-error-text]'),
        empty: document.querySelector('[data-state-empty]')
    };

    document.querySelector('[data-retry]').addEventListener('click', load);

    load();
}
