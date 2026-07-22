import { NextRequest, NextResponse } from "next/server";
import { createSalesOrder } from "@/lib/erpnext";
import type { SalesOrderItemPayload, CheckoutContact } from "@/lib/erpnext";

/**
 * Why this route exists: app/checkout/page.tsx is a Client Component (it
 * needs form state and a loading spinner), so it can never safely hold
 * ERPNEXT_AUTH_TOKEN — any non-NEXT_PUBLIC_ env var referenced in client
 * code is either stripped at build time or, if someone renames it to be
 * public by mistake, shipped in plain text to every visitor's browser.
 *
 * Instead, the checkout page calls this same-origin route with no secrets
 * attached. This Route Handler runs only on the server, where it's safe to
 * import lib/erpnext.ts and use the real ERPNext credentials.
 */

interface OrderRequestBody {
  items: SalesOrderItemPayload[];
  contact: CheckoutContact;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OrderRequestBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }
    if (!body.contact?.name || !body.contact?.email || !body.contact?.address) {
      return NextResponse.json(
        { error: "Name, email and address are required." },
        { status: 400 }
      );
    }

    const order = await createSalesOrder(body.items, body.contact);
    return NextResponse.json({ success: true, order }, { status: 200 });
  } catch (err) {
    console.error("[api/orders] failed:", err);
    return NextResponse.json(
      { error: "Could not place your order right now. Please try again." },
      { status: 502 }
    );
  }
}
