import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wave Upfronts 2026",
  description: "Wave Sports & Entertainment — 2026 Upfronts. VIP access only.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
