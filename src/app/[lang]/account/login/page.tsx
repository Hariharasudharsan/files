"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, KeyRound } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/account" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-surface-900/60 hover:text-surface-950 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Store
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-8 shadow-xl shadow-primary-900/5"
        >
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 text-primary-700">
              <KeyRound className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-surface-950">Welcome Back</h1>
            <p className="mt-2 text-surface-900/60">Sign in to manage your orders</p>
          </div>

          <div className="space-y-6">
            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-6 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...
                </>
              ) : (
                "Continue with Google"
              )}
            </Button>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
