"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { OnThisDay } from "@/components/quotes/OnThisDay";
import type { Quote, Child } from "@/types/database";
import { MessageCircleHeart } from "lucide-react";

export default function FeedPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [filterChild, setFilterChild] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadQuotes = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from("quotes")
      .select("*, children(*), quote_tags(*, tags(*))")
      .eq("is_archived", false)
      .order("said_at", { ascending: false });

    if (filterChild) {
      query = query.eq("child_id", filterChild);
    }

    const { data } = await query;
    if (data) setQuotes(data as unknown as Quote[]);
    setLoading(false);
  }, [filterChild]);

  useEffect(() => {
    async function loadChildren() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.from("children").select("*").order("name");
      if (data) setChildren(data);
    }
    loadChildren();
  }, []);

  useEffect(() => {
    loadQuotes();
  }, [loadQuotes]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Memory Feed</h1>
        <p className="text-[#64748B] text-sm">All the wonderful things your kids have said</p>
      </div>

      {/* On This Day */}
      <OnThisDay />

      {/* Child filter pills */}
      {children.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterChild("")}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !filterChild
                ? "bg-[#6B8F71] text-white"
                : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]"
            }`}
          >
            All
          </button>
          {children.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterChild(c.id)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filterChild === c.id
                  ? "text-white"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
              style={
                filterChild === c.id
                  ? { backgroundColor: c.theme_color }
                  : undefined
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* Quotes */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#6B8F71] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : quotes.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircleHeart className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No quotes yet</h2>
          <p className="text-[#64748B] text-sm">
            Tap the + button to capture your first funny quote!
          </p>
        </div>
      ) : (
        <div className="space-y-4 lg:columns-2 lg:gap-4 lg:space-y-0">
          {quotes.map((q) => (
            <div key={q.id} className="lg:break-inside-avoid lg:mb-4">
              <QuoteCard quote={q} onUpdate={loadQuotes} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
