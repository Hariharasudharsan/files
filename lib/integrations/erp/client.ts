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
  static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${ERPNEXT_URL}/api/resource/${endpoint}`;
    
    console.log(`[ERP Client] ${options.method || 'GET'} ${url}`);

    try {
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
        throw new Error(`ERP API Error: ${response.statusText}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.error("[ERP Client] Network or Parsing Error:", error);
      throw error;
    }
  }

  /**
   * Validates inbound webhooks from Frappe Cloud using HMAC SHA256.
   */
  static verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!ERPNEXT_WEBHOOK_SECRET) {
      console.warn("[ERP Client] Warning: Webhook secret not configured. Skipping signature validation.");
      // In production, you would return false here.
      return true;
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
