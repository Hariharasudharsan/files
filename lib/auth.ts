import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/infrastructure/database/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma as any) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Demo Login",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "demo@example.com" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
            }
          });
        }

        return { id: user.id, name: user.name, email: user.email };
      }
    })
  ],
  callbacks: {
    session: async ({ session, user, token }) => {
      if (session?.user) {
        // When using JWT strategy, user is undefined, we use token.sub
        // When using database strategy, user is populated
        session.user.id = user?.id || (token?.sub as string);
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
