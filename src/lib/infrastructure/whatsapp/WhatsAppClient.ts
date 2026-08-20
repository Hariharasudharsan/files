import { Logger } from "@/lib/infrastructure/logger";
/**
 * Meta Cloud API Client for WhatsApp Business
 */
export class WhatsAppClient {
  private apiVersion = "v18.0";
  private phoneNumberId: string;
  private accessToken: string;
  private baseUrl: string;

  constructor() {
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
    this.baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.phoneNumberId}/messages`;

    if (!this.phoneNumberId || !this.accessToken) {
      Logger.warn("WhatsAppClient: Missing credentials. Messages will not be sent.");
    }
  }

  private get headers() {
    return {
      "Authorization": `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
    };
  }

  /**
   * Sends a pre-approved template message
   */
  async sendTemplateMessage(to: string, templateName: string, languageCode: string = "en", components: any[] = []) {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        components
      }
    };

    return this.post(payload);
  }

  /**
   * Sends a free-form text message (only allowed within a 24h customer service window)
   */
  async sendTextMessage(to: string, text: string) {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text }
    };

    return this.post(payload);
  }

  private async post(payload: any) {
    if (!this.phoneNumberId || !this.accessToken) {
      Logger.info("[WhatsApp Mock] Sending:", JSON.stringify(payload, null, 2));
      return { success: true, mock: true };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`WhatsApp API Error: ${JSON.stringify(data)}`);
      }

      return data;
    } catch (error) {
      Logger.error("[WhatsAppClient] Failed to send message:", error);
      throw error;
    }
  }
}

export const whatsapp = new WhatsAppClient();
