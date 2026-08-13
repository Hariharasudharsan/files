import type { IRepository } from "./core";
import type { InventorySnapshot } from "@/lib/core/domain/entities/product";

export class InventoryRepository implements IRepository<InventorySnapshot, string> {
  async findById(id: string): Promise<InventorySnapshot | null> {
    return null;
  }
  async findAll(): Promise<InventorySnapshot[]> {
    return [];
  }
  async create(entity: Partial<InventorySnapshot>): Promise<InventorySnapshot> {
    return entity as InventorySnapshot;
  }
  async update(id: string, entity: Partial<InventorySnapshot>): Promise<InventorySnapshot> {
    return entity as InventorySnapshot;
  }
  async delete(id: string): Promise<boolean> {
    return true;
  }
}
