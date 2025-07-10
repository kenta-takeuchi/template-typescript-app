const baseConfig = require('./react');

/** @type {import('jest').Config} */
module.exports = {
  ...baseConfig,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  // Next.js specific configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        presets: ['next/babel'],
      },
    ],
  },
  // Module name mapping for Next.js and internal packages
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@template/types$': '<rootDir>/../../packages/types/src',
    '^@template/utils$': '<rootDir>/../../packages/utils/src',
    '^@template/ui$': '<rootDir>/../../packages/ui/src',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      'jest-transform-stub',
  },
  // Common test patterns for Next.js web applications
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx,js,jsx}',
    '<rootDir>/src/**/*.(test|spec).{ts,tsx,js,jsx}',
    '<rootDir>/__tests__/**/*.{ts,tsx,js,jsx}',
  ],
  // Coverage configuration for Next.js web applications
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/stories/**',
    '!src/app/**/layout.{ts,tsx}',
    '!src/app/**/loading.{ts,tsx}',
    '!src/app/**/error.{ts,tsx}',
    '!src/app/**/not-found.{ts,tsx}',
    '!src/app/**/page.{ts,tsx}', // Exclude page components from coverage
    '!src/lib/api-client/**', // Exclude generated API client
  ],
};
