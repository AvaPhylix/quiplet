import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@react-pdf/renderer",
    "@react-pdf/pdfkit",
  ],
};

export default nextConfig;
