"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Tv, User } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import Link from "next/link";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", user.id)
          .single();
        if (profile?.display_name) setDisplayName(profile.display_name);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase
        .from("profiles")
        .update({ display_name: displayName.trim() })
        .eq("id", user.id);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-[#64748B] text-sm">Manage your account</p>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Profile */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3 mb-5">
            <User className="w-5 h-5 text-[#6B8F71]" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-[#6B8F71] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5A7D60] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saved ? "Saved ✓" : "Save"}
            </button>
          </form>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
          <h2 className="font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <Link
              href="/tv-mode"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F1F5F9] transition-colors text-sm"
            >
              <Tv className="w-5 h-5 text-[#6B8F71]" />
              TV Display Mode
            </Link>
            <Link
              href="/on-this-day"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#F1F5F9] transition-colors text-sm"
            >
              <span className="text-lg">📅</span>
              On This Day
            </Link>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
