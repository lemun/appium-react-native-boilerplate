module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'wdio'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:wdio/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  env: {
    node: true,
    es2020: true,
    mocha: true,
  },
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'error',
    
    // General rules
    'no-console': 'warn',
    'no-debugger': 'error',
    'prefer-const': 'error',
    'no-var': 'error',
    
    // WebDriverIO specific
    'wdio/no-debug': 'error',
    'wdio/no-pause': 'error',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '*.js',
  ],
};