"use client";

import { useEffect, useState } from "react";
import { Users, Mail, Loader2, Trash2, Clock, CheckCircle2, XCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { FamilyInvite, FamilyMember } from "@/types/database";

interface FamilyMemberWithProfile extends FamilyMember {
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

export default function FamilyPage() {
  const [invites, setInvites] = useState<FamilyInvite[]>([]);
  const [members, setMembers] = useState<FamilyMemberWithProfile[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [inviteRes, memberRes] = await Promise.all([
      supabase
        .from("family_invites")
        .select("*")
        .eq("inviter_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("family_members")
        .select("*, profiles:member_id(display_name, avatar_url)")
        .eq("family_owner_id", user.id),
    ]);

    if (inviteRes.data) setInvites(inviteRes.data as FamilyInvite[]);
    if (memberRes.data) setMembers(memberRes.data as unknown as FamilyMemberWithProfile[]);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSending(true);
    setError("");
    setSuccess("");

    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check for duplicate
    const existing = invites.find(
      (inv) => inv.email === email.trim().toLowerCase() && inv.status === "pending"
    );
    if (existing) {
      setError("An invite is already pending for this email.");
      setSending(false);
      return;
    }

    const { error: err } = await supabase.from("family_invites").insert({
      inviter_id: user.id,
      email: email.trim().toLowerCase(),
      role,
      status: "pending",
    });

    if (err) {
      setError(err.message);
    } else {
      setSuccess(`Invite sent to ${email.trim()}`);
      setEmail("");
      loadData();
    }
    setSending(false);
    setTimeout(() => setSuccess(""), 3000);
  }

  async function cancelInvite(id: string) {
    const supabase = getSupabaseBrowserClient();
    await supabase.from("family_invites").delete().eq("id", id);
    loadData();
  }

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "accepted":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "declined":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1">Family</h1>
        <p className="text-[#64748B] text-sm">
          Invite co-parents and family members to view or contribute quotes
        </p>
      </div>

      {/* Invite Form */}
      <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-6">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#6B8F71]" />
          Send an Invite
        </h2>
        <form onSubmit={handleInvite} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl">
              {success}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
              placeholder="partner@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B8F71]/30 focus:border-[#6B8F71] transition-all text-sm"
            >
              <option value="viewer">Viewer — can see all quotes</option>
              <option value="contributor">Contributor — can add & edit quotes</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={sending || !email.trim()}
            className="w-full bg-[#6B8F71] text-white py-3 rounded-xl font-semibold hover:bg-[#5A7D60] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending && <Loader2 className="w-4 h-4 animate-spin" />}
            Send Invite
          </button>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-2 border-[#6B8F71] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Current Members */}
          {members.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-6">
              <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6B8F71]" />
                Family Members
              </h2>
              <div className="space-y-3">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#6B8F71]/10 flex items-center justify-center text-[#6B8F71] font-bold text-sm">
                        {(m.profiles?.display_name ?? "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{m.profiles?.display_name ?? "Unknown"}</p>
                        <p className="text-xs text-[#94A3B8] capitalize">{m.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)]">
              <h2 className="text-base font-semibold mb-4">Invites</h2>
              <div className="space-y-3">
                {invites.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-3 border-b border-[#F1F5F9] last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {statusIcon(inv.status)}
                      <div>
                        <p className="text-sm font-medium">{inv.email}</p>
                        <p className="text-xs text-[#94A3B8] capitalize">
                          {inv.role} · {inv.status}
                        </p>
                      </div>
                    </div>
                    {inv.status === "pending" && (
                      <button
                        onClick={() => cancelInvite(inv.id)}
                        className="p-2 text-[#94A3B8] hover:text-red-500 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {members.length === 0 && invites.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-[#E2E8F0] mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">No family members yet</h2>
              <p className="text-[#64748B] text-sm">
                Send an invite above to share your quote collection.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
