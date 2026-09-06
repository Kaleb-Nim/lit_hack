import type { Metadata } from "next";
import { Geist_Mono, Lora, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { ReviewProvider } from "@/lib/review/provider";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "L.A.R.P — Localised Amendment Resilience Platform",
  description:
    "Trace verified Singapore regulatory changes through affected contracts, review proposed edits, and maintain a regulatory audit trail.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSans.variable} ${lora.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ReviewProvider>{children}</ReviewProvider>
      </body>
    </html>
  );
}
