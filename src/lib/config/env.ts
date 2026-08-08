import "server-only";

export interface ServerEnv {
  siteUrl: string;
  erpBaseUrl?: string;
  erpAuthToken?: string;
  erpWebhookSecret?: string;
  nodeEnv: "development" | "production" | "test";
}

export function getServerEnv(): ServerEnv {
  return {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.mathuramfoods.com",
    erpBaseUrl: process.env.ERP_BASE_URL || process.env.NEXT_PUBLIC_ERPNEXT_URL,
    erpAuthToken: process.env.ERP_AUTH_TOKEN || process.env.ERPNEXT_AUTH_TOKEN,
    erpWebhookSecret: process.env.ERP_WEBHOOK_SECRET,
    nodeEnv: (process.env.NODE_ENV as ServerEnv["nodeEnv"]) || "development",
  };
}
