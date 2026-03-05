import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Svg,
  Circle,
  Path,
} from "@react-pdf/renderer";
import type { Quote } from "@/types/database";

const CARD_COLORS = ["#A3B19B", "#E8D0D0", "#F1EBE1", "#D4D0E8"];

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FAFAF9",
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: "Helvetica",
  },
  // Cover page
  coverPage: {
    backgroundColor: "#FAFAF9",
    paddingHorizontal: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  coverDecoTop: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  coverDecoBottom: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  coverTitle: {
    fontFamily: "Times-Roman",
    fontSize: 32,
    color: "#334155",
    textAlign: "center",
    marginBottom: 8,
  },
  coverSubtitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 18,
    color: "#6B8F71",
    textAlign: "center",
    marginBottom: 16,
  },
  coverDateRange: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 6,
  },
  coverCount: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#94A3B8",
    textAlign: "center",
  },
  coverLine: {
    width: 120,
    height: 1,
    backgroundColor: "#CBD5E1",
    marginVertical: 20,
  },
  // Page header
  pageHeader: {
    position: "absolute",
    top: 20,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  headerLine: {
    position: "absolute",
    top: 38,
    left: 50,
    right: 50,
    height: 0.5,
    backgroundColor: "#E2E8F0",
  },
  // Page footer
  pageFooter: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: "#CBD5E1",
  },
  footerPageNum: {
    fontFamily: "Helvetica",
    fontSize: 8,
    color: "#94A3B8",
  },
  // Quote card
  card: {
    borderRadius: 12,
    padding: 28,
    marginBottom: 20,
  },
  cardImage: {
    width: "100%",
    maxHeight: 200,
    borderRadius: 8,
    marginBottom: 16,
    objectFit: "cover" as const,
  },
  quoteText: {
    fontFamily: "Times-Roman",
    fontSize: 18,
    color: "#334155",
    lineHeight: 1.6,
    marginBottom: 14,
  },
  contextText: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 1.4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  childName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    color: "#334155",
  },
  ageText: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#64748B",
    marginLeft: 6,
  },
  dateText: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#94A3B8",
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  // Decorative elements container
  decoContainer: {
    position: "absolute",
  },
  // Tag row
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 10,
  },
  tag: {
    fontFamily: "Helvetica",
    fontSize: 7,
    color: "#C8956C",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});

// SVG decorative components
function Star({ x, y, size = 12, color = "#D4D0E8" }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, width: size, height: size }}>
      <Path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
        fill={color}
      />
    </Svg>
  );
}

function Heart({ x, y, size = 12, color = "#E8D0D0" }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, width: size, height: size }}>
      <Path
        d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
        fill={color}
      />
    </Svg>
  );
}

