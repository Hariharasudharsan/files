import { Logger } from "@/lib/infrastructure/logger";
import { NextResponse } from "next/server";
import { checkApiAdminOrManager } from "@/lib/auth/rbac";
import { SettingsRepository } from "@/lib/repositories/settings-repository";
import { z } from "zod";
import { settingsSchema } from "@/lib/core/domain/schemas/admin";

export async function POST(req: Request) {
  try {
    const auth = await checkApiAdminOrManager();
    if (!auth.authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    const repo = new SettingsRepository();
    const setting = await repo.upsertSetting(data.key, data.value);

    return NextResponse.json(setting, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    Logger.error("[POST /api/admin/settings]", error);
    import("@sentry/nextjs").then(Sentry => Sentry.captureException(error));
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
