/* Список комітів: завантаження, стани очікування й помилки, фільтр за типом. */

import type { Commit, CommitType } from '../types/commit.js';
import type { CommitListState } from '../types/state.js';
import { findElement, requireElement } from './dom.js';
import { formatDate } from './format.js';
import { fetchCommits } from './api.js';
import { openCommitModal } from './modal.js';

const FILTER_ALL = 'all';

type Filter = typeof FILTER_ALL | CommitType;

interface Elements {
    readonly list: HTMLElement;
    readonly template: HTMLTemplateElement;
    readonly filters: HTMLElement;
    readonly loading: HTMLElement;
    readonly error: HTMLElement;
    readonly errorText: HTMLElement;
    readonly empty: HTMLElement;
}

let elements: Elements | null = null;
let state: CommitListState = { status: 'loading' };
let activeFilter: Filter = FILTER_ALL;

/* Розмітка картки лежить у теґу template в HTML, а не збирається рядками
   в коді: структуру видно в розмітці, і її перевіряє валідатор. */
function createCard(commit: Commit, view: Elements): HTMLElement {
    const root = view.template.content.firstElementChild;

    if (root === null) {
        throw new Error('Шаблон картки коміту порожній');
    }

    const card = root.cloneNode(true) as HTMLElement;

    requireElement('[data-commit-type]', card).textContent = commit.type;
    requireElement('[data-commit-title]', card).textContent = commit.title;
    requireElement('[data-commit-sha]', card).textContent = commit.shortSha;

    const time = requireElement<HTMLTimeElement>('[data-commit-date]', card);
    time.textContent = formatDate(commit.date);
    time.dateTime = commit.date;

    const button = requireElement<HTMLButtonElement>('[data-commit-details]', card);
    button.addEventListener('click', () => {
        openCommitModal(commit);
    });
    button.setAttribute('aria-label', `Подробиці коміту: ${commit.title}`);

    return card;
}

/* Усі дані приходять ззовні, тому в DOM вони потрапляють лише через
   textContent. innerHTML тут перетворив би чуже повідомлення коміту
   на розмітку, яку виконає браузер. */
function renderList(commits: readonly Commit[], view: Elements): void {
    view.list.replaceChildren(...commits.map((commit) => createCard(commit, view)));
    view.empty.hidden = commits.length > 0;
}

function visibleCommits(commits: readonly Commit[]): readonly Commit[] {
    if (activeFilter === FILTER_ALL) {
        return commits;
    }

    return commits.filter((commit) => commit.type === activeFilter);
}

/* Кнопки фільтра будуються з самих даних: показувати тип, якого в списку
   немає, немає сенсу. */
function renderFilters(commits: readonly Commit[], view: Elements): void {
    const types: Filter[] = [FILTER_ALL, ...new Set(commits.map((commit) => commit.type))];

    view.filters.replaceChildren(
        ...types.map((type) => {
            const button = document.createElement('button');

            button.type = 'button';
            button.className = 'filter';
            button.textContent = type === FILTER_ALL ? 'усі' : type;
            button.dataset.filter = type;
            button.setAttribute('aria-pressed', String(type === activeFilter));
            button.addEventListener('click', () => {
                selectFilter(type);
            });

            return button;
        })
    );

    view.filters.hidden = false;
}

function selectFilter(filter: Filter): void {
    if (elements === null || state.status !== 'ready') {
        return;
    }

    activeFilter = filter;

    for (const button of elements.filters.children) {
        button.setAttribute('aria-pressed', String(button.getAttribute('data-filter') === filter));
    }

    renderList(visibleCommits(state.commits), elements);
}

/* Один стан — один вигляд сторінки. Перевірка status звужує тип, тому
   повідомлення про помилку доступне лише там, де воно справді існує. */
function render(view: Elements): void {
    view.loading.hidden = state.status !== 'loading';
    view.error.hidden = state.status !== 'error';
    view.errorText.textContent = state.status === 'error' ? state.message : '';

    if (state.status === 'ready') {
        renderFilters(state.commits, view);
        renderList(visibleCommits(state.commits), view);

        return;
    }

    view.list.replaceChildren();
    view.empty.hidden = true;
    view.filters.hidden = true;
}

async function load(view: Elements): Promise<void> {
    state = { status: 'loading' };
    activeFilter = FILTER_ALL;
    render(view);

    try {
        state = { status: 'ready', commits: await fetchCommits() };
    } catch (error) {
        state = {
            status: 'error',
            message: error instanceof Error ? error.message : 'Невідома помилка запиту.'
        };
    }

    render(view);
}

export function initCommits(): void {
    const list = findElement('[data-commit-list]');

    if (list === null) {
        return;
    }

    const view: Elements = {
        list,
        template: requireElement<HTMLTemplateElement>('[data-commit-template]'),
        filters: requireElement('[data-filters]'),
        loading: requireElement('[data-state-loading]'),
        error: requireElement('[data-state-error]'),
        errorText: requireElement('[data-error-text]'),
        empty: requireElement('[data-state-empty]')
    };

    elements = view;

    requireElement<HTMLButtonElement>('[data-retry]').addEventListener('click', () => {
        void load(view);
    });

    void load(view);
}
