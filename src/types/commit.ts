/* Типи предметної області: коміт репозиторію та відповідь GitHub API. */

/** Типи змін, які проєкт використовує в повідомленнях комітів. */
export const KNOWN_COMMIT_TYPES = [
    'feat',
    'fix',
    'docs',
    'style',
    'refactor',
    'chore',
    'ci',
    'test',
    'perf',
    'build'
] as const;

export type KnownCommitType = (typeof KNOWN_COMMIT_TYPES)[number];

/** Усе, що не вкладається в угоду, потрапляє в цю категорію. */
export const OTHER_COMMIT_TYPE = 'інше';

export type CommitType = KnownCommitType | typeof OTHER_COMMIT_TYPE;

export function isKnownCommitType(value: string): value is KnownCommitType {
    return (KNOWN_COMMIT_TYPES as readonly string[]).includes(value);
}

/** Коміт у тому вигляді, в якому його використовує інтерфейс. */
export interface Commit {
    readonly sha: string;
    readonly shortSha: string;
    readonly title: string;
    readonly body: string;
    readonly type: CommitType;
    readonly author: string;
    readonly date: string;
    readonly url: string;
}

/** Поля відповіді GitHub, які проєкт справді читає. Решту навмисно не описуємо. */
export interface GitHubCommitPayload {
    readonly sha: string;
    readonly html_url: string;
    readonly commit: {
        readonly message: string;
        readonly author: {
            readonly name: string;
            readonly date: string;
        } | null;
    };
}

/* Типи зникають під час збірки, тому дані з мережі треба перевіряти
   в середовищі виконання. Без цієї перевірки будь-яка зміна формату
   відповіді проявилася б як помилка десь глибше в коді. */
export function isGitHubCommitPayload(value: unknown): value is GitHubCommitPayload {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const candidate = value as Partial<GitHubCommitPayload>;

    return (
        typeof candidate.sha === 'string' &&
        typeof candidate.html_url === 'string' &&
        typeof candidate.commit === 'object' &&
        candidate.commit !== null &&
        typeof candidate.commit.message === 'string'
    );
}
