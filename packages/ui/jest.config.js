/** @type {import('jest').Config} */
module.exports = {
  ...require('@template/config/jest/react'),
  displayName: '@template/ui',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',

  // UI component specific configuration
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/stories/**',
    '!src/**/index.{ts,tsx}',
    '!src/**/*.config.{ts,tsx}',
  ],

  // Module name mapping for internal dependencies
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@template/types$': '<rootDir>/../types/src',
    '^@template/utils$': '<rootDir>/../utils/src',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      'jest-transform-stub',
  },

  // React component testing specific patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx,js,jsx}',
  ],

  // Coverage threshold for UI components
  coverageThreshold: {
    global: {
      statements: 78,
      branches: 68,
      functions: 75,
      lines: 78,
    },
  },
};
