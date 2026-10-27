/* Пошук елементів із перевіркою.

   querySelector повертає null, якщо елемента немає. Писати всюди знак
   оклику означало б обіцяти компіляторові те, чого ніхто не перевіряв:
   при помилці в селекторі падіння сталося б пізніше й у чужому місці.
   Тут помилка видно одразу і з назвою селектора. */

export function requireElement<T extends Element = HTMLElement>(
    selector: string,
    root: ParentNode = document
): T {
    const element = root.querySelector<T>(selector);

    if (element === null) {
        throw new Error(`Не знайдено елемент за селектором ${selector}`);
    }

    return element;
}

/** Те саме, але для необовʼязкових елементів: їх може не бути на сторінці. */
export function findElement<T extends Element = HTMLElement>(
    selector: string,
    root: ParentNode = document
): T | null {
    return root.querySelector<T>(selector);
}
