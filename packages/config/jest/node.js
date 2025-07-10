const baseConfig = require('./base');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  testEnvironment: 'node',
  setupFilesAfterEnv: [
    ...baseConfig.setupFilesAfterEnv,
    '<rootDir>/jest.setup.js',
  ],
  // Node.js specific globals
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  // Additional node modules that need transformation
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$))'],
};
