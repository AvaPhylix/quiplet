"use client";

import { useState } from "react";

export function PricingCTA() {
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: billing }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Billing toggle */}
      <div className="flex rounded-xl overflow-hidden border border-white/30 p-1 gap-1">
        <button
          onClick={() => setBilling("monthly")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            billing === "monthly"
              ? "bg-white text-[#6B8F71] shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          Monthly · $4.99
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            billing === "yearly"
              ? "bg-white text-[#6B8F71] shadow-sm"
              : "text-white/80 hover:text-white"
          }`}
        >
          Yearly · $39
          {billing !== "yearly" && (
            <span className="ml-1 opacity-70">🎉</span>
          )}
        </button>
      </div>

      {/* CTA button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="block w-full text-center py-3 rounded-xl text-sm font-semibold bg-white text-[#6B8F71] hover:bg-[#F8FAFC] transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Loading…" : billing === "monthly" ? "Start Pro · $4.99/mo" : "Start Pro · $39/yr — Best value"}
      </button>
    </div>
  );
}
