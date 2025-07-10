// Jest setup file for types package tests

// Set test environment
process.env.NODE_ENV = 'test';

// Global test utilities for type testing
global.testUtils = {
  // Helper for testing Zod schemas
  expectValidation: (schema, validData, invalidData) => {
    const validResult = schema.safeParse(validData);
    const invalidResult = schema.safeParse(invalidData);

    expect(validResult.success).toBe(true);
    expect(invalidResult.success).toBe(false);

    return {
      validData: validResult.data,
      invalidErrors: invalidResult.error,
    };
  },

  // Mock data generators
  createMockUserData: (overrides = {}) => ({
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockJobData: (overrides = {}) => ({
    id: 'job-123',
    title: 'Software Engineer',
    description: 'Test job description',
    companyId: 'company-123',
    location: '新潟市',
    salary: '400万円〜600万円',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),

  createMockCompanyData: (overrides = {}) => ({
    id: 'company-123',
    name: 'Test Company',
    email: 'company@example.com',
    description: 'Test company description',
    location: '新潟市',
    industry: 'IT',
    website: 'https://example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }),
};
