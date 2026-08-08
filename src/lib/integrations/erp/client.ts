import crypto from "crypto";

/**
 * ERPNext Integration API Client
 * 
 * Provides a secure, centralized interface for making outbound requests to ERPNext (Frappe Cloud).
 * Never hardcode credentials. Always use Environment Variables.
 */

const ERPNEXT_URL = process.env.ERPNEXT_URL || "https://mathuram-erp.frappe.cloud";
const ERPNEXT_API_KEY = process.env.ERPNEXT_API_KEY || "";
const ERPNEXT_API_SECRET = process.env.ERPNEXT_API_SECRET || "";
const ERPNEXT_WEBHOOK_SECRET = process.env.ERPNEXT_WEBHOOK_SECRET || "";

export class ErpApiClient {
  /**
   * Generates authorization headers required by Frappe Cloud APIs.
   */
  private static getHeaders(): HeadersInit {
    if (!ERPNEXT_API_KEY || !ERPNEXT_API_SECRET) {
      console.warn("[ERP Client] Warning: ERPNext API credentials are not set.");
    }
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `token ${ERPNEXT_API_KEY}:${ERPNEXT_API_SECRET}`
    };
  }

  /**
   * Generic request method with structured error handling.
   */
  static async request<T>(endpoint: string, options: RequestInit = {}, maxRetries: number = 3): Promise<T> {
    const url = `${ERPNEXT_URL}/api/resource/${endpoint}`;
    
    let attempt = 0;
    while (attempt <= maxRetries) {
      try {
        console.log(`[ERP Client] ${options.method || 'GET'} ${url} (Attempt ${attempt + 1})`);
        
        const response = await fetch(url, {
          ...options,
          headers: {
            ...this.getHeaders(),
            ...options.headers,
          },
        });

        if (!response.ok) {
          const errorBody = await response.text();
          console.error(`[ERP Client] Error ${response.status}: ${errorBody}`);
          
          // Don't retry on client errors (4xx) except 429
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
             throw new Error(`ERP API Client Error: ${response.status} - ${errorBody}`);
          }
          
          throw new Error(`ERP API Error: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        attempt++;
        if (attempt > maxRetries) {
          console.error("[ERP Client] Network or Parsing Error (Max Retries Reached):", error);
          throw error;
        }
        
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // max 10s backoff
        console.warn(`[ERP Client] Request failed. Retrying in ${delay}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    
    throw new Error("ERP API Error: Unreachable code");
  }

  /**
   * Validates inbound webhooks from Frappe Cloud using HMAC SHA256.
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!ERPNEXT_WEBHOOK_SECRET) {
      console.error("[ERP Client] Critical: Webhook secret not configured. Failing closed.");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", ERPNEXT_WEBHOOK_SECRET)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
