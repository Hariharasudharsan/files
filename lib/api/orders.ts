import type { CreateOrderInput, CreateOrderResult } from "@/lib/domain/order";
import { postJson } from "@/lib/api/http";

export interface CreateOrderResponse extends CreateOrderResult {
  success: true;
}

export function createOrderRequest(input: CreateOrderInput): Promise<CreateOrderResponse> {
  return postJson<CreateOrderResponse, CreateOrderInput>("/api/orders", input);
}
