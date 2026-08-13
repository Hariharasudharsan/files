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
  NEXT_PUBLIC_SITE_URL: process.env.NODE_ENV === "production" 
    ? z.string().url() 
    : z.string().url().optional(),

  // ERPNext (Frappe Cloud) Configurations
  ERPNEXT_URL: z.string().url().optional(),
  ERPNEXT_API_KEY: z.string().optional(),
  ERPNEXT_API_SECRET: z.string().optional(),
  ERPNEXT_WEBHOOK_SECRET: z.string().optional(),

  // Seller Details
  SELLER_STATE: z.string().optional().default("Tamil Nadu"),
  SELLER_GSTIN: z.string().optional(),

  // Queue & Redis (For future use)
  REDIS_URL: z.string().url().optional(),

  // Database
  DATABASE_URL: z.string().url().optional(),

  // Security Secrets
  AUTH_SECRET: z.string().min(32).optional(),
  // S3 / R2 Storage
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_URL: z.string().url().optional(),
});

// We cast to any to suppress TS errors during process.env parsing in Edge environments
const parsedEnv = envSchema.safeParse(process.env as any);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;

export function getServerEnv() {
  return {
    siteUrl: env.NEXT_PUBLIC_SITE_URL || env.NEXT_PUBLIC_APP_URL,
    nodeEnv: env.NODE_ENV,
    erpBaseUrl: env.ERPNEXT_URL,
    erpAuthToken:
      env.ERPNEXT_API_KEY && env.ERPNEXT_API_SECRET
        ? `token ${env.ERPNEXT_API_KEY}:${env.ERPNEXT_API_SECRET}`
        : undefined,
    erpWebhookSecret: env.ERPNEXT_WEBHOOK_SECRET,
    sellerState: env.SELLER_STATE,
    sellerGstin: env.SELLER_GSTIN,
    s3: {
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      bucket: env.S3_BUCKET,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
      publicUrl: env.S3_PUBLIC_URL,
    },
  };
}
