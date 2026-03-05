"use client";

import { useEffect, useState, useCallback } from "react";
import { Search as SearchIcon } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { QuoteCard } from "@/components/quotes/QuoteCard";
import { ExportPDFButton } from "@/components/pdf/ExportPDFButton";
import type { Quote, Child, Tag } from "@/types/database";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [children, setChildren] = useState<Child[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filterChild, setFilterChild] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
      .select("*, children(*), quote_tags(*, tags(*)), attachments(*)")
      .eq("is_archived", false)
      .order("said_at", { ascending: false });

    if (query.trim()) {
      dbQuery = dbQuery.ilike("quote_text", `%${query.trim()}%`);
    }
    if (filterChild) {
      dbQuery = dbQuery.eq("child_id", filterChild);
    }
    if (dateFrom) {
      dbQuery = dbQuery.gte("said_at", new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      // End of day
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      dbQuery = dbQuery.lte("said_at", endDate.toISOString());
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
  }, [query, filterChild, filterTag, dateFrom, dateTo]);

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

      {/* Child Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
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
        <button
          onClick={doSearch}
          className="px-5 py-2 bg-[#6B8F71] text-white rounded-xl text-sm font-semibold hover:bg-[#5A7D60] transition-colors"
        >
          Search
        </button>
      </div>

      {/* Tag Carousel */}
      {tags.length > 0 && (
        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilterTag("")}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !filterTag
                  ? "bg-[#C8956C] text-white"
                  : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
            >
              All Tags
            </button>
            {tags.map((t) => (
              <button
                key={t.id}
                onClick={() => setFilterTag(filterTag === t.id ? "" : t.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filterTag === t.id
                    ? "bg-[#C8956C] text-white"
                    : "bg-white text-[#64748B] border border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Date Range Picker */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#64748B]">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#64748B]">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E2E8F0] bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71]"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="px-3 py-2 text-sm text-[#64748B] hover:text-[#334155] transition-colors"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Results Header */}
      {searched && quotes.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[#64748B]">{quotes.length} quote{quotes.length !== 1 ? "s" : ""} found</p>
          <ExportPDFButton quotes={quotes} />
        </div>
      )}

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
