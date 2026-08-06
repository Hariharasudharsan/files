import { getServerSession } from "next-auth";
import { authOptions } from "@/src/modules/auth/infrastructure/authOptions";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function requireAdminOrManager() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/account/login");
  }

  const role = session.user.role as Role;
  
  if (role !== "ADMIN" && role !== "MANAGER") {
    redirect("/account/login?error=AccessDenied");
  }

  return session.user;
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect("/account/login");
  }

  const role = session.user.role as Role;
  
  if (role !== "ADMIN") {
    redirect("/account/login?error=AccessDenied");
  }

  return session.user;
}

export function hasPermission(userRole: string, requiredRole: "ADMIN" | "MANAGER" | "CUSTOMER") {
  if (userRole === "ADMIN") return true;
  if (userRole === "MANAGER" && (requiredRole === "MANAGER" || requiredRole === "CUSTOMER")) return true;
  if (userRole === "CUSTOMER" && requiredRole === "CUSTOMER") return true;
  return false;
}
