// Set up test environment variables before any imports
process.env.JWT_SECRET = 'test-jwt-secret-key-with-minimum-32-characters';
process.env.ENCRYPTION_KEY = 'test-encryption-key-with-minimum-32-characters';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import { config } from '../config';

describe('Config Module', () => {
  // Clean up after tests
  afterAll(() => {
    delete process.env.JWT_SECRET;
    delete process.env.ENCRYPTION_KEY;
    delete process.env.DATABASE_URL;
  });

  it('should export configuration object with all required sections', () => {
    expect(config).toBeDefined();
    expect(config.app).toBeDefined();
    expect(config.database).toBeDefined();
    expect(config.security).toBeDefined();
    expect(config.firebase).toBeDefined();
    expect(config.sendgrid).toBeDefined();
    expect(config.storage).toBeDefined();
  });

  it('should have valid app configuration', () => {
    expect(config.app.port).toBeGreaterThan(0);
    expect(config.app.host).toBeTruthy();
    expect(['development', 'production', 'test']).toContain(config.app.nodeEnv);
    expect(config.app.frontendUrl).toMatch(/^https?:\/\//);
  });

  it('should have valid database configuration', () => {
    expect(config.database.url).toBeTruthy();
    expect(config.database.url).toMatch(/^postgresql:\/\//);
  });

  it('should have valid security configuration', () => {
    expect(config.security.jwtSecret).toBeTruthy();
    expect(config.security.jwtSecret.length).toBeGreaterThanOrEqual(32);
    expect(config.security.encryptionKey).toBeTruthy();
    expect(config.security.encryptionKey.length).toBeGreaterThanOrEqual(32);
  });

  it('should have valid firebase configuration', () => {
    expect(config.firebase.projectId).toBeTruthy();
    expect(config.firebase.clientEmail).toMatch(/^.+@.+\..+$/);
    expect(config.firebase.privateKey).toBeTruthy();
  });

  it('should have valid sendgrid configuration', () => {
    expect(config.sendgrid.apiKey).toBeTruthy();
    expect(config.sendgrid.fromEmail).toMatch(/^.+@.+\..+$/);
  });

  it('should have valid storage configuration', () => {
    expect(config.storage.bucket).toBeTruthy();
  });
});
