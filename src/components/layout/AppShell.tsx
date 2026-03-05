"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageCircleHeart, Home, Users, Heart, Search, Settings, Tv, Plus, UserPlus } from "lucide-react";
import { useState } from "react";
import { QuoteModal } from "@/components/quotes/QuoteModal";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

const navItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/children", icon: Users, label: "Kids" },
  { href: "/favorites", icon: Heart, label: "Favorites" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/family", icon: UserPlus, label: "Family" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen pb-20 lg:pb-0 lg:pl-64">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:flex-col bg-white/80 backdrop-blur-xl border-r border-[#E2E8F0]/50 z-40">
        <div className="p-6">
          <Link href="/feed" className="flex items-center gap-2 mb-10">
            <MessageCircleHeart className="w-7 h-7 text-[#6B8F71]" />
            <span className="text-xl font-bold">Quiplet</span>
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#6B8F71]/10 text-[#6B8F71]"
                      : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              href="/tv-mode"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/tv-mode"
                  ? "bg-[#6B8F71]/10 text-[#6B8F71]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
              }`}
            >
              <Tv className="w-5 h-5" />
              TV Mode
            </Link>
            <Link
              href="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                pathname === "/settings"
                  ? "bg-[#6B8F71]/10 text-[#6B8F71]"
                  : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]"
              }`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-6">
          <button
            onClick={() => setShowQuoteModal(true)}
            className="w-full bg-[#6B8F71] text-white py-3 rounded-xl font-semibold hover:bg-[#5A7D60] transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Quote
          </button>
          <button
            onClick={handleSignOut}
            className="w-full text-[#64748B] text-sm mt-3 hover:text-[#334155] transition-colors py-2"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-xl border-t border-[#E2E8F0]/50 z-40 safe-area-pb">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
                  isActive ? "text-[#6B8F71]" : "text-[#94A3B8]"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/settings"
            className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-colors ${
              pathname === "/settings" ? "text-[#6B8F71]" : "text-[#94A3B8]"
            }`}
          >
            <Settings className="w-5 h-5" />
            More
          </Link>
        </div>
      </nav>

      {/* FAB for mobile */}
      <button
        onClick={() => setShowQuoteModal(true)}
        className="lg:hidden fixed right-5 bottom-22 z-50 w-14 h-14 bg-[#6B8F71] text-white rounded-full shadow-lg shadow-[#6B8F71]/30 flex items-center justify-center hover:bg-[#5A7D60] active:scale-95 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6">{children}</main>

      {/* Quote Modal */}
      {showQuoteModal && (
        <QuoteModal onClose={() => setShowQuoteModal(false)} />
      )}
    </div>
  );
}
