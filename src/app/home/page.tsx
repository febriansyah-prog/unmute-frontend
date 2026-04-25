"use client";

import Image from "next/image";
import Link from "next/link";

export default function HomePublicPage() {
  return (
    <main className="min-h-screen pb-20 overflow-x-hidden">
      {/* Navbar / Header */}
      <nav className="sticky top-0 z-50 glass-card px-4 py-3 sm:px-6 mb-8 border-b border-white/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-3 group">
            <Image src="/logo.png" alt="Unmute by Unifers" width={150} height={50} className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform" priority />
            <div className="h-6 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-brand-purple hidden sm:block">Beranda</h1>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/home" className="text-xs sm:text-sm font-bold text-brand-purple hover:text-brand-purple-light transition-colors uppercase tracking-wider">
              Home
            </Link>
            <Link href="/" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors uppercase tracking-wider">
              Booking
            </Link>
            <div className="relative group">
              <button className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors uppercase tracking-wider">
                Pengumuman <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col overflow-hidden z-50">
                <Link href="/pengumuman/sekolah" className="px-5 py-4 text-xs font-black text-gray-600 hover:bg-brand-purple/5 hover:text-brand-purple uppercase tracking-wider">Daftar Partisipan Sekolah</Link>
                <Link href="/pengumuman/perwakilan" className="px-5 py-4 text-xs font-black text-gray-600 hover:bg-brand-purple/5 hover:text-brand-purple border-t border-gray-50 uppercase tracking-wider">Daftar Siswa Perwakilan</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
        {/* Hero Banner Placeholder */}
        <div className="glass-card rounded-[2.5rem] p-10 sm:p-20 text-center premium-shadow relative overflow-hidden border border-white/50">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-brand-lime/10 -z-10"></div>
          <span className="inline-block px-4 py-1.5 bg-brand-purple/10 text-brand-purple rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-brand-purple/20">Selamat Datang di Unmute</span>
          <h2 className="text-4xl sm:text-6xl font-black text-brand-purple-dark tracking-tight uppercase leading-tight mb-6">
            Menyuarakan <span className="text-brand-purple underline decoration-brand-lime decoration-8">Potensi</span> Generasi Muda
          </h2>
          <p className="text-gray-500 text-lg sm:text-xl font-medium max-w-3xl mx-auto mb-10">
            Platform roadshow inovatif untuk menemukan, membina, dan menampilkan bakat-bakat terbaik dari berbagai sekolah.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/" className="px-8 py-4 bg-brand-purple text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform premium-shadow">
              Booking Sekarang
            </Link>
          </div>
        </div>

        {/* Content Placeholders */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border border-white/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-3xl mb-6">🏢</div>
            <h3 className="text-2xl font-black text-brand-purple-dark uppercase mb-4">Penyelenggara</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              [Bagian ini akan diisi dengan informasi lengkap mengenai siapa penyelenggara acara, visi, misi, dan latar belakang diadakannya roadshow ini.]
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border border-white/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-brand-lime/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🌟</div>
            <h3 className="text-2xl font-black text-brand-purple-dark uppercase mb-4">Manfaat</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              [Bagian ini akan diisi dengan detail manfaat yang akan didapatkan oleh siswa maupun pihak sekolah yang berpartisipasi dalam rangkaian acara ini.]
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border border-white/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">📈</div>
            <h3 className="text-2xl font-black text-brand-purple-dark uppercase mb-4">Dampak</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              [Bagian ini akan diisi dengan target pencapaian dan dampak positif jangka panjang yang diharapkan dari kegiatan Bootcamp & Final Unmute.]
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
