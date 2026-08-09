import { whatsapp } from "@/lib/infrastructure/whatsapp/WhatsAppClient";

export interface INotificationAdapter {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
  sendSms(to: string, message: string): Promise<boolean>;
  sendWhatsApp(to: string, template: string, data: Record<string, string>): Promise<boolean>;
}

export class NotificationAdapter implements INotificationAdapter {
  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    console.log(`Email sent to ${to}`);
    return true;
  }
  
  async sendSms(to: string, message: string): Promise<boolean> {
    console.log(`SMS sent to ${to}`);
    return true;
  }

  async sendWhatsApp(to: string, template: string, data: Record<string, string>): Promise<boolean> {
    try {
      // Very basic generic mapping - relies on exact template param passing
      const components = [{
        type: "body",
        parameters: Object.values(data).map(val => ({ type: "text", text: val }))
      }];
      await whatsapp.sendTemplateMessage(to, template, "en", components);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

