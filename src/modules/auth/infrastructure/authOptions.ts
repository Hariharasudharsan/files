import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/infrastructure/database/prisma";

// Simple in-memory rate limiter for login
const loginAttempts = new Map<string, { count: number, timestamp: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

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
      async authorize(credentials, req) {
        if (!credentials?.email) return null;
        
        // Rate limiting
        const ip = req?.headers?.['x-forwarded-for'] || 'unknown';
        const now = Date.now();
        const attempt = loginAttempts.get(ip) || { count: 0, timestamp: now };
        
        if (now - attempt.timestamp > WINDOW_MS) {
          attempt.count = 1;
          attempt.timestamp = now;
        } else {
          attempt.count += 1;
        }
        
        loginAttempts.set(ip, attempt);
        
        if (attempt.count > MAX_ATTEMPTS) {
          throw new Error("Too many login attempts. Please try again later.");
        }
        
        let user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split('@')[0],
              role: credentials.email.toLowerCase() === 'admin@mathuram.com' ? 'ADMIN' : 'CUSTOMER',
            }
          });
        } else if (credentials.email.toLowerCase() === 'admin@mathuram.com' && user.role !== 'ADMIN') {
          // Ensure existing admin@mathuram.com is promoted if they already logged in before
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
          });
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as any).role || "CUSTOMER";
      }
      return token;
    },
    session: async ({ session, user, token }) => {
      if (session?.user) {
        // When using JWT strategy, user is undefined, we use token.sub
        // When using database strategy, user is populated
        session.user.id = user?.id || (token?.sub as string);
        (session.user as any).role = token?.role || "CUSTOMER";
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
