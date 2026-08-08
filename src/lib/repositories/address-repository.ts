import type { IRepository } from "./core";
import type { Address } from "@/lib/domain/entities/commerce";

export class AddressRepository implements IRepository<Address, string> {
  async findById(id: string): Promise<Address | null> { return null; }
  async findAll(): Promise<Address[]> { return []; }
  async create(entity: Partial<Address>): Promise<Address> { return entity as Address; }
  async update(id: string, entity: Partial<Address>): Promise<Address> { return entity as Address; }
  async delete(id: string): Promise<boolean> { return true; }
}
