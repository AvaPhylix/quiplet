"use client";

import { useEffect, useState, useCallback } from "react";
import { Search as SearchIcon } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import type { Quote, Child, Tag } from "@/types/database";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filterChild, setFilterChild] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    async function loadFilters() {
      const supabase = getSupabaseBrowserClient();
      const [c, t] = await Promise.all([
        supabase.from("children").select("*").order("name"),
        supabase.from("tags").select("*").order("name"),
      ]);
      if (c.data) setChildren(c.data);
      if (t.data) setTags(t.data);
    }
    loadFilters();
  }, []);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    const supabase = getSupabaseBrowserClient();

    let dbQuery = supabase
      .from("quotes")
      .select("*, children(*), quote_tags(*, tags(*))")
      .eq("is_archived", false)
      .order("said_at", { ascending: false });

    if (query.trim()) {
      dbQuery = dbQuery.ilike("quote_text", `%${query.trim()}%`);
    }
    if (filterChild) {
      dbQuery = dbQuery.eq("child_id", filterChild);
    }

    const { data } = await dbQuery;
    let results = (data ?? []) as unknown as Quote[];

    // Client-side tag filtering
    if (filterTag) {
      results = results.filter((q) =>
        q.quote_tags?.some((qt) => qt.tag_id === filterTag)
      );
    }

    setQuotes(results);
    setLoading(false);
  }, [query, filterChild, filterTag]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doSearch();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Search</h1>
        <p className="text-[#64748B] text-sm">Find any quote in your collection</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94A3B8]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm shadow-sm"
            placeholder="Search quotes..."
          />
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <select
          value={filterChild}
          onChange={(e) => { setFilterChild(e.target.value); }}
          className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30"
        >
          <option value="">All Kids</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={filterTag}
          onChange={(e) => { setFilterTag(e.target.value); }}
          className="px-4 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30"
        >
          <option value="">All Tags</option>
          {tags.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <button
          onClick={doSearch}
          className="px-5 py-2 bg-[#6B8F71] text-white rounded-xl text-sm font-semibold hover:bg-[#5A7D60] transition-colors"
        >
          Search
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#6B8F71] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : searched && quotes.length === 0 ? (
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No quotes found</h2>
          <p className="text-[#64748B] text-sm">Try different keywords or filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <QuoteCard key={q.id} quote={q} onUpdate={doSearch} />
          ))}
        </div>
      )}
    </div>
  );
}
