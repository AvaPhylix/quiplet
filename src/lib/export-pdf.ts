import { jsPDF } from "jspdf";
import type { Quote } from "@/types/database";
import { calculateAgeAtDate, formatDate } from "@/lib/utils";

export function exportQuotesPDF(quotes: Quote[], childName?: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 25;
  const contentW = pageW - margin * 2;

  // Title page
  doc.setFillColor(250, 250, 249);
  doc.rect(0, 0, pageW, pageH, "F");

  // Decorative line
  doc.setDrawColor(107, 143, 113);
  doc.setLineWidth(0.5);
  doc.line(margin, 80, pageW - margin, 80);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(32);
  doc.setTextColor(51, 65, 81);
  doc.text("Quiplet", pageW / 2, 100, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(100, 116, 139);
  const subtitle = childName
    ? `${childName}'s Quotes`
    : "A Collection of Quotes";
  doc.text(subtitle, pageW / 2, 115, { align: "center" });

  doc.setFontSize(10);
  doc.text(
    `${quotes.length} quote${quotes.length !== 1 ? "s" : ""} · Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    pageW / 2,
    128,
    { align: "center" }
  );

  doc.setDrawColor(107, 143, 113);
  doc.line(margin, 135, pageW - margin, 135);

  // Quotes
  let y = 0;
  let needsNewPage = true;

  for (const quote of quotes) {
    if (needsNewPage) {
      doc.addPage();
      y = margin;
      needsNewPage = false;
    }

    // Check space: we need at least 50mm for a quote
    if (y > pageH - 60) {
      doc.addPage();
      y = margin;
    }

    // Quote text
    doc.setFont("helvetica", "italic");
    doc.setFontSize(13);
    doc.setTextColor(51, 65, 81);
    const wrappedText = doc.splitTextToSize(`\u201C${quote.quote_text}\u201D`, contentW);
    doc.text(wrappedText, margin, y);
    y += wrappedText.length * 6 + 3;

    // Child name + age
    const child = quote.children;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(107, 143, 113);
    let meta = child?.name ?? "Unknown";
    if (child?.date_of_birth) {
      const age = calculateAgeAtDate(child.date_of_birth, quote.said_at);
      if (age) meta += ` (age ${age})`;
    }
    doc.text(`— ${meta}`, margin, y);
    y += 6;

    // Date
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184);
    doc.text(formatDate(quote.said_at), margin, y);
    y += 5;

    // Context
    if (quote.context) {
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      const wrappedCtx = doc.splitTextToSize(quote.context, contentW);
      doc.text(wrappedCtx, margin, y);
      y += wrappedCtx.length * 4.5 + 3;
    }

    // Divider
    y += 4;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 10;
  }

  // Download
  const fileName = childName
    ? `quiplet-${childName.toLowerCase().replace(/\s+/g, "-")}-quotes.pdf`
    : "quiplet-quotes.pdf";
  doc.save(fileName);
}
