// Jest setup file for utils package tests

// Set test environment
process.env.NODE_ENV = 'test';

// Mock external dependencies commonly used in utils
jest.mock('date-fns', () => ({
  ...jest.requireActual('date-fns'),
  // Keep actual implementations but allow for specific mocking when needed
}));

// Global test utilities for utility function testing
global.testUtils = {
  // Helper for testing date utilities
  createMockDate: (year = 2024, month = 0, day = 1) =>
    new Date(year, month, day),

  // Helper for testing API client utilities
  createMockApiResponse: (data, status = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {},
  }),

  createMockApiError: (message = 'API Error', status = 400) => {
    const error = new Error(message);
    error.response = {
      data: { message },
      status,
      statusText: 'Bad Request',
    };
    return error;
  },

  // Helper for testing format utilities
  testCurrencyFormat: (amount, expected) => {
    expect(amount).toBe(expected);
  },

  // Helper for testing validation utilities
  testValidation: (validator, validCases, invalidCases) => {
    validCases.forEach(testCase => {
      expect(validator(testCase)).toBe(true);
    });

    invalidCases.forEach(testCase => {
      expect(validator(testCase)).toBe(false);
    });
  },
};
