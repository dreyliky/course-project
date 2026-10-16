/* Список комітів: завантаження, стани очікування й помилки, фільтр за типом. */

import { fetchCommits } from './api.js';
import { formatDate } from './format.js';
import { openCommitModal } from './modal.js';

const FILTER_ALL = 'all';

let allCommits = [];
let activeType = FILTER_ALL;
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

    const button = card.querySelector('[data-commit-details]');
    button.addEventListener('click', () => openCommitModal(commit));
    button.setAttribute('aria-label', `Подробиці коміту: ${commit.title}`);

    return card;
}

/* Усі дані приходять ззовні, тому в DOM вони потрапляють лише через
   textContent. innerHTML тут перетворив би чуже повідомлення коміту
   на розмітку, яку виконає браузер. */
function renderList(commits) {
    elements.list.replaceChildren(...commits.map(createCard));
    elements.empty.hidden = commits.length > 0;
}

function visibleCommits() {
    if (activeType === FILTER_ALL) {
        return allCommits;
    }

    return allCommits.filter((commit) => commit.type === activeType);
}

/* Кнопки фільтра будуються з самих даних: показувати тип, якого в списку
   немає, немає сенсу. */
function renderFilters() {
    const types = [FILTER_ALL, ...new Set(allCommits.map((commit) => commit.type))];

    elements.filters.replaceChildren(...types.map((type) => {
        const button = document.createElement('button');

        button.type = 'button';
        button.className = 'filter';
        button.textContent = type === FILTER_ALL ? 'усі' : type;
        button.setAttribute('aria-pressed', String(type === activeType));
        button.addEventListener('click', () => selectType(type));

        return button;
    }));

    elements.filters.hidden = false;
}

function selectType(type) {
    activeType = type;

    for (const button of elements.filters.children) {
        const label = button.textContent === 'усі' ? FILTER_ALL : button.textContent;
        button.setAttribute('aria-pressed', String(label === activeType));
    }

    renderList(visibleCommits());
}

function showState({ loading = false, error = '' }) {
    elements.loading.hidden = !loading;
    elements.error.hidden = !error;
    elements.errorText.textContent = error;

    if (loading || error) {
        elements.list.replaceChildren();
        elements.empty.hidden = true;
        elements.filters.hidden = true;
    }
}

async function load() {
    showState({ loading: true });

    try {
        allCommits = await fetchCommits();
        showState({});
        renderFilters();
        renderList(visibleCommits());
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
        filters: document.querySelector('[data-filters]'),
        loading: document.querySelector('[data-state-loading]'),
        error: document.querySelector('[data-state-error]'),
        errorText: document.querySelector('[data-error-text]'),
        empty: document.querySelector('[data-state-empty]')
    };

    document.querySelector('[data-retry]').addEventListener('click', load);

    load();
}
