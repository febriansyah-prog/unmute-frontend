import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import MusicPlayer from "@/components/MusicPlayer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MemoryMatchGame } from "@/components/MemoryMatchGame";
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
  title: "Unmute By Unifers | Universitas Fajar",
  description: "Program Unmute by Unifers. Sebuah inisiatif dan dedikasi pengabdian masyarakat dari sivitas akademika Universitas Fajar (Unifa) untuk mencetak generasi unggul Sulawesi Selatan melalui eskalasi keterampilan abad 21.",
  openGraph: {
    title: "Unmute By Unifers | Universitas Fajar",
    description: "Program Unmute by Unifers. Sebuah inisiatif dan dedikasi pengabdian masyarakat dari sivitas akademika Universitas Fajar (Unifa) untuk mencetak generasi unggul Sulawesi Selatan melalui eskalasi keterampilan abad 21.",
    siteName: "Unmute By Unifers",
  }
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
      <body className="min-h-full flex flex-col font-sans relative overflow-x-hidden bg-background text-foreground transition-colors duration-500">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {/* Dynamic Abstract Background Elements */}
          <div className="fixed top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-brand-purple/10 dark:bg-brand-purple/20 blur-[100px] animate-pulse-slow pointer-events-none -z-10 transition-colors duration-700"></div>
          <div className="fixed bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-brand-lime/10 dark:bg-brand-lime/5 blur-[100px] animate-pulse-slow pointer-events-none -z-10 transition-colors duration-700" style={{ animationDelay: '2s' }}></div>
          <div className="fixed top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full bg-brand-purple-light/5 dark:bg-brand-purple/10 blur-[80px] animate-float pointer-events-none -z-10 transition-colors duration-700"></div>
          
          <div className="flex-1 relative z-0">
            {children}
          </div>
          
          {/* Global Footer */}
          <footer className="mt-auto bg-brand-purple-dark dark:bg-black border-t-4 border-brand-lime text-white/80 py-10 text-center px-4 transition-colors duration-700">
            <div className="max-w-7xl mx-auto space-y-2">
              <h4 className="text-xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-md">Universitas Fajar</h4>
              <p className="text-sm sm:text-base font-medium opacity-90">Jl. Prof. Abdurrahman Basalamah No. 101 C, Panaikang,</p>
              <p className="text-sm sm:text-base font-medium opacity-90">Kec. Panakkukang, Kota Makassar, Sulawesi Selatan</p>
              <div className="h-px w-24 bg-white/20 mx-auto my-6"></div>
              <p className="text-[10px] sm:text-xs font-bold text-white/50 tracking-widest uppercase mb-1">
                Copyright &copy; 2026 Universitas Fajar. All rights reserved.
              </p>
              <p className="text-[10px] sm:text-xs font-medium text-white/40 tracking-wider mt-2">
                Developed by <span className="font-bold text-brand-lime/80">Febriansyah, S.Kom., MT</span> | 📱 081342307597
              </p>
            </div>
          </footer>
          
          <MusicPlayer />
          <ThemeToggle />
          <MemoryMatchGame />
        </ThemeProvider>
      </body>
    </html>
  );
}
