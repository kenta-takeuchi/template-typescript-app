const baseConfig = require('./base');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    '<rootDir>/jest.setup.js',
  ],
  // React specific module name mapping
  moduleNameMapper: {
    ...baseConfig.moduleNameMapper,
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      'jest-transform-stub',
  },
  // Transform configuration for React
  transform: {
    ...baseConfig.transform,
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: [
          [
            'next/babel',
            {
              'preset-env': {
                targets: {
                  node: 'current',
                },
              },
            },
          ],
        ],
      },
    ],
  },
  // Additional coverage patterns for React components
  collectCoverageFrom: [
    ...baseConfig.collectCoverageFrom,
    '!src/**/*.{stories,story}.{ts,tsx}',
    '!src/**/stories/**',
    '!src/app/**/layout.{ts,tsx}',
    '!src/app/**/loading.{ts,tsx}',
    '!src/app/**/error.{ts,tsx}',
    '!src/app/**/not-found.{ts,tsx}',
  ],
  // Ignore specific Next.js files
  testPathIgnorePatterns: [
    ...baseConfig.testPathIgnorePatterns,
    '<rootDir>/.next/',
    '<rootDir>/out/',
  ],
};
