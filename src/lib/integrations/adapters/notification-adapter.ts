export interface INotificationAdapter {
  sendEmail(to: string, subject: string, body: string): Promise<boolean>;
  sendSms(to: string, message: string): Promise<boolean>;
  sendWhatsApp(to: string, template: string, data: Record<string, string>): Promise<boolean>;
}
