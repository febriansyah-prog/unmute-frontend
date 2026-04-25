"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (typeof window !== "undefined" && window.location.hostname === "localhost" 
                  ? "http://localhost:3001" 
                  : "https://unmute-backend-production.up.railway.app");

type Delegate = {
  id: string;
  nisn: string;
  name: string;
  topic: string;
  school_name: string;
};

export default function PengumumanPerwakilanPage() {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/delegates`);
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDelegates(data);
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat daftar siswa perwakilan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen pb-20 overflow-x-hidden">
      {/* Navbar / Header */}
      <nav className="sticky top-0 z-50 glass-card px-4 py-3 sm:px-6 mb-8 border-b border-white/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image src="/logo.png" alt="Unmute by Unifers" width={150} height={50} className="h-10 sm:h-12 w-auto object-contain group-hover:scale-105 transition-transform" priority />
            <div className="h-6 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-brand-purple hidden sm:block">Pengumuman</h1>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/home" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors uppercase tracking-wider">
              Home
            </Link>
            <Link href="/" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors uppercase tracking-wider">
              Booking
            </Link>
            <div className="relative group" tabIndex={0}>
              <button className="flex items-center gap-1 text-xs sm:text-sm font-bold text-brand-purple hover:text-brand-purple focus:text-brand-purple transition-colors uppercase tracking-wider">
                Pengumuman <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all flex flex-col overflow-hidden z-50">
                <Link href="/pengumuman/sekolah" className="px-5 py-4 text-xs font-black text-gray-600 hover:bg-brand-purple/5 hover:text-brand-purple border-b border-gray-50 uppercase tracking-wider">Daftar Partisipan Sekolah</Link>
                <Link href="/pengumuman/perwakilan" className="px-5 py-4 text-xs font-black text-brand-purple bg-brand-purple/5 uppercase tracking-wider">Daftar Siswa Perwakilan</Link>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Sistem Aktif
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
        <div className="text-center space-y-4 max-w-3xl mx-auto py-6">
          <span className="inline-block px-4 py-1.5 bg-brand-purple/10 text-brand-purple rounded-full text-xs font-black uppercase tracking-widest mb-2 border border-brand-purple/20">Pengumuman</span>
          <h2 className="text-4xl sm:text-5xl font-black text-brand-purple-dark tracking-tight uppercase">
            Siswa <span className="text-brand-purple">Perwakilan</span>
          </h2>
          <p className="text-gray-500 font-medium">Daftar siswa terbaik dari berbagai sekolah yang terpilih sebagai delegasi dalam acara Bootcamp & Final Universitas Fajar.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-brand-lime rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="glass-card border-red-100 bg-red-50/50 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto">
            <p className="text-red-700 font-bold">{error}</p>
            <button onClick={fetchData} className="px-6 py-2 bg-brand-purple text-white rounded-xl font-bold premium-shadow">Coba Lagi</button>
          </div>
        ) : (
          <div className="glass-card rounded-[2.5rem] overflow-hidden premium-shadow border border-white/50">
            <div className="p-6 sm:p-8 border-b border-gray-100 flex justify-between items-center bg-white/50">
              <h3 className="text-xl font-black text-brand-purple-dark uppercase">Total: <span className="text-brand-purple">{delegates.length} Siswa</span></h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-brand-purple/5 text-gray-500 text-[10px] sm:text-xs font-black uppercase tracking-widest">
                    <th className="px-6 sm:px-8 py-5 text-center">No</th>
                    <th className="px-6 sm:px-8 py-5">NISN</th>
                    <th className="px-6 sm:px-8 py-5">Nama Siswa</th>
                    <th className="px-6 sm:px-8 py-5">Asal Sekolah</th>
                    <th className="px-6 sm:px-8 py-5 text-center">Topik Materi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 bg-white/50">
                  {delegates.length > 0 ? (
                    delegates.map((d, idx) => (
                      <tr key={d.id} className="hover:bg-brand-purple/[0.02] transition-colors group">
                        <td className="px-6 sm:px-8 py-5 text-center text-gray-400 font-bold">{idx + 1}</td>
                        <td className="px-6 sm:px-8 py-5 font-mono text-sm text-gray-500">{d.nisn.substring(0, 4)}••••••</td>
                        <td className="px-6 sm:px-8 py-5 font-black text-gray-800 group-hover:text-brand-purple transition-colors">{d.name}</td>
                        <td className="px-6 sm:px-8 py-5 font-bold text-gray-600">{d.school_name}</td>
                        <td className="px-6 sm:px-8 py-5 text-center">
                          <span className="inline-block px-3 py-1.5 rounded-xl bg-brand-lime/10 text-brand-purple-dark text-[10px] sm:text-xs font-black border border-brand-lime/20">
                            {d.topic}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-medium">Belum ada data siswa perwakilan.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
