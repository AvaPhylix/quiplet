"use client";

import { useEffect, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { calculateAgeAtDate } from "@/lib/utils";
import type { Quote } from "@/types/database";
import Link from "next/link";

const BG_COLORS = [
  "from-[#6B8F71]/20 to-[#A8D8EA]/20",
  "from-[#D4A0A0]/20 to-[#C4B5E0]/20",
  "from-[#C8956C]/20 to-[#F5C3A8]/20",
  "from-[#A8D8EA]/20 to-[#B5E5CF]/20",
  "from-[#C4B5E0]/20 to-[#D4A0A0]/20",
];

export default function TvModePage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("quotes")
        .select("*, children(*)")
        .eq("is_favorite", true)
        .eq("is_archived", false)
        .order("said_at", { ascending: false })
        .limit(50);
      if (data && data.length > 0) {
        setQuotes(data as unknown as Quote[]);
      } else {
        // Fall back to all quotes
        const { data: all } = await supabase
          .from("quotes")
          .select("*, children(*)")
          .eq("is_archived", false)
          .order("said_at", { ascending: false })
          .limit(50);
        if (all) setQuotes(all as unknown as Quote[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % quotes.length);
  }, [quotes.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + quotes.length) % quotes.length);
  }, [quotes.length]);

  useEffect(() => {
    if (!playing || quotes.length === 0) return;
    const timer = setInterval(next, 8000);
    return () => clearInterval(timer);
  }, [playing, quotes.length, next]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === "Escape") window.history.back();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [next, prev]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#FAFAF9] flex items-center justify-center z-[100]">
        <div className="w-10 h-10 border-2 border-[#6B8F71] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold mb-2">No quotes for slideshow</h2>
        <p className="text-[#64748B] text-sm mb-4">Add some quotes first, then come back!</p>
        <Link href="/feed" className="text-[#6B8F71] font-medium hover:underline">
          Go to Feed
        </Link>
      </div>
    );
  }

  const quote = quotes[current];
  const child = quote.children;
  const age = child?.date_of_birth
    ? calculateAgeAtDate(child.date_of_birth, quote.said_at)
    : null;
  const bg = BG_COLORS[current % BG_COLORS.length];

  return (
    <div className={`fixed inset-0 bg-gradient-to-br ${bg} bg-[#FAFAF9] flex items-center justify-center z-[100] cursor-none group`}>
      {/* Close */}
      <Link
        href="/feed"
        className="absolute top-6 right-6 p-2 rounded-full bg-white/60 backdrop-blur text-[#64748B] hover:bg-white/80 transition opacity-0 group-hover:opacity-100 z-10"
      >
        <X className="w-5 h-5" />
      </Link>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition z-10">
        <button onClick={prev} className="p-3 rounded-full bg-white/60 backdrop-blur hover:bg-white/80 transition">
          <ChevronLeft className="w-5 h-5 text-[#334155]" />
        </button>
        <button onClick={() => setPlaying((p) => !p)} className="p-3 rounded-full bg-white/60 backdrop-blur hover:bg-white/80 transition">
          {playing ? <Pause className="w-5 h-5 text-[#334155]" /> : <Play className="w-5 h-5 text-[#334155]" />}
        </button>
        <button onClick={next} className="p-3 rounded-full bg-white/60 backdrop-blur hover:bg-white/80 transition">
          <ChevronRight className="w-5 h-5 text-[#334155]" />
        </button>
        <span className="text-sm text-[#64748B] ml-2">
          {current + 1} / {quotes.length}
        </span>
      </div>

      {/* Quote Display */}
      <div className="max-w-3xl mx-auto px-8 text-center">
        <p className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl leading-snug text-[#334155] mb-8">
          &ldquo;{quote.quote_text}&rdquo;
        </p>
        <div className="flex items-center justify-center gap-3">
          {child && (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: child.theme_color || "#C4B5E0" }}
            >
              {child.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="text-left">
            <p className="font-semibold text-[#334155]">{child?.name}</p>
            {age && <p className="text-sm text-[#64748B]">Age {age}</p>}
          </div>
        </div>
        {quote.context && (
          <p className="text-[#64748B] mt-4 italic text-sm">{quote.context}</p>
        )}
      </div>
    </div>
  );
}
