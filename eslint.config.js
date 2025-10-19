import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsp from '@typescript-eslint/parser';

export default [
  js.config({
    ignores: [
      'dist/**',
      'node_modules/**',
      'vite.config*.mjs'
    ]
  }),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsp,
      parserOptions: {
        project: './tsconfig.eslint.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      ...tseslint.configs['recommended-requiring-type-checking'].rules,
    },
  },
];
