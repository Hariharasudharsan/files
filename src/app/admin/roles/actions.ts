"use server";

import { prisma } from "@/lib/infrastructure/database/prisma";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth/rbac";

export async function createRole(name: string, description: string) {
  await requirePermission("roles", "manage");
  
  await prisma.role.create({
    data: {
      name,
      description,
      isSystem: false,
    }
  });

  revalidatePath("/admin/roles");
}

export async function deleteRole(roleId: string) {
  await requirePermission("roles", "manage");

  const role = await prisma.role.findUnique({ where: { id: roleId } });
  if (!role || role.isSystem) {
    throw new Error("Cannot delete system roles");
  }

  await prisma.role.delete({ where: { id: roleId } });
  revalidatePath("/admin/roles");
}
