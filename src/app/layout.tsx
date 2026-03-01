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
  title: "GreenScore (Prototype)",
  description:
    "A lightweight prototype to explore how green your financial life and household choices are.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Soft background wash */}
        <div className="min-h-screen">
          <div
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 -z-10"
          >
            <div className="absolute inset-0 bg-[color:var(--gs-bg)]" />
            <div className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute top-44 right-[-120px] h-[520px] w-[520px] rounded-full bg-amber-200/25 blur-3xl" />
            <div className="absolute bottom-[-180px] left-[-120px] h-[520px] w-[520px] rounded-full bg-emerald-300/20 blur-3xl" />
          </div>

          {children}
        </div>
      </body>
    </html>
  );
}