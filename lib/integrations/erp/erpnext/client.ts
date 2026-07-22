import "server-only";

import { getServerEnv } from "@/lib/config/env";
import type { StorefrontOrder } from "@/lib/domain/models/order";
import type { Product } from "@/lib/domain/models/product";
import {
  mapErpItemToProduct,
  mapOrderToErpSalesOrder,
  type ERPNextItem,
} from "@/lib/integrations/erp/erpnext/mappers";
import { logger } from "@/lib/utils/logger";
import { withRetry } from "@/lib/utils/retry";

interface ERPNextListResponse<T> {
  data: T[];
}

interface ERPNextDocumentResponse<T> {
  data: T;
}

export class ERPNextClient {
  private readonly baseUrl = getServerEnv().erpBaseUrl;
  private readonly token = getServerEnv().erpAuthToken;

  isConfigured(): boolean {
    return Boolean(this.baseUrl && this.token);
  }

  private headers(): HeadersInit {
    if (!this.token) throw new Error("ERP_AUTH_TOKEN is not configured.");

    return {
      Authorization: this.token,
      "Content-Type": "application/json",
    };
  }

  private endpoint(path: string): string {
    if (!this.baseUrl) throw new Error("ERP_BASE_URL is not configured.");
    return `${this.baseUrl}${path}`;
  }

  async fetchVisibleProducts(): Promise<Product[]> {
    if (!this.isConfigured()) {
      logger.warn("ERPNext product fetch skipped because ERP integration is not configured");
      return [];
    }

    const fields = encodeURIComponent(
      JSON.stringify(["name", "item_name", "standard_rate", "image", "description", "item_group"])
    );
    const filters = encodeURIComponent(JSON.stringify([["show_in_website", "=", 1]]));
    const url = this.endpoint(
      `/api/resource/Item?fields=${fields}&filters=${filters}&limit_page_length=0`
    );

    return withRetry(
      async () => {
        const res = await fetch(url, {
          headers: this.headers(),
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`ERPNext GET /Item failed: ${res.status} ${res.statusText}`);
        }

        const json = (await res.json()) as ERPNextListResponse<ERPNextItem>;
        return (json.data ?? []).map((item) => mapErpItemToProduct(item, this.baseUrl));
      },
      { attempts: 3, delayMs: 500, operationName: "erpnext.fetchVisibleProducts" }
    );
  }

  async createSalesOrder(order: StorefrontOrder): Promise<{ name: string }> {
    if (!this.isConfigured()) throw new Error("ERPNext is not configured.");

    const payload = mapOrderToErpSalesOrder(order);

    return withRetry(
      async () => {
        const res = await fetch(this.endpoint("/api/resource/Sales Order"), {
          method: "POST",
          headers: this.headers(),
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`ERPNext POST /Sales Order failed: ${res.status} ${text}`);
        }

        const json = (await res.json()) as ERPNextDocumentResponse<{ name?: string }>;
        return { name: json.data?.name ?? "unknown" };
      },
      { attempts: 3, delayMs: 750, operationName: "erpnext.createSalesOrder" }
    );
  }
}

export const erpNextClient = new ERPNextClient();