function Sparkle({ x, y, size = 10, color = "#F1EBE1" }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <Svg viewBox="0 0 24 24" style={{ position: "absolute", left: x, top: y, width: size, height: size }}>
      <Circle cx="12" cy="12" r="3" fill={color} />
      <Path d="M12 1v6M12 17v6M1 12h6M17 12h6" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

function CoverDecorations() {
  return (
    <>
      <Star x={60} y={80} size={16} color="#D4D0E8" />
      <Heart x={440} y={100} size={14} color="#E8D0D0" />
      <Sparkle x={100} y={650} size={12} color="#A3B19B" />
      <Star x={400} y={670} size={14} color="#F1EBE1" />
      <Heart x={80} y={350} size={10} color="#E8D0D0" />
      <Sparkle x={430} y={320} size={10} color="#D4D0E8" />
    </>
  );
}

// Subtle page decorations - different for each page
function PageDecorations({ pageIndex }: { pageIndex: number }) {
  const patterns = [
    <>
      <Star x={460} y={50} size={8} color="#E2E8F0" />
      <Sparkle x={40} y={700} size={7} color="#E2E8F0" />
    </>,
    <>
      <Heart x={455} y={55} size={8} color="#E8D0D0" />
      <Star x={45} y={690} size={7} color="#E2E8F0" />
    </>,
    <>
      <Sparkle x={460} y={48} size={8} color="#D4D0E8" />
      <Heart x={42} y={695} size={7} color="#E2E8F0" />
    </>,
    <>
      <Star x={458} y={52} size={8} color="#A3B19B" />
      <Sparkle x={38} y={692} size={7} color="#E2E8F0" />
    </>,
  ];
  return <>{patterns[pageIndex % patterns.length]}</>;
}

interface QuoteWithMeta extends Quote {
  imageUrl?: string;
  ageLabel?: string;
  formattedDate?: string;
}

interface QuipletPDFDocumentProps {
  quotes: QuoteWithMeta[];
  bookTitle: string;
  dateRange: string;
}

export function QuipletPDFDocument({ quotes, bookTitle, dateRange }: QuipletPDFDocumentProps) {
  // Group quotes into pages (1-2 per page based on content length)
  const pages: QuoteWithMeta[][] = [];
  let currentPage: QuoteWithMeta[] = [];

  for (const quote of quotes) {
    const hasImage = !!quote.imageUrl;
    const isLong = quote.quote_text.length > 200;
    const hasContext = !!quote.context;

    // If the quote has an image or is long, give it its own page
    if (hasImage || isLong || (hasContext && quote.quote_text.length > 120)) {
      if (currentPage.length > 0) {
        pages.push(currentPage);
        currentPage = [];
      }
      pages.push([quote]);
    } else {
      currentPage.push(quote);
      if (currentPage.length >= 2) {
        pages.push(currentPage);
        currentPage = [];
      }
    }
  }
  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return (
    <Document title={`The Little Book of Big Ideas — ${bookTitle}`} author="Quiplet">
      {/* Cover Page */}
      <Page size="LETTER" style={styles.coverPage}>
        <CoverDecorations />

        <View style={styles.coverLine} />
        <Text style={styles.coverTitle}>The Little Book{"\n"}of Big Ideas</Text>
        <View style={styles.coverLine} />
        <Text style={styles.coverSubtitle}>{bookTitle}</Text>
        <Text style={styles.coverDateRange}>{dateRange}</Text>
        <Text style={styles.coverCount}>
          {quotes.length} quote{quotes.length !== 1 ? "s" : ""}
        </Text>
      </Page>

      {/* Content Pages */}
      {pages.map((pageQuotes, pageIdx) => (
        <Page key={pageIdx} size="LETTER" style={styles.page}>
          {/* Header */}
          <View style={styles.pageHeader} fixed>
            <Text style={styles.headerTitle}>
              THE LITTLE BOOK OF BIG IDEAS
            </Text>
            <Text style={styles.headerTitle}>
              {bookTitle.toUpperCase()}
            </Text>
          </View>
          <View style={styles.headerLine} fixed />

          {/* Subtle decorations */}
          <PageDecorations pageIndex={pageIdx} />

          {/* Quote Cards */}
          {pageQuotes.map((quote, qIdx) => {
            const bgColor = CARD_COLORS[(pageIdx * 2 + qIdx) % CARD_COLORS.length];
            const tagNames = quote.quote_tags
              ?.map((qt) => qt.tags?.name)
              .filter(Boolean) ?? [];

            return (
              <View key={quote.id} style={[styles.card, { backgroundColor: bgColor }]}>
                {/* Image */}
                {quote.imageUrl && (
                  <Image src={quote.imageUrl} style={styles.cardImage} />
                )}

                {/* Emoji */}
                {quote.emoji && (
                  <Text style={{ fontSize: 22, marginBottom: 8 }}>
                    {quote.emoji}
                  </Text>
                )}

                {/* Quote Text */}
                <Text style={styles.quoteText}>
                  {"\u201C"}{quote.quote_text}{"\u201D"}
                </Text>

                {/* Context */}
                {quote.context && (
                  <Text style={styles.contextText}>{quote.context}</Text>
                )}

                {/* Tags */}
                {tagNames.length > 0 && (
                  <View style={styles.tagRow}>
                    {tagNames.map((tag, i) => (
                      <Text key={i} style={styles.tag}>{tag}</Text>
                    ))}
                  </View>
                )}

                {/* Meta row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaLeft}>
                    <Text style={styles.childName}>
                      — {quote.children?.name ?? "Unknown"}
                    </Text>
                    {quote.ageLabel && (
                      <Text style={styles.ageText}>({quote.ageLabel})</Text>
                    )}
                  </View>
                  <Text style={styles.dateText}>{quote.formattedDate}</Text>
                </View>
              </View>
            );
          })}

          {/* Footer */}
          <View style={styles.pageFooter} fixed>
            <Text style={styles.footerText}>Made with Quiplet</Text>
            <Text
              style={styles.footerPageNum}
              render={({ pageNumber }) => `${pageNumber}`}
            />
          </View>
        </Page>
      ))}
    </Document>
  );
}
