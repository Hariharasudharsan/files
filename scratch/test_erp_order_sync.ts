import { mapPrismaOrderToErpSalesOrder } from "../lib/integrations/erp/erpnext/mappers";
import { processErpSyncJob } from "../lib/integrations/erp/sync-service";

const mockOrder = {
  id: "test-order-123",
  user: {
    email: "test@example.com",
    name: "Test User",
    erpId: "CUST-001"
  },
  items: [
    {
      productVariantId: "ITEM-A",
      qty: 2,
      rate: 150
    },
    {
      productVariantId: "ITEM-B",
      qty: 1,
      rate: 300
    }
  ],
  taxTotal: 45.0,
  shippingTotal: 50.0
};

const payload = mapPrismaOrderToErpSalesOrder(mockOrder, mockOrder.user.erpId);
console.log(JSON.stringify(payload, null, 2));
