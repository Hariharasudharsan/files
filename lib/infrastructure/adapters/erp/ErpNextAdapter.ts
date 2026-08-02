import { ErpPort, SyncResult } from '../../../core/domain/ports/ErpPort';
import { Order, User } from "@/generated/prisma/client";

export class ErpNextAdapter implements ErpPort {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;

  constructor() {
    this.baseUrl = process.env.ERPNEXT_URL || '';
    this.apiKey = process.env.ERPNEXT_API_KEY || '';
    this.apiSecret = process.env.ERPNEXT_API_SECRET || '';
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `token ${this.apiKey}:${this.apiSecret}`,
    };
  }

  async syncOrder(order: Order): Promise<SyncResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resource/Sales Order`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          customer: order.userId, 
          // Note: Needs mapping of local user to ERP customer name
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return { success: false, error: `ERPNext returned ${response.status}: ${errorData}` };
      }

      const data = await response.json();
      return { success: true, erpId: data.data.name };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async syncCustomer(user: User): Promise<SyncResult> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resource/Customer`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          customer_name: user.name || user.email,
          email_id: user.email,
          mobile_no: user.phone,
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        return { success: false, error: `ERPNext returned ${response.status}: ${errorData}` };
      }

      const data = await response.json();
      return { success: true, erpId: data.data.name };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async checkInventory(sku: string): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/api/resource/Bin?filters=[["item_code", "=", "${sku}"]]&fields=["actual_qty"]`, {
        method: 'GET',
        headers: this.headers,
      });
      if (!response.ok) return 0;
      const data = await response.json();
      if (data.data && data.data.length > 0) {
        return data.data[0].actual_qty;
      }
      return 0;
    } catch {
      return 0;
    }
  }
}
