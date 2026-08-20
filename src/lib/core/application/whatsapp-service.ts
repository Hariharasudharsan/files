import { whatsapp } from "@/lib/infrastructure/whatsapp/WhatsAppClient";
import { prisma } from "@/lib/infrastructure/database/prisma";

export class WhatsAppService {
  /**
   * Send Order Confirmation Template
   */
  async sendOrderConfirmation(phone: string, orderId: string, customerName: string, amount: number) {
    const templateName = process.env.WHATSAPP_TEMPLATE_ORDER_CONFIRMATION || "whatsapp_order_confirmed";
    
    // Check if enabled in DB
    const tpl = await prisma.notificationTemplate.findFirst({ where: { name: templateName } });
    if (tpl && !tpl.isActive) return;

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

    await whatsapp.sendTemplateMessage(phone, templateName, "en", components);
  }

  /**
   * Send Shipment Update Template
   */
  async sendShipmentUpdate(phone: string, orderId: string, trackingLink: string) {
    const templateName = process.env.WHATSAPP_TEMPLATE_SHIPMENT_UPDATE || "whatsapp_order_shipped";

    const tpl = await prisma.notificationTemplate.findFirst({ where: { name: templateName } });
    if (tpl && !tpl.isActive) return;

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

    await whatsapp.sendTemplateMessage(phone, templateName, "en", components);
  }

  /**
   * Send Order Delivered Template
   */
  async sendOrderDelivered(phone: string, orderId: string) {
    const templateName = "whatsapp_order_delivered";
    const tpl = await prisma.notificationTemplate.findFirst({ where: { name: templateName } });
    if (tpl && !tpl.isActive) return;

    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: orderId }
        ]
      }
    ];

    await whatsapp.sendTemplateMessage(phone, templateName, "en", components);
  }

  /**
   * Send Order Out For Delivery Template
   */
  async sendOrderOFD(phone: string, orderId: string) {
    const templateName = "whatsapp_order_ofd";
    const tpl = await prisma.notificationTemplate.findFirst({ where: { name: templateName } });
    if (tpl && !tpl.isActive) return;

    const components = [
      {
        type: "body",
        parameters: [
          { type: "text", text: orderId }
        ]
      }
    ];

    await whatsapp.sendTemplateMessage(phone, templateName, "en", components);
  }

  /**
   * Send Abandoned Cart Recovery
   */
  async sendAbandonedCartRecovery(phone: string, checkoutUrl: string) {
    const templateName = process.env.WHATSAPP_TEMPLATE_ABANDONED_CART || "abandoned_cart_recovery";
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

    await whatsapp.sendTemplateMessage(phone, templateName, "en", components);
  }
}
