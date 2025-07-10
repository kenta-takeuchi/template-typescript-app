import { z } from 'zod';
// Jest globals are available without import

// Sample user schema for testing
const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  location: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

type User = z.infer<typeof UserSchema>;

describe('User Type Validation', () => {
  it('should validate correct user data', () => {
    const validUserData = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      location: 'New York',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserSchema.safeParse(validUserData);
    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.id).toBe('user-123');
      expect(result.data.email).toBe('test@example.com');
    }
  });

  it('should reject invalid email format', () => {
    const invalidUserData = {
      id: 'user-123',
      email: 'invalid-email',
      name: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserSchema.safeParse(invalidUserData);
    expect(result.success).toBe(false);

    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue: any) =>
            issue.path.includes('email') && issue.code === 'invalid_string'
        )
      ).toBe(true);
    }
  });

  it('should reject empty required fields', () => {
    const invalidUserData = {
      id: '',
      email: 'test@example.com',
      name: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = UserSchema.safeParse(invalidUserData);
    expect(result.success).toBe(false);
  });
});
