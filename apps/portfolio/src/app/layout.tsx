import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { content } from "@/content/portfolio-content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: content.meta.title,
  description: content.meta.description,
  metadataBase: new URL(content.meta.url),
  openGraph: {
    title: content.meta.title,
    description: content.meta.description,
    url: content.meta.url,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: content.meta.title,
    description: content.meta.description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[#09090b] text-zinc-50`}
      >
        {children}
      </body>
    </html>
  );
}
