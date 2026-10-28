import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
    { ignores: ['dist/**', 'node_modules/**'] },
    js.configs.recommended,
    /* Набір правил, які спираються на типи: вони ловлять те, чого не видно
       з самого тексту, наприклад забутий await або порівняння непорівнюваних
       значень. */
    tseslint.configs.recommendedTypeChecked,
    tseslint.configs.stylisticTypeChecked,
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    /* Конфігураційні файли на JavaScript не входять у tsconfig, тому
       правила, що спираються на типи, до них не застосовуються. */
    {
        files: ['**/*.js'],
        extends: [tseslint.configs.disableTypeChecked]
    },
    /* Prettier має лишатися єдиним, хто вирішує питання форматування,
       тому конфліктні правила ESLint вимикаються останніми. */
    prettier
);
