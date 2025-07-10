/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
    jest: true,
  },
  extends: ['next/core-web-vitals'],
  rules: {
    // Relax rules for initial setup
    'react/no-unescaped-entities': 'off',
    '@next/next/no-img-element': 'warn',
  },
  ignorePatterns: ['node_modules', '.next', 'dist', '.turbo'],
};
