/* Запит до зовнішнього джерела даних — публічного GitHub API. */

import type { Commit, CommitType, GitHubCommitPayload } from '../types/commit.js';
import { isGitHubCommitPayload, isKnownCommitType, OTHER_COMMIT_TYPE } from '../types/commit.js';

const API_URL = 'https://api.github.com/repos/dreyliky/course-project/commits?per_page=30';

/* Повідомлення підбираються за кодом відповіді: користувачеві потрібно знати,
   що саме пішло не так і чи має сенс повторювати спробу. */
function describeHttpError(status: number): string {
    if (status === 403 || status === 429) {
        return 'GitHub тимчасово обмежив кількість запитів. Спробуйте за кілька хвилин.';
    }

    if (status === 404) {
        return 'Репозиторій не знайдено за вказаною адресою.';
    }

    if (status >= 500) {
        return 'GitHub зараз не відповідає. Це не помилка сторінки.';
    }

    return `Сервер відповів кодом ${String(status)}.`;
}

function readCommitType(title: string): CommitType {
    const prefix = title.split(':')[0]?.trim() ?? '';

    return isKnownCommitType(prefix) ? prefix : OTHER_COMMIT_TYPE;
}

/* Із відповіді беремо лише потрібні поля: далі код не залежить від того,
   скільки всього віддає API. */
function toCommit(payload: GitHubCommitPayload): Commit {
    const lines = payload.commit.message.split('\n');
    const title = lines[0] ?? '';

    return {
        sha: payload.sha,
        shortSha: payload.sha.slice(0, 7),
        title,
        body: lines.slice(1).join('\n').trim(),
        type: readCommitType(title),
        author: payload.commit.author?.name ?? 'невідомий автор',
        date: payload.commit.author?.date ?? new Date().toISOString(),
        url: payload.html_url
    };
}

export async function fetchCommits(): Promise<Commit[]> {
    let response: Response;

    try {
        response = await fetch(API_URL, { headers: { Accept: 'application/vnd.github+json' } });
    } catch {
        /* Сюди потрапляє тільки збій мережі: fetch не вважає код 404 або 500 помилкою. */
        throw new Error('Не вдалося звʼязатися з GitHub. Перевірте підключення до мережі.');
    }

    if (!response.ok) {
        throw new Error(describeHttpError(response.status));
    }

    const data: unknown = await response.json();

    if (!Array.isArray(data)) {
        throw new Error('GitHub повернув відповідь несподіваного вигляду.');
    }

    const payloads = data.filter(isGitHubCommitPayload);

    if (payloads.length === 0) {
        throw new Error('GitHub повернув список у форматі, якого сторінка не розуміє.');
    }

    return payloads.map(toCommit);
}
