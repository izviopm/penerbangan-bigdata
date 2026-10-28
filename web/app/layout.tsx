import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { RevealObserver } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://penerbangan-bigdata.vercel.app"),
  title: { default: "Penerbangan Big Data", template: "%s | Penerbangan Big Data" },
  description: "Analitik keterlambatan dan prediksi kategori kompensasi PM 89/2015 dari 20,9 juta penerbangan.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* tanpa JavaScript kelas ini tidak ada, jadi konten yang dianimasikan tetap terlihat */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-full flex flex-col">
        <RevealObserver />
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
