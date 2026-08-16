import dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from middleware root
dotenv.config({ path: resolve(__dirname, '..', '.env') });
// Fallback to .env.example
dotenv.config({ path: resolve(__dirname, '..', '.env.example') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    expires: process.env.JWT_EXPIRES || '24h',
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  skyeEngine: {
    inboxKey: process.env.SKYE_ENGINE_INBOX_KEY || 'skye:master:inbox',
    outboxKey: process.env.SKYE_ENGINE_OUTBOX_KEY || 'skye:channel:web:out',
    streamPrefix: process.env.SKYE_ENGINE_STREAM_PREFIX || 'skye:stream:conv:web:',
  },

  ebv3: {
    url: process.env.EBV3_URL || 'ws://localhost:8765',
  },

  sqlite: {
    path: process.env.SQLITE_PATH || './data/skye_middleware.db',
  },

  activationCode: {
    prefix: process.env.ACTIVATION_CODE_PREFIX || 'RN-SKYE-510510',
    expiryDays: parseInt(process.env.ACTIVATION_CODE_EXPIRY_DAYS || '30', 10),
  },
} as const;
