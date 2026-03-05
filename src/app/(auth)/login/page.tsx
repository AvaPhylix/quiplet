"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircleHeart, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 2.58 9 3.58Z" fill="#EA4335"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setError("");
    const supabase = getSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) {
      setError(err.message);
      setGoogleLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      router.push("/feed");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <MessageCircleHeart className="w-8 h-8 text-[#6B8F71]" />
            <span className="text-2xl font-bold">Quiplet</span>
          </Link>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-[#64748B] text-sm mt-1">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full bg-white text-[#334155] py-3 rounded-xl font-semibold border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {googleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <GoogleLogo />
          )}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-[#E2E8F0]" />
          <span className="text-xs text-[#94A3B8] font-medium">or</span>
          <div className="flex-1 h-px bg-[#E2E8F0]" />
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6B8F71] text-white py-3 rounded-xl font-semibold hover:bg-[#5A7D60] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </button>
        </form>

        <p className="text-center text-sm text-[#64748B] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#6B8F71] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
