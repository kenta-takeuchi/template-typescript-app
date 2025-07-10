/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['../../.eslintrc.js'],
  rules: {
    // UI Component specific overrides
    'import/no-default-export': 'off', // Components need default exports
    'import/prefer-default-export': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      },
    ],
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  env: {
    browser: true,
    jest: true,
  },
  ignorePatterns: ['node_modules', 'dist', '.turbo'],
};
