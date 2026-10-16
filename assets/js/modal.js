/* Модальне вікно з подробицями коміту.

   Використано тег dialog: браузер сам замикає фокус усередині вікна,
   закриває його клавішею Esc і повертає фокус на елемент, з якого вікно
   відкрили. Писати це руками означало б відтворювати готову поведінку. */

import { formatDate } from './format.js';

let dialog;
let fields;

export function initModal() {
    dialog = document.querySelector('[data-modal]');

    if (!dialog) {
        return;
    }

    fields = {
        title: dialog.querySelector('[data-modal-title]'),
        body: dialog.querySelector('[data-modal-body]'),
        author: dialog.querySelector('[data-modal-author]'),
        date: dialog.querySelector('[data-modal-date]'),
        sha: dialog.querySelector('[data-modal-sha]'),
        link: dialog.querySelector('[data-modal-link]')
    };

    dialog.querySelector('[data-modal-close]').addEventListener('click', () => dialog.close());

    /* Клік по тлу закриває вікно. Сам dialog займає всю область разом із
       підкладкою, тому натискання поза вмістом приходить саме на нього. */
    dialog.addEventListener('click', (event) => {
        if (event.target === dialog) {
            dialog.close();
        }
    });
}

export function openCommitModal(commit) {
    if (!dialog) {
        return;
    }

    fields.title.textContent = commit.title;
    fields.body.textContent = commit.body || 'Розгорнутого опису немає.';
    fields.author.textContent = commit.author;
    fields.date.textContent = formatDate(commit.date);
    fields.date.setAttribute('datetime', commit.date);
    fields.sha.textContent = commit.shortSha;
    fields.link.href = commit.url;

    dialog.showModal();
}
