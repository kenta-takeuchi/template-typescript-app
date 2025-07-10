import { z } from 'zod';

const configSchema = z.object({
  app: z.object({
    port: z.number().default(4000),
    host: z.string().default('0.0.0.0'),
    nodeEnv: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    frontendUrl: z.string().url().default('http://localhost:3000'),
  }),
  database: z.object({
    url: z.string().url(),
  }),
  security: z.object({
    jwtSecret: z.string().min(32),
    encryptionKey: z.string().min(32),
  }),
  firebase: z.object({
    projectId: z.string(),
    clientEmail: z.string().email(),
    privateKey: z.string(),
  }),
  sendgrid: z.object({
    apiKey: z.string(),
    fromEmail: z.string().email(),
  }),
  storage: z.object({
    bucket: z.string(),
  }),
});

const rawConfig = {
  app: {
    port: parseInt(process.env.PORT || '4000', 10),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://user:password@localhost:5432/template_dev',
  },
  security: {
    jwtSecret:
      process.env.JWT_SECRET ||
      'your-super-secret-jwt-key-for-development-key-min-32',
    encryptionKey:
      process.env.ENCRYPTION_KEY || 'your-super-secret-encryption-key-dev',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'your-firebase-project',
    clientEmail:
      process.env.FIREBASE_CLIENT_EMAIL ||
      'test@firebase-project.iam.gserviceaccount.com',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || 'your-firebase-private-key',
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key',
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
  },
  storage: {
    bucket: process.env.STORAGE_BUCKET || 'your-storage-bucket',
  },
};

export const config = configSchema.parse(rawConfig);
