import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist', '.playwright-dist', 'node_modules', 'playwright-report', 'test-results']),
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  js.configs.recommended,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.vite,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/prop-types': 'off',
    },
  },
  {
    files: ['*.config.js', 'scripts/**/*.mjs', 'tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'react/prop-types': 'off',
    },
  },
  prettier,
]);
