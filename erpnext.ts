import "server-only";
// ^ Guarantees this module — and the secret ERPNEXT_AUTH_TOKEN it reads —
//   can never end up in a Client Component bundle. If any "use client"
//   file ever imports this by mistake, the build fails loudly instead of
//   silently shipping your ERPNext API secret to every visitor's browser.
//   That's why product-fetching happens in a Server Component (app/page.tsx)
//   and order creation happens behind a Route Handler (app/api/orders) —
//   see the comments there for how the client talks to this file indirectly.

const ERP_URL = process.env.NEXT_PUBLIC_ERPNEXT_URL;
const ERP_TOKEN = process.env.ERPNEXT_AUTH_TOKEN; // format: "token API_KEY:API_SECRET"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Raw shape returned by ERPNext's `/api/resource/Item` list endpoint. */
export interface ERPNextItem {
  name: string; // Frappe's primary key — the real Item Code, used in orders
  item_name: string; // human-readable display label
  standard_rate: number;
  image: string | null;
  description: string | null;
  item_group: string;
}

/** Cleaned-up product shape used everywhere in the storefront. */
export interface Product {
  item_code: string;
  item_name: string;
  standard_rate: number;
  image: string | null;
  description: string;
  item_group: string;
}

export interface SalesOrderItemPayload {
  item_code: string;
  qty: number;
  rate: number;
}

/** The exact payload shape ERPNext's Sales Order endpoint expects. */
export interface SalesOrderPayload {
  customer: string;
  items: SalesOrderItemPayload[];
  customer_name?: string;
  contact_email?: string;
  [key: string]: unknown; // room for site-specific custom fields
}

export interface CheckoutContact {
  name: string;
  email: string;
  address: string;
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

function assertConfigured(): void {
  if (!ERP_URL) throw new Error("NEXT_PUBLIC_ERPNEXT_URL is not set.");
  if (!ERP_TOKEN) throw new Error("ERPNEXT_AUTH_TOKEN is not set.");
}

function authHeaders(): HeadersInit {
  return {
    Authorization: ERP_TOKEN ?? "",
    "Content-Type": "application/json",
  };
}

/** ERPNext often returns image paths relative to the site root (e.g. "/files/x.jpg"). */
export function resolveImageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${ERP_URL ?? ""}${path}`;
}

function mapItem(raw: ERPNextItem): Product {
  return {
    item_code: raw.name,
    item_name: raw.item_name,
    standard_rate: raw.standard_rate ?? 0,
    image: raw.image ? resolveImageUrl(raw.image) : null,
    // ERPNext description fields are usually rich-text HTML from the desk
    // editor — strip tags so card copy renders as clean plain text.
    description: raw.description?.replace(/<[^>]*>/g, "").trim() || "",
    item_group: raw.item_group,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch every website-visible Item from ERPNext.
 *
 * Never throws — on any failure (backend down, bad config, network error)
 * it logs and returns an empty array, so an ERPNext outage degrades the
 * storefront to an empty-state message instead of crashing the page.
 */
export async function getProducts(): Promise<Product[]> {
  try {
    assertConfigured();

    const fields = encodeURIComponent(
      JSON.stringify(["name", "item_name", "standard_rate", "image", "description", "item_group"])
    );
    const filters = encodeURIComponent(JSON.stringify([["show_in_website", "=", 1]]));
    // Frappe's REST list endpoint defaults limit_page_length to 20 records.
    // limit_page_length=0 is a documented Frappe convention meaning
    // "no limit" — without it, only the first 20 products would ever
    // show up in the storefront once the catalog grows past that.
    const url = `${ERP_URL}/api/resource/Item?fields=${fields}&filters=${filters}&limit_page_length=0`;

    const res = await fetch(url, {
      headers: authHeaders(),
      next: { revalidate: 3600 }, // ISR — re-fetch from ERPNext at most once/hour
    });

    if (!res.ok) {
      throw new Error(`ERPNext GET /Item failed: ${res.status} ${res.statusText}`);
    }

    const json = (await res.json()) as { data: ERPNextItem[] };
    return (json.data ?? []).map(mapItem);
  } catch (err) {
    console.error("[erpnext] getProducts() failed:", err);
    return [];
  }
}

/**
 * Create a Sales Order in ERPNext for a completed checkout.
 *
 * Unlike getProducts(), this throws on failure — a failed order must
 * surface as an error to the checkout UI, never fail silently.
 */
export async function createSalesOrder(
  cartItems: SalesOrderItemPayload[],
  contact: CheckoutContact
): Promise<{ name: string }> {
  assertConfigured();

  const payload: SalesOrderPayload = {
    // Required structure per your ERPNext setup.
    customer: "Website Walk-in",
    items: cartItems,
    // Best-effort contact capture. Stock Sales Order doesn't have a
    // free-text delivery-address field — `customer_address` / `contact_person`
    // are Link fields that expect an existing Address/Contact record. In
    // production, create or look up that Address first (POST
    // /api/resource/Address) and link it here. For now, name + email are
    // passed through as plain fields (harmless if unrecognized by your
    // Sales Order doctype) so nothing the shopper typed is silently dropped;
    // the full address is included in `contact` if you wire up a custom
    // field or a separate Address/Contact creation step.
    customer_name: contact.name,
    contact_email: contact.email,
  };

  const res = await fetch(`${ERP_URL}/api/resource/Sales Order`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`ERPNext POST /Sales Order failed: ${res.status} ${text}`);
  }

  const json = await res.json();
  return { name: json.data?.name ?? "unknown" };
}
