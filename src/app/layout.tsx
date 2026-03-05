import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Quiplet — Capture the Funny Things Kids Say",
  description:
    "A premium digital scrapbook for parents to capture, save, and treasure the hilarious and heartwarming things their children say.",
  manifest: "/manifest.json",
  themeColor: "#6B8F71",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quiplet",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${playfair.variable}`}>
      <body
        className="font-[family-name:var(--font-outfit)] bg-[#FAFAF9] text-[#334155] antialiased"
      >
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
