import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/infrastructure/database/prisma";

if (!process.env.ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL environment variable is required.");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: { role: { include: { permissions: true } } }
        });
        if (dbUser?.role) {
          token.role = { id: dbUser.role.id, name: dbUser.role.name };
          token.permissions = dbUser.role.permissions.map(p => `${p.resource}:${p.action}`);
        } else {
          token.role = undefined;
          token.permissions = [];
        }
      }
      return token;
    },
    session: async ({ session, user, token }) => {
      if (session?.user) {
        if (token) {
          session.user.id = token.id as string;
          session.user.role = token.role as any;
          session.user.permissions = (token.permissions as string[]) || [];
        } else if (user) {
          session.user.id = user.id;
          let dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: { role: { include: { permissions: true } } }
          });

          const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
          if (dbUser && dbUser.email?.toLowerCase() === adminEmail && dbUser.role?.name !== "ADMIN") {
            let adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
            if (!adminRole) {
              adminRole = await prisma.role.create({
                data: { name: "ADMIN", description: "System Administrator", isSystem: true }
              });
            }
            dbUser = await prisma.user.update({
              where: { id: user.id },
              data: { roleId: adminRole.id },
              include: { role: { include: { permissions: true } } }
            });
          }

          if (dbUser?.role) {
            session.user.role = { id: dbUser.role.id, name: dbUser.role.name };
            session.user.permissions = dbUser.role.permissions.map(p => `${p.resource}:${p.action}`);
          } else {
            session.user.role = undefined as any;
            session.user.permissions = [];
          }
        }
      }
      return session;
    },
  },
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/account/login",
  },
};
