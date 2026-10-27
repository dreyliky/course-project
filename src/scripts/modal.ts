/* Модальне вікно з подробицями коміту.

   Використано тег dialog: браузер сам замикає фокус усередині вікна,
   закриває його клавішею Esc і повертає фокус на елемент, з якого вікно
   відкрили. Писати це руками означало б відтворювати готову поведінку. */

import type { Commit } from '../types/commit.js';
import { findElement, requireElement } from './dom.js';
import { formatDate } from './format.js';

interface ModalFields {
    readonly title: HTMLElement;
    readonly body: HTMLElement;
    readonly author: HTMLElement;
    readonly date: HTMLTimeElement;
    readonly sha: HTMLElement;
    readonly link: HTMLAnchorElement;
}

let dialog: HTMLDialogElement | null = null;
let fields: ModalFields | null = null;

export function initModal(): void {
    dialog = findElement<HTMLDialogElement>('[data-modal]');

    if (dialog === null) {
        return;
    }

    fields = {
        title: requireElement('[data-modal-title]', dialog),
        body: requireElement('[data-modal-body]', dialog),
        author: requireElement('[data-modal-author]', dialog),
        date: requireElement<HTMLTimeElement>('[data-modal-date]', dialog),
        sha: requireElement('[data-modal-sha]', dialog),
        link: requireElement<HTMLAnchorElement>('[data-modal-link]', dialog)
    };

    const closeButton = requireElement<HTMLButtonElement>('[data-modal-close]', dialog);
    const current = dialog;

    closeButton.addEventListener('click', () => {
        current.close();
    });

    /* Клік по тлу закриває вікно. Сам dialog займає всю область разом із
       підкладкою, тому натискання поза вмістом приходить саме на нього. */
    current.addEventListener('click', (event) => {
        if (event.target === current) {
            current.close();
        }
    });
}

export function openCommitModal(commit: Commit): void {
    if (dialog === null || fields === null) {
        return;
    }

    fields.title.textContent = commit.title;
    fields.body.textContent = commit.body || 'Розгорнутого опису немає.';
    fields.author.textContent = commit.author;
    fields.date.textContent = formatDate(commit.date);
    fields.date.dateTime = commit.date;
    fields.sha.textContent = commit.shortSha;
    fields.link.href = commit.url;

    dialog.showModal();
}
