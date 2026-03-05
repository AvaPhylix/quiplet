import type { Quote } from "@/types/database";
import { calculateAgeAtDate, formatDate } from "@/lib/utils";

const SUPABASE_URL = "https://dhmtmkvxvkeormovhvak.supabase.co";
const STORAGE_BUCKET = "attachments";

function getAttachmentPublicUrl(storagePath: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${storagePath}`;
}

interface QuoteWithMeta extends Quote {
  imageUrl?: string;
  ageLabel?: string;
  formattedDate?: string;
}

function getDateRange(quotes: Quote[]): string {
  if (quotes.length === 0) return "";
  const dates = quotes.map((q) => new Date(q.said_at).getTime());
  const earliest = new Date(Math.min(...dates));
  const latest = new Date(Math.max(...dates));
  const fmtOpts: Intl.DateTimeFormatOptions = { month: "long", year: "numeric" };
  const from = earliest.toLocaleDateString("en-US", fmtOpts);
  const to = latest.toLocaleDateString("en-US", fmtOpts);
  return from === to ? from : `${from} – ${to}`;
}

function getBookTitle(quotes: Quote[]): string {
  const childNames = new Set(quotes.map((q) => q.children?.name).filter(Boolean));
  if (childNames.size === 1) {
    return `${[...childNames][0]}'s Quotes`;
  }
  return "Family Quotes";
}

export async function exportQuotesPDF(quotes: Quote[]): Promise<void> {
  if (quotes.length === 0) return;

  // Dynamic imports for client-side only
  const [{ pdf }, { QuipletPDFDocument }, React] = await Promise.all([
    import("@react-pdf/renderer"),
    import("@/components/pdf/QuipletPDFDocument"),
    import("react"),
  ]);

  // Prepare quotes with metadata
  const preparedQuotes: QuoteWithMeta[] = quotes.map((q) => {
    const imageAttachment = q.attachments?.find((a) => a.type === "image");
    const child = q.children;

    let ageLabel = "";
    if (child?.date_of_birth) {
      ageLabel = calculateAgeAtDate(child.date_of_birth, q.said_at);
    }

    return {
      ...q,
      imageUrl: imageAttachment ? getAttachmentPublicUrl(imageAttachment.storage_path) : undefined,
      ageLabel: ageLabel || undefined,
      formattedDate: formatDate(q.said_at),
    };
  });

  const bookTitle = getBookTitle(quotes);
  const dateRange = getDateRange(quotes);

  // Generate PDF blob
  const doc = React.createElement(QuipletPDFDocument, {
    quotes: preparedQuotes,
    bookTitle,
    dateRange,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blob = await pdf(doc as any).toBlob();

  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const safeName = bookTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
  link.download = `quiplet-${safeName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
