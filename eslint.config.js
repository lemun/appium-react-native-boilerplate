// @ts-check
import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import { configs as wdio } from 'eslint-plugin-wdio';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  { ignores: ['node_modules/', 'apps/', 'logs/', 'allure-results/', 'allure-report/'] },
  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: { allowDefaultProject: ['eslint.config.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    rules: {
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },
  { ...wdio['flat/recommended'], files: ['src/**/*.ts'], ignores: ['**/*.test.ts'] },
  {
    // Offline unit tests use node:test, whose describe/it return promises the runner tracks itself.
    files: ['**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-floating-promises': [
        'error',
        { allowForKnownSafeCalls: [{ from: 'package', package: 'node:test', name: ['describe', 'it'] }] },
      ],
    },
  },
  { files: ['**/*.js'], ...tseslint.configs.disableTypeChecked },
  prettier,
);
