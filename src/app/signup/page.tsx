"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase.auth.signUp({
        email,
        password,
      });

      if (err) throw err;
      if (data?.user) {
        router.push("/profile");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred during sign up.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-apple-black min-h-screen text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-apple-darkGray p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block bg-brand-blue text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mx-auto">
            M
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Create Account</h1>
          <p className="text-xs text-apple-lightGray">
            Get started with your custom Apple TV-style streaming profile on Module.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] text-apple-lightGray font-semibold uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-apple-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] text-apple-lightGray font-semibold uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-apple-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-blue transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue hover:bg-blue-600 disabled:bg-brand-blue/50 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-apple-lightGray">
          Already have an account?{" "}
          <Link href="/login" className="text-brand-blue hover:underline font-medium">
            Sign In Instead
          </Link>
        </p>
      </div>
    </div>
  );
}
