"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Child, Tag } from "@/types/database";

interface QuoteModalProps {
  onClose: () => void;
  editQuote?: {
    id: string;
    quote_text: string;
    context: string | null;
    child_id: string;
    said_at: string;
    location: string | null;
    emoji: string | null;
    tags?: string[];
  };
}

export function QuoteModal({ onClose, editQuote }: QuoteModalProps) {
  const [children, setChildren] = useState<Child[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [quoteText, setQuoteText] = useState(editQuote?.quote_text ?? "");
  const [context, setContext] = useState(editQuote?.context ?? "");
  const [childId, setChildId] = useState(editQuote?.child_id ?? "");
  const [saidAt, setSaidAt] = useState(
    editQuote?.said_at
      ? new Date(editQuote.said_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState(editQuote?.location ?? "");
  const [selectedTags, setSelectedTags] = useState<string[]>(editQuote?.tags ?? []);
  const [newTag, setNewTag] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      const supabase = getSupabaseBrowserClient();
      const [childRes, tagRes] = await Promise.all([
        supabase.from("children").select("*").order("name"),
        supabase.from("tags").select("*").order("name"),
      ]);
      if (childRes.data) setChildren(childRes.data);
      if (tagRes.data) setTags(tagRes.data);
      if (!editQuote && childRes.data?.length === 1) {
        setChildId(childRes.data[0].id);
      }
    }
    loadData();
  }, [editQuote]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quoteText.trim() || !childId) return;
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();

    try {
      const quoteData = {
        quote_text: quoteText.trim(),
        context: context.trim() || null,
        child_id: childId,
        said_at: new Date(saidAt).toISOString(),
        location: location.trim() || null,
      };

      let quoteId = editQuote?.id;

      if (editQuote) {
        const { error: err } = await supabase
          .from("quotes")
          .update(quoteData)
          .eq("id", editQuote.id);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase
          .from("quotes")
          .insert(quoteData)
          .select("id")
          .single();
        if (err) throw err;
        quoteId = data.id;
      }

      // Handle tags
      if (quoteId) {
        await supabase.from("quote_tags").delete().eq("quote_id", quoteId);

        for (const tagName of selectedTags) {
          let tag = tags.find((t) => t.name === tagName);
          if (!tag) {
            const { data } = await supabase
              .from("tags")
              .insert({ name: tagName })
              .select()
              .single();
            if (data) tag = data;
          }
          if (tag) {
            await supabase
              .from("quote_tags")
              .insert({ quote_id: quoteId, tag_id: tag.id });
          }
        }
      }

      onClose();
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  function addTag() {
    const trimmed = newTag.trim().toLowerCase();
    if (trimmed && !selectedTags.includes(trimmed)) {
      setSelectedTags([...selectedTags, trimmed]);
    }
    setNewTag("");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#F1F5F9] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-lg font-bold">
            {editQuote ? "Edit Quote" : "New Quote"}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F1F5F9] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[#64748B]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5">
              What did they say? <span className="text-[#D4A0A0]">*</span>
            </label>
            <textarea
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-base font-[family-name:var(--font-playfair)] italic resize-none"
              placeholder="Type the quote here..."
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Context</label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              placeholder="What was happening? (e.g., at dinner, in the bath)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Who said it? <span className="text-[#D4A0A0]">*</span>
              </label>
              <select
                value={childId}
                onChange={(e) => setChildId(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              >
                <option value="">Select child</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">When?</label>
              <input
                type="datetime-local"
                value={saidAt}
                onChange={(e) => setSaidAt(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              placeholder="Kitchen, park, car..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Tags</label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {selectedTags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-[#C8956C]/15 text-[#C8956C] px-3 py-1.5 rounded-full"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => setSelectedTags(selectedTags.filter((s) => s !== t))}
                    className="hover:text-[#A0734A]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                list="tag-suggestions"
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
                placeholder="Add a tag..."
              />
              <datalist id="tag-suggestions">
                {tags
                  .filter((t) => !selectedTags.includes(t.name))
                  .map((t) => (
                    <option key={t.id} value={t.name} />
                  ))}
              </datalist>
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2.5 text-sm font-medium bg-[#F1F5F9] rounded-xl hover:bg-[#E2E8F0] transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || !quoteText.trim() || !childId}
            className="w-full bg-[#6B8F71] text-white py-3.5 rounded-xl font-semibold hover:bg-[#5A7D60] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {editQuote ? "Save Changes" : "Save Quote"}
          </button>
        </form>
      </div>
    </div>
  );
}
