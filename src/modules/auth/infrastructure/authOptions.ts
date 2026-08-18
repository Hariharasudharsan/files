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
    session: async ({ session, user }) => {
      if (session?.user && user) {
        session.user.id = user.id;
        
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            role: {
              include: { permissions: true }
            }
          }
        });
        
        if (dbUser?.role) {
          session.user.role = {
            id: dbUser.role.id,
            name: dbUser.role.name
          };
          session.user.permissions = dbUser.role.permissions.map(p => `${p.resource}:${p.action}`);
        } else {
          session.user.role = undefined;
          session.user.permissions = [];
        }
      }
      return session;
    },
  },
  session: {
    strategy: "database", // Switched to database for authorization revocation
  },
  pages: {
    signIn: "/account/login",
  },
};
