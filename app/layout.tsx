import type { Metadata } from "next";
import { Lora, Playfair_Display, Source_Sans_3 } from "next/font/google";
import { ReviewProvider } from "@/lib/review/provider";
import "./globals.css";

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
  title: "Pearson — PDPA Impact Review",
  description:
    "Trace the PDPA (Amendment) Act 2026 through every affected clause, review each edit, sign the document, and run the same review across similar files.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${sourceSans.variable} ${lora.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <ReviewProvider>{children}</ReviewProvider>
      </body>
    </html>
  );
}
