// @ts-check
const { defineConfig } = require('eslint-define-config');

module.exports = defineConfig({
    extends: ['prettier', 'alloy', 'alloy/typescript', 'plugin:sonarjs/recommended', 'turbo'],
    ignorePatterns: ['**/migrations/*.ts', '**/generated/*.ts', 'dist/*', '*-env.d.ts'],
    env: {
        jest: true,
    },
    overrides: [
        {
            files: ['*.resolver.ts'],
            rules: {
                'max-params': 0,
            },
        },
    ],
    plugins: ['prettier', 'sonarjs'],
    rules: {
        '@typescript-eslint/explicit-member-accessibility': 'off',
    },
    settings: {},
});
