import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

/* Проєкт розгортається за адресою вигляду https://<user>.github.io/course-project/,
   тому посилання на ресурси мають починатися з цього префікса. */
const BASE_PATH = '/course-project/';

const page = (name: string): string => fileURLToPath(new URL(`./${name}.html`, import.meta.url));

export default defineConfig({
    base: BASE_PATH,
    build: {
        outDir: 'dist',
        /* Багатосторінковий режим: кожна сторінка — окрема точка входу,
           інакше Vite зібрав би лише index.html. */
        rollupOptions: {
            input: {
                index: page('index'),
                about: page('about'),
                activity: page('activity'),
                contact: page('contact')
            }
        }
    }
});
