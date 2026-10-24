/* Запит до зовнішнього джерела даних — публічного GitHub API. */

const API_URL = 'https://api.github.com/repos/dreyliky/course-project/commits?per_page=30';

/* Повідомлення підбираються за кодом відповіді: користувачеві потрібно знати,
   що саме пішло не так і чи має сенс повторювати спробу. */
function describeHttpError(status) {
    if (status === 403 || status === 429) {
        return 'GitHub тимчасово обмежив кількість запитів. Спробуйте за кілька хвилин.';
    }

    if (status === 404) {
        return 'Репозиторій не знайдено за вказаною адресою.';
    }

    if (status >= 500) {
        return 'GitHub зараз не відповідає. Це не помилка сторінки.';
    }

    return `Сервер відповів кодом ${status}.`;
}

/* Із відповіді беремо лише потрібні поля: далі код не залежить від того,
   скільки всього віддає API. */
function toCommit(item) {
    const message = item.commit.message;
    const firstLine = message.split('\n')[0];
    const type = firstLine.includes(':') ? firstLine.split(':')[0].trim() : 'інше';

    return {
        sha: item.sha,
        shortSha: item.sha.slice(0, 7),
        title: firstLine,
        body: message.split('\n').slice(1).join('\n').trim(),
        type,
        author: item.commit.author.name,
        date: item.commit.author.date,
        url: item.html_url
    };
}

export async function fetchCommits() {
    let response;

    try {
        response = await fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
    } catch (error) {
        /* Сюди потрапляє тільки збій мережі: fetch не вважає код 404 або 500 помилкою. */
        throw new Error('Не вдалося звʼязатися з GitHub. Перевірте підключення до мережі.');
    }

    if (!response.ok) {
        throw new Error(describeHttpError(response.status));
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('GitHub повернув відповідь несподіваного вигляду.');
    }

    return data.map(toCommit);
}
