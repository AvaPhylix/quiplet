"use client";

import { useEffect, useState } from "react";
import { CalendarHeart } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import type { Quote } from "@/types/database";

export default function OnThisDayPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const pattern = `%-${month}-${day}%`;

      const { data } = await supabase
        .from("quotes")
        .select("*, children(*), quote_tags(*, tags(*))")
        .like("said_at", pattern)
        .order("said_at", { ascending: true });

      const filtered = (data ?? []).filter((q) => {
        const qYear = new Date(q.said_at).getFullYear();
        return qYear < now.getFullYear();
      });

      setQuotes(filtered as unknown as Quote[]);
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <CalendarHeart className="w-7 h-7 text-[#C8956C]" />
          <h1 className="text-2xl font-bold">On This Day</h1>
        </div>
        <p className="text-[#64748B] text-sm">
          Quotes from {today} in previous years
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#C8956C] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20">
          <CalendarHeart className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Nothing on this day yet</h2>
          <p className="text-[#64748B] text-sm">
            Check back on dates when you&apos;ve captured quotes in past years!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => {
            const year = new Date(q.said_at).getFullYear();
            return (
              <div key={q.id}>
                <p className="text-xs font-bold text-[#C8956C] mb-2">{year}</p>
                <QuoteCard quote={q} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
