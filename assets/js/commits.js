/* Список комітів, завантажений із зовнішнього джерела. */

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
}

async function load() {
    renderList(await fetchCommits());
}

export function initCommits() {
    const list = document.querySelector('[data-commit-list]');

    if (!list) {
        return;
    }

    elements = {
        list,
        template: document.querySelector('[data-commit-template]')
    };

    load();
}
