import "server-only";

import products from "@/data/products.json";
import type { InventorySnapshot, Product } from "@/lib/domain/entities/product";
import { logger } from "@/lib/utils/logger";

const syncedProducts = new Map<string, Product>();
const inventorySnapshots = new Map<string, InventorySnapshot>();

function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const candidate = value as Partial<Product>;
  return (
    typeof candidate.item_code === "string" &&
    typeof candidate.item_name === "string" &&
    typeof candidate.slug === "string" &&
    typeof candidate.standard_rate === "number" &&
    typeof candidate.description === "string" &&
    typeof candidate.item_group === "string" &&
    (typeof candidate.image === "string" || candidate.image === null)
  );
}

export async function listPublishedProducts(): Promise<Product[]> {
  const validProducts = (products as unknown[]).filter(isProduct);

  if (validProducts.length !== (products as unknown[]).length) {
    logger.warn("Some catalog records were skipped because they are invalid");
  }

  const merged = new Map(validProducts.map((product) => [product.item_code, product]));

  for (const product of syncedProducts.values()) {
    const inventory = inventorySnapshots.get(product.item_code);
    merged.set(product.item_code, {
      ...product,
      stock_qty: inventory?.available_qty ?? product.stock_qty,
      updated_at: inventory?.updated_at ?? product.updated_at,
    });
  }

  return [...merged.values()];
}

export async function upsertSyncedProduct(product: Product): Promise<void> {
  syncedProducts.set(product.item_code, product);
}

export async function removeSyncedProduct(itemCode: string): Promise<void> {
  syncedProducts.delete(itemCode);
  inventorySnapshots.delete(itemCode);
}

export async function updateInventorySnapshot(snapshot: InventorySnapshot): Promise<void> {
  inventorySnapshots.set(snapshot.item_code, snapshot);
}
