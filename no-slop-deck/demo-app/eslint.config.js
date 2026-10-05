import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**', 'data/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: { process: 'readonly' } },
  },
  {
    files: ['src/client/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['node:*', 'fastify', '**/lib/**', '**/routes/**', '**/app.*', '**/server.*'],
          caseSensitive: true,
          message: 'Browser code must use the HTTP API. Put shared request/response types in src/shared/contracts.ts.',
        }],
      }],
    },
  },
)
