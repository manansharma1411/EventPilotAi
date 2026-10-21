import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "EventPilot AI — Plan smarter. Celebrate better.",
  description:
    "The intelligent celebration & event planning operating system. Architect multi-phase celebrations, enforce deterministic budget math, and coordinate flawless run-of-show agendas.",
  keywords: [
    "event planner",
    "celebration planning",
    "wedding coordinator",
    "budget optimizer",
    "timeline generator",
    "Prompt Wars",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-warmth-50 text-navy-900 font-sans min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
