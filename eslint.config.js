// @ts-check
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    files: ['src/**/*.ts', 'tests/**/*.ts', 'server.ts'],
    extends: [
      ...tseslint.configs.recommended,
    ],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
      'no-console': 'warn',
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'eqeqeq': ['error', 'always'],
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**'],
  },
)
