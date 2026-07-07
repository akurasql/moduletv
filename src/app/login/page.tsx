"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (err) throw err;
      if (data?.user) {
        router.push("/profile");
      }
    } catch (e: any) {
      setError(e.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = () => {
    router.push("/profile");
  };

  return (
    <div className="bg-apple-black min-h-screen text-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-apple-darkGray p-8 rounded-2xl border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <span className="inline-block bg-brand-blue text-white w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg mx-auto">
            M
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight">Sign In to Module</h1>
          <p className="text-xs text-apple-lightGray">
            Access customized watchlists, continue watching progress, and custom profiles.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="relative flex items-center justify-center py-1">
          <div className="absolute inset-0 border-t border-white/5" />
          <span className="relative bg-apple-darkGray px-3 text-[10px] text-apple-lightGray uppercase tracking-wider">
            Or
          </span>
        </div>

        <button
          onClick={handleGuestLogin}
          className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors border border-white/5"
        >
          Explore as Guest (Anonymous Mode)
        </button>

        <p className="text-center text-xs text-apple-lightGray">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-brand-blue hover:underline font-medium">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
