import { z } from "zod";

/**
 * Enterprise Centralized Configuration
 * 
 * Validates all environment variables at runtime startup to ensure the application
 * does not boot in a misconfigured state. 
 * Never expose secret keys to the client.
 */

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  
  // Application URLs
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  
  // ERPNext (Frappe Cloud) Configurations
  ERPNEXT_URL: z.string().url().optional(),
  ERPNEXT_API_KEY: z.string().optional(),
  ERPNEXT_API_SECRET: z.string().optional(),
  ERPNEXT_WEBHOOK_SECRET: z.string().optional(),
  
  // Queue & Redis (For future use)
  REDIS_URL: z.string().url().optional(),
  
  // Database
  DATABASE_URL: z.string().url().optional(),

  // Security Secrets
  AUTH_SECRET: z.string().min(32).optional(),
});

// We cast to any to suppress TS errors during process.env parsing in Edge environments
const parsedEnv = envSchema.safeParse(process.env as any);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
