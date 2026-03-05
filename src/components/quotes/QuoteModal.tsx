"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Loader2, ImagePlus, Check } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { AudioRecorder } from "./AudioRecorder";
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
  const [showSuccess, setShowSuccess] = useState(false);

  // Image uploads
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio recording
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

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

  const handleImageFiles = useCallback((files: FileList | File[]) => {
    const newFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (newFiles.length === 0) return;
    setImageFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  function removeImage(index: number) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      handleImageFiles(e.dataTransfer.files);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quoteText.trim() || !childId) return;
    setSaving(true);
    setError("");

    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
          .insert({ ...quoteData, user_id: user.id })
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
              .insert({ name: tagName, user_id: user.id })
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

        // Upload images
        for (const file of imageFiles) {
          const ext = file.name.split(".").pop() || "jpg";
          const path = `${user.id}/${quoteId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("attachments")
            .upload(path, file);
          if (!uploadErr) {
            await supabase.from("attachments").insert({
              quote_id: quoteId,
              type: "image",
              storage_path: path,
              file_name: file.name,
              mime_type: file.type,
            });
          }
        }

        // Upload audio
        if (audioBlob) {
          const path = `${user.id}/${quoteId}/${Date.now()}-voice.webm`;
          const { error: uploadErr } = await supabase.storage
            .from("attachments")
            .upload(path, audioBlob);
          if (!uploadErr) {
            await supabase.from("attachments").insert({
              quote_id: quoteId,
              type: "audio",
              storage_path: path,
              file_name: "voice-memo.webm",
              mime_type: "audio/webm",
            });
          }
        }

        // Auto-emoji (only for new quotes)
        if (!editQuote) {
          try {
            const resp = await fetch("/api/auto-emoji", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: quoteText }),
            });
            if (resp.ok) {
              const { emoji, bg_gradient } = await resp.json();
              await supabase
                .from("quotes")
                .update({ emoji, bg_gradient })
                .eq("id", quoteId);
            }
          } catch {
            // Non-critical, ignore
          }
        }
      }

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 800);
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

  if (showSuccess) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
        <div className="relative flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-[#6B8F71] rounded-full flex items-center justify-center animate-[scale-bounce_0.5s_ease-out]"
            style={{ animation: "scale-bounce 0.5s ease-out" }}>
            <Check className="w-10 h-10 text-white" />
          </div>
          <p className="mt-4 text-white font-semibold text-lg">Saved!</p>
        </div>
        <style>{`
          @keyframes scale-bounce {
            0% { transform: scale(0); }
            60% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-[#F1F5F9] px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
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

          {/* Image Upload Dropzone */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Photos</label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-[#6B8F71] bg-[#6B8F71]/5"
                  : "border-[#E2E8F0] hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
              }`}
            >
              <ImagePlus className="w-6 h-6 text-[#94A3B8] mx-auto mb-2" />
              <p className="text-sm text-[#64748B]">
                Drop images here or tap to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleImageFiles(e.target.files)}
              />
            </div>
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={src}
                      alt={`Upload ${i + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audio Recorder */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Voice Memo</label>
            <AudioRecorder
              onRecordingComplete={(blob) => setAudioBlob(blob)}
              onRemove={() => setAudioBlob(null)}
              hasRecording={!!audioBlob}
            />
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
