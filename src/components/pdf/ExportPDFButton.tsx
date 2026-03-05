"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import type { Quote } from "@/types/database";

interface ExportPDFButtonProps {
  quotes: Quote[];
  className?: string;
}

export function ExportPDFButton({ quotes, className }: ExportPDFButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    if (quotes.length === 0 || loading) return;
    setLoading(true);
    try {
      const { exportQuotesPDF } = await import("@/lib/export-pdf");
      await exportQuotesPDF(quotes);
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setLoading(false);
    }
  }

  if (quotes.length === 0) return null;

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={
        className ??
        "flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#6B8F71] text-white rounded-xl hover:bg-[#5A7D60] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      }
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {loading ? "Generating…" : "Export PDF"}
    </button>
  );
}
