/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    // Database package specific overrides
    'import/no-default-export': 'off', // Allow default exports for client
    '@typescript-eslint/explicit-function-return-type': 'off',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
  },
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['node_modules', 'dist', '.turbo'],
};
