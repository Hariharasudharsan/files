import { Logger } from "@/lib/infrastructure/logger";
import { NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { CatalogService, CreateProductDTO } from "@/lib/core/application/CatalogService";
import { z } from "zod";
import { createProductSchema } from "@/lib/core/domain/schemas/admin";

export async function POST(req: Request) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const body = await req.json();
    const data = createProductSchema.parse(body);

    const result = await CatalogService.createProduct(data as CreateProductDTO);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    Logger.error("[POST /api/admin/products]", error);
    import("@sentry/nextjs").then(Sentry => Sentry.captureException(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
