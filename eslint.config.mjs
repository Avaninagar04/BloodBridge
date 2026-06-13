import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'public/**',
      '*.config.mjs',
      'next-env.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['app/**/*.{ts,tsx}', 'components/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}', 'types/**/*.ts', 'proxy.ts'],
    languageOptions: {
      globals: {
        React: 'readonly',
        Request: 'readonly',
        Response: 'readonly',
        fetch: 'readonly',
        console: 'readonly',
        process: 'readonly',
        window: 'readonly',
        setTimeout: 'readonly',
      },
      parserOptions: {
        project: false,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
]
