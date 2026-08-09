import crypto from "crypto";

/**
 * A strongly-typed wrapper around fetch for communicating with ERPNext/Frappe framework.
 */
export class FrappeClient {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.baseUrl = process.env.ERPNEXT_URL || "http://localhost:8000";
    this.apiKey = process.env.ERPNEXT_API_KEY || "";
    this.apiSecret = process.env.ERPNEXT_API_SECRET || "";

    if (!this.apiKey || !this.apiSecret) {
      console.warn("FrappeClient: ERPNEXT_API_KEY or ERPNEXT_API_SECRET is missing. Sync operations will fail.");
    }
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `token ${this.apiKey}:${this.apiSecret}`,
    };
  }

  /**
   * Helper to construct Frappe REST API URLs
   */
  private url(doctype: string, name?: string) {
    const encodedDoctype = encodeURIComponent(doctype);
    if (name) {
      return `${this.baseUrl}/api/resource/${encodedDoctype}/${encodeURIComponent(name)}`;
    }
    return `${this.baseUrl}/api/resource/${encodedDoctype}`;
  }

  async getDoc(doctype: string, name: string) {
    const res = await fetch(this.url(doctype, name), { headers: this.headers, method: "GET" });
    if (!res.ok) throw new Error(`Failed to GET ${doctype} ${name}: ${await res.text()}`);
    return (await res.json()).data;
  }

  async createDoc(doctype: string, data: any) {
    const payload = { ...data, doctype };
    const res = await fetch(this.url(doctype), { 
      headers: this.headers, 
      method: "POST", 
      body: JSON.stringify(payload)
    });
    
    const resText = await res.text();
    if (!res.ok) {
      throw new Error(`Failed to CREATE ${doctype}: ${resText}`);
    }
    
    return JSON.parse(resText).data;
  }

  async updateDoc(doctype: string, name: string, data: any) {
    const res = await fetch(this.url(doctype, name), {
      headers: this.headers,
      method: "PUT",
      body: JSON.stringify(data)
    });

    const resText = await res.text();
    if (!res.ok) {
      throw new Error(`Failed to UPDATE ${doctype} ${name}: ${resText}`);
    }

    return JSON.parse(resText).data;
  }

  async queryDocs(doctype: string, filters: any, fields = ["name"]) {
    const url = new URL(`${this.baseUrl}/api/resource/${encodeURIComponent(doctype)}`);
    url.searchParams.append("filters", JSON.stringify(filters));
    url.searchParams.append("fields", JSON.stringify(fields));

    const res = await fetch(url.toString(), { headers: this.headers, method: "GET" });
    if (!res.ok) throw new Error(`Failed to QUERY ${doctype}: ${await res.text()}`);
    return (await res.json()).data || [];
  }

  /**
   * Validates inbound webhooks from Frappe Cloud using HMAC SHA256.
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const webhookSecret = process.env.ERPNEXT_WEBHOOK_SECRET || "";
    if (!webhookSecret) {
      console.error("[FrappeClient] Critical: Webhook secret not configured. Failing closed.");
      return false;
    }

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(payload)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}

export const frappe = new FrappeClient();
