/** @type {import('jest').Config} */
module.exports = {
  ...require('@template/config/jest/node'),
  displayName: '@template/types',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  // Type package specific configuration
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,js}',
    '!src/**/*.types.{ts,js}',
  ],
  // Focus on testing type utilities and validators
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,js}',
    '<rootDir>/src/**/*.(test|spec).{ts,js}',
  ],
  // Disable coverage thresholds for types package since it mainly contains type definitions
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};
