import type { CreateOrderInput, OrderItemInput } from "@/lib/core/domain/entities/order";
import { fail, ok, type ValidationResult } from "@/lib/validation/result";
import { sanitizeInput } from "@/lib/core/security/sanitizer";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[A-Za-z\s]+$/;
const PHONE_PATTERN = /^[0-9]{10}$/;
const PINCODE_PATTERN = /^[0-9]{6}$/;

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

    if (!itemCode) errors.push(`Item ${index + 1} is missing an item code.`);
    if (!Number.isFinite(qty) || qty <= 0) errors.push(`Item ${index + 1} quantity is invalid.`);

    if (!itemCode || !Number.isFinite(qty) || qty <= 0) {
      return [];
    }

    return [{ productVariantId: itemCode, qty }];
  });
}

export function validateCreateOrderPayload(payload: unknown): ValidationResult<CreateOrderInput> {
  const errors: string[] = [];

  if (!isRecord(payload)) {
    return fail(["Request body must be a JSON object."]);
  }

  const contact = isRecord(payload.contact) ? payload.contact : {};
  
  const name = sanitizeInput(contact.name as string);
  const email = typeof contact.email === "string" ? contact.email.trim().toLowerCase() : "";
  const phone = sanitizeInput(contact.phone as string);
  const flatOrHouseNumber = sanitizeInput(contact.flatOrHouseNumber as string);
  const localityOrArea = sanitizeInput(contact.localityOrArea as string);
  const landmark = sanitizeInput(contact.landmark as string);
  const city = sanitizeInput(contact.city as string);
  const state = sanitizeInput(contact.state as string);
  const pincode = sanitizeInput(contact.pincode as string);
  const whatsappOptIn = contact.whatsappOptIn === true;
  
  const paymentMethod = typeof payload.paymentMethod === "string" ? payload.paymentMethod.trim() : undefined;
  const couponCode = typeof payload.couponCode === "string" ? payload.couponCode.trim() : undefined;
  
  const items = parseItems(payload.items, errors);

  if (!name || name.length < 3 || name.length > 50 || !NAME_PATTERN.test(name)) {
    errors.push("Name must be 3-50 characters long and contain only letters and spaces.");
  }
  
  if (!email || !EMAIL_PATTERN.test(email)) {
    errors.push("A valid email is required.");
  }

  if (!phone || !PHONE_PATTERN.test(phone)) {
    errors.push("A valid 10-digit Indian mobile number is required.");
  }

  if (!flatOrHouseNumber || flatOrHouseNumber.length < 1 || flatOrHouseNumber.length > 50) {
    errors.push("Flat/House number is required and must be under 50 characters.");
  }

  if (!localityOrArea || localityOrArea.length < 3 || localityOrArea.length > 100) {
    errors.push("Locality/Area is required and must be between 3 and 100 characters.");
  }

  if (landmark && landmark.length > 100) {
    errors.push("Landmark must be under 100 characters.");
  }

  if (!city || city.length < 2) {
    errors.push("City is required.");
  }

  if (!state || state.length < 2) {
    errors.push("State is required.");
  }

  if (!pincode || !PINCODE_PATTERN.test(pincode)) {
    errors.push("A valid 6-digit PIN code is required.");
  }

  if (errors.length > 0) return fail(errors);

  return ok({
    items,
    contact: { name, email, phone, flatOrHouseNumber, localityOrArea, landmark, city, state, pincode, whatsappOptIn },
    paymentMethod,
    couponCode,
  });
}
