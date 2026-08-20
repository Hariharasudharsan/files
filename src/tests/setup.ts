import dotenv from 'dotenv';
import path from 'path';

// Load .env.local first (highest priority) then .env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { afterEach } from 'vitest';
