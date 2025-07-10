/** @type {import('jest').Config} */
module.exports = {
  ...require('@template/config/jest/node'),
  displayName: '@template/utils',
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  // Utils package specific configuration
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/index.{ts,js}',
    '!src/**/*.config.{ts,js}',
  ],
  // Module name mapping for internal dependencies
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@template/types$': '<rootDir>/../types/src',
  },
  // Relax coverage thresholds for utils package during initial setup
  coverageThreshold: {
    global: {
      statements: 0,
      branches: 0,
      functions: 0,
      lines: 0,
    },
  },
};
