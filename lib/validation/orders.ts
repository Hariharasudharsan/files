import type { CreateOrderInput, OrderItemInput } from "@/lib/domain/order";
import { fail, ok, type ValidationResult } from "@/lib/validation/result";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseItems(value: unknown, errors: string[]): OrderItemInput[] {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push("Cart is empty.");
    return [];
  }

  return value.flatMap((item, index) => {
    if (!isRecord(item)) {
      errors.push(`Item ${index + 1} is invalid.`);
      return [];
    }

    const itemCode = typeof item.item_code === "string" ? item.item_code.trim() : "";
    const qty = Number(item.qty);
    const rate = Number(item.rate);

    if (!itemCode) errors.push(`Item ${index + 1} is missing an item code.`);
    if (!Number.isFinite(qty) || qty <= 0) errors.push(`Item ${index + 1} quantity is invalid.`);
    if (!Number.isFinite(rate) || rate < 0) errors.push(`Item ${index + 1} rate is invalid.`);

    if (!itemCode || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(rate) || rate < 0) {
      return [];
    }

    return [{ item_code: itemCode, qty, rate }];
  });
}

export function validateCreateOrderPayload(payload: unknown): ValidationResult<CreateOrderInput> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return fail(["Request body must be a JSON object."]);
  }

  const contact = isRecord(payload.contact) ? payload.contact : {};
  const name = typeof contact.name === "string" ? contact.name.trim() : "";
  const email = typeof contact.email === "string" ? contact.email.trim().toLowerCase() : "";
  const address = typeof contact.address === "string" ? contact.address.trim() : "";
  const items = parseItems(payload.items, errors);

  if (!name) errors.push("Name is required.");
  if (!email || !EMAIL_PATTERN.test(email)) errors.push("A valid email is required.");
  if (!address) errors.push("Delivery address is required.");

  if (errors.length > 0) return fail(errors);

  return ok({
    items,
    contact: { name, email, address },
  });
}
