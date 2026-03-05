"use client";

import { useState, useEffect } from "react";
import { Heart, MoreVertical, Edit3, Trash2, Archive, MapPin, Calendar } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { calculateAgeAtDate, formatDate } from "@/lib/utils";
import type { Quote, Attachment } from "@/types/database";
import { QuoteModal } from "./QuoteModal";

interface QuoteCardProps {
  quote: Quote;
  onUpdate?: () => void;
}

export function QuoteCard({ quote, onUpdate }: QuoteCardProps) {
  const [isFav, setIsFav] = useState(quote.is_favorite);
  const [showMenu, setShowMenu] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [bouncing, setBouncing] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [audioUrls, setAudioUrls] = useState<string[]>([]);

  const child = quote.children;
  const age =
    child?.date_of_birth
      ? calculateAgeAtDate(child.date_of_birth, quote.said_at)
      : null;

  useEffect(() => {
    async function loadAttachments() {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase
        .from("attachments")
        .select("*")
        .eq("quote_id", quote.id);
      if (!data || data.length === 0) return;
      setAttachments(data);

      const images: string[] = [];
      const audios: string[] = [];
      for (const att of data) {
        const { data: urlData } = supabase.storage
          .from("attachments")
          .getPublicUrl(att.storage_path);
        if (att.type === "image") {
          images.push(urlData.publicUrl);
        } else if (att.type === "audio") {
          audios.push(urlData.publicUrl);
        }
      }
      setImageUrls(images);
      setAudioUrls(audios);
    }
    loadAttachments();
  }, [quote.id]);

  async function toggleFavorite() {
    const next = !isFav;
    setIsFav(next);
    setBouncing(true);
    setTimeout(() => setBouncing(false), 300);

    const supabase = getSupabaseBrowserClient();
    await supabase.from("quotes").update({ is_favorite: next }).eq("id", quote.id);
  }

  async function handleDelete() {
    if (!confirm("Delete this quote?")) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from("quotes").delete().eq("id", quote.id);
    onUpdate?.();
  }

  async function handleArchive() {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("quotes").update({ is_archived: true }).eq("id", quote.id);
    onUpdate?.();
  }

  const tagNames =
    quote.quote_tags
      ?.map((qt) => qt.tags?.name)
      .filter(Boolean) ?? [];

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group relative">
        {/* Emoji Badge */}
        {quote.emoji && (
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg z-10">
            {quote.emoji}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {child && (
              child.avatar_url ? (
                <img
                  src={child.avatar_url}
                  alt={child.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
              ) : (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: child.theme_color || "#C4B5E0" }}
                >
                  {child.name.charAt(0).toUpperCase()}
                </div>
              )
            )}
            <div>
              <p className="text-sm font-semibold">{child?.name}</p>
              {age && <p className="text-xs text-[#64748B]">Age {age}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleFavorite}
              className={`p-1.5 rounded-lg transition-all ${
                isFav ? "text-[#D4A0A0]" : "text-[#CBD5E1] hover:text-[#D4A0A0]"
              } ${bouncing ? "scale-125" : "scale-100"}`}
            >
              <Heart className={`w-5 h-5 ${isFav ? "fill-current" : ""}`} />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-[#CBD5E1] hover:text-[#64748B] hover:bg-[#F1F5F9] transition-all lg:opacity-0 lg:group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-[#E2E8F0] py-1 w-36 z-10">
                  <button
                    onClick={() => { setShowMenu(false); setShowEdit(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F1F5F9] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" /> Edit
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); handleArchive(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[#F1F5F9] transition-colors"
                  >
                    <Archive className="w-4 h-4" /> Archive
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quote Text */}
        <p className="font-[family-name:var(--font-playfair)] text-xl leading-relaxed text-[#334155] mb-4">
          &ldquo;{quote.quote_text}&rdquo;
        </p>

        {/* Attached Images */}
        {imageUrls.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Attachment ${i + 1}`}
                className="w-24 h-24 object-cover rounded-xl"
              />
            ))}
          </div>
        )}

        {/* Audio Players */}
        {audioUrls.map((url, i) => (
          <div key={i} className="mb-4">
            <audio controls className="w-full h-10 rounded-lg" preload="metadata">
              <source src={url} type="audio/webm" />
            </audio>
          </div>
        ))}

        {/* Context */}
        {quote.context && (
          <p className="text-sm text-[#64748B] mb-3 italic">
            {quote.context}
          </p>
        )}

        {/* Tags */}
        {tagNames.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mb-3">
            {tagNames.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-[#C8956C]/10 text-[#C8956C] px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(quote.said_at)}
          </span>
          {quote.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {quote.location}
            </span>
          )}
        </div>
      </div>

      {showEdit && (
        <QuoteModal
          onClose={() => setShowEdit(false)}
          editQuote={{
            id: quote.id,
            quote_text: quote.quote_text,
            context: quote.context,
            child_id: quote.child_id,
            said_at: quote.said_at,
            location: quote.location,
            emoji: quote.emoji,
            tags: tagNames as string[],
          }}
        />
      )}
    </>
  );
}
