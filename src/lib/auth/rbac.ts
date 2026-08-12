import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/auth/infrastructure/authOptions";
import { redirect } from "next/navigation";

export async function requireAdminOrManager() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/account/login");
  }

  const roleName = session.user.role?.name;
  
  if (roleName !== "ADMIN" && roleName !== "MANAGER") {
    redirect("/account/login?error=AccessDenied");
  }

  return session.user;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/account/login");
  }

  const roleName = session.user.role?.name;
  
  if (roleName !== "ADMIN") {
    redirect("/account/login?error=AccessDenied");
  }

  return session.user;
}

/**
 * Checks if the user has a specific permission.
 * ADMIN role bypasses permission checks (has full access).
 */
export function hasPermission(session: any, resource: string, action: string = "read") {
  const user = session?.user;
  if (!user) return false;

  const roleName = user.role?.name;
  if (roleName === "ADMIN") return true;

  const permissions = user.permissions || [];
  return permissions.includes(`${resource}:${action}`) || permissions.includes(`all:manage`);
}

export async function requirePermission(resource: string, action: string = "read") {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/account/login");
  }

  if (!hasPermission(session, resource, action)) {
    redirect("/account/login?error=AccessDenied");
  }

  return session.user;
}
