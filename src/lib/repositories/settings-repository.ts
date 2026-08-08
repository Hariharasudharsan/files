import { prisma } from "@/lib/infrastructure/database/prisma";
import type { Settings } from "@prisma/client";

export class SettingsRepository {
  async upsertSetting(key: string, value: any): Promise<Settings> {
    return prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  async getSetting(key: string): Promise<Settings | null> {
    return prisma.settings.findUnique({
      where: { key },
    });
  }
}
