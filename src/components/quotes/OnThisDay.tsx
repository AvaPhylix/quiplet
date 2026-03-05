"use client";

import { useEffect, useState } from "react";
import { CalendarHeart } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Quote } from "@/types/database";
import { calculateAgeAtDate } from "@/lib/utils";

export function OnThisDay() {
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const pattern = `%-${month}-${day}%`;

      const { data } = await supabase
        .from("quotes")
        .select("*, children(*)")
        .like("said_at", pattern)
        .neq("said_at", now.toISOString().slice(0, 10) + "%")
        .order("said_at", { ascending: true });

      // Filter to only quotes from previous years
      const filtered = (data ?? []).filter((q) => {
        const qYear = new Date(q.said_at).getFullYear();
        return qYear < now.getFullYear();
      });

      if (filtered.length > 0) setQuotes(filtered as unknown as Quote[]);
    }
    load();
  }, []);

  if (quotes.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#C8956C]/10 via-[#D4A0A0]/10 to-[#C4B5E0]/10 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <CalendarHeart className="w-5 h-5 text-[#C8956C]" />
        <h3 className="text-sm font-bold text-[#C8956C]">On This Day</h3>
      </div>
      <div className="space-y-3">
        {quotes.map((q) => {
          const child = q.children;
          const year = new Date(q.said_at).getFullYear();
          const age = child?.date_of_birth
            ? calculateAgeAtDate(child.date_of_birth, q.said_at)
            : null;
          return (
            <div key={q.id} className="bg-white/60 rounded-xl p-4">
              <p className="font-[family-name:var(--font-playfair)] text-base italic text-[#334155] mb-2">
                &ldquo;{q.quote_text}&rdquo;
              </p>
              <p className="text-xs text-[#64748B]">
                — {child?.name}{age ? `, age ${age}` : ""} ({year})
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
