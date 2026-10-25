/* Спільні перетворення даних для показу користувачеві. */

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}
