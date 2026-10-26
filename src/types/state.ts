/* Стан списку комітів.

   Розмічене обʼєднання замість набору окремих прапорців: компілятор не
   дозволить описати неможливий стан на зразок «одночасно завантаження
   й помилка», а перевірка status звужує тип і відкриває доступ лише до
   тих полів, які в цьому стані існують. */

import type { Commit } from './commit.js';

export type CommitListState =
    | { readonly status: 'loading' }
    | { readonly status: 'error'; readonly message: string }
    | { readonly status: 'ready'; readonly commits: readonly Commit[] };
