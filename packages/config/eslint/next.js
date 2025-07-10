/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./index.js', 'next/core-web-vitals'],
  plugins: ['react-hooks'],
  rules: {
    // Next.js specific rules
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-img-element': 'warn',
    '@next/next/no-page-custom-font': 'warn',

    // React DDD Rules
    'react/prop-types': 'off', // TypeScript handles this
    'react/react-in-jsx-scope': 'off', // Next.js auto-imports
    'react/jsx-props-no-spreading': 'warn',
    'react/jsx-no-leaked-render': 'error',
    'react/jsx-key': 'error',
    'react/no-array-index-key': 'warn',
    'react/self-closing-comp': 'error',

    // Hooks Rules
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Component Architecture Rules
    'max-lines-per-function': ['warn', { max: 150, skipComments: true }],
    complexity: ['warn', { max: 10 }],

    // Accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/aria-role': 'error',
    'jsx-a11y/no-noninteractive-element-interactions': 'warn',
  },
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  overrides: [
    {
      // Page components can use default export
      files: [
        'pages/**/*.tsx',
        'app/**/page.tsx',
        'app/**/layout.tsx',
        'app/**/loading.tsx',
        'app/**/error.tsx',
        'app/**/not-found.tsx',
      ],
      rules: {
        'import/no-default-export': 'off',
        'import/prefer-default-export': 'error',
      },
    },
    {
      // Presentation layer components
      files: ['**/presentation/**/*.tsx', '**/components/**/*.tsx'],
      rules: {
        // UI components should be small and focused
        'max-lines-per-function': ['error', { max: 100, skipComments: true }],
        complexity: ['error', { max: 8 }],
      },
    },
  ],
};
