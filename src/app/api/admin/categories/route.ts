import { Logger } from "@/lib/infrastructure/logger";
import { NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { CategoryRepository } from "@/lib/repositories/category-repository";
import { z } from "zod";
import { createCategorySchema } from "@/lib/core/domain/schemas/admin";

export async function POST(req: Request) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const body = await req.json();
    const data = createCategorySchema.parse(body);

    const repo = new CategoryRepository();
    const category = await repo.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    Logger.error("[POST /api/admin/categories]", error);
    import("@sentry/nextjs").then(Sentry => Sentry.captureException(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
