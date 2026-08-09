import { whatsapp } from "@/lib/infrastructure/whatsapp/WhatsAppClient";

export class WhatsAppService {
  /**
   * Send Order Confirmation Template
   */
  async sendOrderConfirmation(phone: string, orderId: string, customerName: string, amount: number) {
    // Requires a pre-approved template in Meta Business Manager named 'order_confirmation'
    // with parameters: {{1}} Name, {{2}} OrderID, {{3}} Amount
    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: customerName },
          { type: "text", text: orderId },
          { type: "text", text: `₹${amount.toFixed(2)}` }
        ]
      }
    ];

    await whatsapp.sendTemplateMessage(phone, "order_confirmation", "en", components);
  }

  /**
   * Send Shipment Update Template
   */
  async sendShipmentUpdate(phone: string, orderId: string, trackingLink: string) {
    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: orderId }
        ]
      },
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          { type: "text", text: trackingLink }
        ]
      }
    ];

    await whatsapp.sendTemplateMessage(phone, "shipment_update", "en", components);
  }

  /**
   * Send Abandoned Cart Recovery
   */
  async sendAbandonedCartRecovery(phone: string, checkoutUrl: string) {
    const components = [
      {
        type: "button",
        sub_type: "url",
        index: "0",
        parameters: [
          { type: "text", text: checkoutUrl }
        ]
      }
    ];

    await whatsapp.sendTemplateMessage(phone, "abandoned_cart_recovery", "en", components);
  }
}
