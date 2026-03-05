"use client";

import { useEffect, useState, useRef } from "react";
import { Plus, X, Loader2, Edit3, Trash2, Camera } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import { calculateAge, CHILD_COLORS } from "@/lib/utils";
import type { Child } from "@/types/database";

export default function ChildrenPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editChild, setEditChild] = useState<Child | null>(null);
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [color, setColor] = useState(CHILD_COLORS[0].value);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  async function loadChildren() {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.from("children").select("*").order("name");
    if (data) setChildren(data);
    setLoading(false);
  }

  useEffect(() => {
    loadChildren();
  }, []);

  function openAdd() {
    setEditChild(null);
    setName("");
    setDob("");
    setColor(CHILD_COLORS[0].value);
    setAvatarFile(null);
    setAvatarPreview(null);
    setShowForm(true);
  }

  function openEdit(child: Child) {
    setEditChild(child);
    setName(child.name);
    setDob(child.date_of_birth ?? "");
    setColor(child.theme_color);
    setAvatarFile(null);
    setAvatarPreview(child.avatar_url ?? null);
    setShowForm(true);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let avatarUrl: string | null = editChild?.avatar_url ?? null;

    // Upload avatar if new file selected
    if (avatarFile) {
      const ext = avatarFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatars/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("attachments")
        .upload(path, avatarFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("attachments")
          .getPublicUrl(path);
        avatarUrl = urlData.publicUrl;
      }
    }

    const payload = {
      name: name.trim(),
      date_of_birth: dob || null,
      theme_color: color,
      avatar_url: avatarUrl,
    };

    if (editChild) {
      await supabase.from("children").update(payload).eq("id", editChild.id);
    } else {
      await supabase.from("children").insert({ ...payload, user_id: user.id });
    }

    setSaving(false);
    setShowForm(false);
    loadChildren();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this child profile? Their quotes will remain.")) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from("children").delete().eq("id", id);
    loadChildren();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Your Kids</h1>
          <p className="text-[#64748B] text-sm">Manage child profiles</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-[#6B8F71] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5A7D60] transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Child
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#6B8F71] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : children.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full bg-[#F1F5F9] flex items-center justify-center mx-auto mb-4 text-3xl">
            👶
          </div>
          <h2 className="text-lg font-semibold mb-2">No kids added yet</h2>
          <p className="text-[#64748B] text-sm mb-4">
            Add your children to start capturing their quotes.
          </p>
          <button
            onClick={openAdd}
            className="bg-[#6B8F71] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#5A7D60] transition-colors"
          >
            Add Your First Child
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {children.map((child) => (
            <div
              key={child.id}
              className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {child.avatar_url ? (
                    <img
                      src={child.avatar_url}
                      alt={child.name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                      style={{ backgroundColor: child.theme_color }}
                    >
                      {child.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{child.name}</h3>
                    {child.date_of_birth && (
                      <p className="text-sm text-[#64748B]">
                        {calculateAge(child.date_of_birth)} old
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(child)}
                    className="p-2 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(child.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-[#64748B] hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editChild ? "Edit Child" : "Add Child"}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-[#F1F5F9] rounded-lg">
                <X className="w-5 h-5 text-[#64748B]" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Avatar Upload */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative group"
                >
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-20 h-20 rounded-2xl object-cover"
                    />
                  ) : (
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-white text-2xl font-bold"
                      style={{ backgroundColor: color }}
                    >
                      {name ? name.charAt(0).toUpperCase() : "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </button>
              </div>
              <p className="text-xs text-center text-[#94A3B8]">Tap to add photo</p>

              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
                  placeholder="Child's name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Theme Color</label>
                <div className="flex gap-3">
                  {CHILD_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-10 h-10 rounded-xl transition-all ${
                        color === c.value
                          ? "ring-2 ring-offset-2 ring-[#6B8F71] scale-110"
                          : "hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="w-full bg-[#6B8F71] text-white py-3 rounded-xl font-semibold hover:bg-[#5A7D60] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editChild ? "Save Changes" : "Add Child"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
