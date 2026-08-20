import 'dotenv/config';
import { afterEach } from 'vitest';

// Mock required env vars for tests
process.env.RAZORPAY_KEY_ID = 'test_key';
process.env.RAZORPAY_KEY_SECRET = 'test_secret';
process.env.RAZORPAY_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.AUTH_SECRET = 'test_auth_secret_minimum_32_characters_long';
process.env.NEXTAUTH_SECRET = 'test_nextauth_secret_minimum_32_characters_long';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
