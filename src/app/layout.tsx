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
  title: "Unmute By Unifers",
  description: "Sistem Booking Kunjungan Sekolah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <div className="flex-1">
          {children}
        </div>
        
        {/* Global Footer */}
        <footer className="mt-auto bg-brand-purple-dark text-white/80 py-10 text-center px-4 border-t-4 border-brand-lime">
          <div className="max-w-7xl mx-auto space-y-2">
            <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-md">Universitas Fajar</h4>
            <p className="text-sm sm:text-base font-medium opacity-90">Jl. Prof. Abdurrahman Basalamah No. 101 C, Panaikang,</p>
            <p className="text-sm sm:text-base font-medium opacity-90">Kec. Panakkukang, Kota Makassar, Sulawesi Selatan</p>
            <div className="h-px w-24 bg-white/20 mx-auto my-6"></div>
            <p className="text-[10px] sm:text-xs font-bold text-white/50 tracking-widest uppercase">
              Copyright &copy; 2026 Universitas Fajar. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
