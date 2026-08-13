import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/infrastructure/database/prisma";

if (!process.env.ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL environment variable is required.");
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      // user is only defined on initial sign in
      if (user) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          include: {
            role: {
              include: { permissions: true }
            }
          }
        });
        
        if (dbUser?.role) {
          token.role = {
            id: dbUser.role.id,
            name: dbUser.role.name
          };
          token.permissions = dbUser.role.permissions.map(p => `${p.resource}:${p.action}`);
        } else {
          token.role = undefined;
          token.permissions = [];
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.role = token.role;
        session.user.permissions = (token.permissions as string[]) || [];
      }
      return session;
    },
  },
  session: {
    strategy: "jwt", // Use JWT to avoid DB lookups on every request
  },
  pages: {
    signIn: "/account/login",
  },
};
