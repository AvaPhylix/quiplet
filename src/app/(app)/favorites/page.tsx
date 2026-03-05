"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import type { Quote } from "@/types/database";
import { Heart, FileDown } from "lucide-react";

export default function FavoritesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("quotes")
      .select("*, children(*), quote_tags(*, tags(*))")
      .eq("is_favorite", true)
      .eq("is_archived", false)
      .order("said_at", { ascending: false });
    if (data) setQuotes(data as unknown as Quote[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Favorites</h1>
          <p className="text-[#64748B] text-sm">Your Hall of Fame quotes</p>
        </div>
        {quotes.length > 0 && (
          <button
            onClick={async () => {
              const { exportQuotesPDF } = await import("@/lib/export-pdf");
              exportQuotesPDF(quotes);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#6B8F71] hover:bg-[#6B8F71]/5 rounded-xl transition-colors"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#D4A0A0] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No favorites yet</h2>
          <p className="text-[#64748B] text-sm">
            Heart your best quotes to add them here.
          </p>
        </div>
      ) : (
        <div className="space-y-4 lg:columns-2 lg:gap-4 lg:space-y-0">
          {quotes.map((q) => (
            <div key={q.id} className="lg:break-inside-avoid lg:mb-4">
              <QuoteCard quote={q} onUpdate={loadFavorites} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
