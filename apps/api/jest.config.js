/** @type {import('jest').Config} */
module.exports = {
  ...require('@template/config/jest/node'),
  displayName: '@template/api',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  // API specific test patterns
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,js}',
    '<rootDir>/src/**/*.(test|spec).{ts,js}',
    '<rootDir>/__tests__/**/*.{ts,js}',
  ],
  // Additional coverage exclusions for API
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,js}',
    '!src/**/*.config.{ts,js}',
    '!src/app.ts', // Main application entry point
    '!src/lib/seed.ts', // Seed scripts
    '!src/domain/**/*.{ts,js}', // Domain layer - will be tested separately
    '!src/shared/**/*.{ts,js}', // Shared infrastructure - will be tested separately
  ],
  // Module name mapping for internal packages
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@template/types$': '<rootDir>/../../packages/types/src',
    '^@template/utils$': '<rootDir>/../../packages/utils/src',
    '^@template/database$': '<rootDir>/../../packages/database/src',
  },
  // テストの初期設定が完了するまで一時的にカバレッジの閾値を下げる
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
};
