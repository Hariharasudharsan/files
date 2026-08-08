import { fail, ok, type ValidationResult } from "@/lib/validation/result";

export type ErpWebhookEntity = "product" | "inventory" | "customer" | "order";
export type ErpWebhookAction = "created" | "updated" | "deleted" | "submitted" | "cancelled";

export interface ErpWebhookEvent {
  entity: ErpWebhookEntity;
  action: ErpWebhookAction;
  payload: Record<string, unknown>;
  event_id?: string;
  occurred_at: string;
}

const ENTITIES: ErpWebhookEntity[] = ["product", "inventory", "customer", "order"];
const ACTIONS: ErpWebhookAction[] = ["created", "updated", "deleted", "submitted", "cancelled"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateErpWebhookPayload(payload: unknown): ValidationResult<ErpWebhookEvent> {
  if (!isRecord(payload)) {
    return fail(["Webhook payload must be a JSON object."]);
  }

  const errors: string[] = [];
  const entity = payload.entity;
  const action = payload.action;
  const eventPayload = payload.payload;

  if (typeof entity !== "string" || !ENTITIES.includes(entity as ErpWebhookEntity)) {
    errors.push("Webhook entity must be product, inventory, customer, or order.");
  }

  if (typeof action !== "string" || !ACTIONS.includes(action as ErpWebhookAction)) {
    errors.push("Webhook action is invalid.");
  }

  if (!isRecord(eventPayload)) {
    errors.push("Webhook payload.data must be an object.");
  }

  if (errors.length > 0) return fail(errors);

  return ok({
    entity: entity as ErpWebhookEntity,
    action: action as ErpWebhookAction,
    payload: eventPayload as Record<string, unknown>,
    event_id: typeof payload.event_id === "string" ? payload.event_id : undefined,
    occurred_at:
      typeof payload.occurred_at === "string" ? payload.occurred_at : new Date().toISOString(),
  });
}
