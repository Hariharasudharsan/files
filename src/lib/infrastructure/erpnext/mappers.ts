/**
 * Maps Storefront (Prisma) models to ERPNext DocType representations
 */
import { Order, OrderItem, User } from "@prisma/client";

export function mapCustomer(user: User) {
  return {
    customer_name: user.name || user.email?.split("@")[0] || "Guest Customer",
    customer_type: user.isB2B ? "Company" : "Individual",
    customer_group: "Commercial", 
    territory: "All Territories",
    email_id: user.email,
    mobile_no: user.phone,
  };
}

export function mapSalesOrder(order: Order, items: OrderItem[], erpCustomerName: string) {
  return {
    customer: erpCustomerName,
    po_no: order.id,
    po_date: order.createdAt.toISOString().split("T")[0],
    order_type: "Sales",
    items: items.map(item => ({
      item_code: item.productVariantId, // Assuming itemCode maps to variantId or actual ERP itemCode
      qty: item.qty,
      rate: Number(item.rate),
      warehouse: "Stores - MF", // Default warehouse
    })),
    // Status handling (1 = Submit, 0 = Draft)
    docstatus: 1, 
    // Auto-create delivery and invoice if payment is captured? Handled via standard ERPNext workflows ideally,
    // but we'll just submit the SO.
  };
}

export function mapPaymentEntry(order: Order, amount: number, transactionId: string, erpCustomerName: string) {
  return {
    payment_type: "Receive",
    party_type: "Customer",
    party: erpCustomerName,
    paid_to: "Cash - MF", // Or Bank account mapped
    paid_amount: amount,
    received_amount: amount,
    reference_no: transactionId,
    reference_date: new Date().toISOString().split("T")[0],
    docstatus: 1, // Submit automatically
  };
}
