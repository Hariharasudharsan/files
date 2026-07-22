import "server-only";

import crypto from "crypto";
import { getServerEnv } from "@/lib/config/env";

function normalizeSignature(value: string): string {
  return value.startsWith("sha256=") ? value.slice("sha256=".length) : value;
}

export function verifyErpWebhookSignature(body: string, signature: string | null): boolean {
  const { erpWebhookSecret, nodeEnv } = getServerEnv();

  if (!erpWebhookSecret) return nodeEnv !== "production";
  if (!signature) return false;

  const expected = crypto.createHmac("sha256", erpWebhookSecret).update(body).digest("hex");
  const incoming = normalizeSignature(signature);

  try {
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(incoming, "hex"));
  } catch {
    return false;
  }
}
