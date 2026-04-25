"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock delay for feel
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        localStorage.setItem("admin_auth", "true");
        router.push("/admin");
      } else {
        setError("Username atau password salah");
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-lime/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md glass-card rounded-3xl p-8 sm:p-12 premium-shadow animate-fade-in relative z-10 border border-white/40">
        <div className="mb-10 text-center space-y-2">
          <Image src="/logo.png" alt="Unmute by Unifers" width={200} height={80} className="h-16 w-auto object-contain mx-auto mb-6" priority />
          <h1 className="text-3xl font-black text-brand-purple-dark tracking-tight uppercase">Admin <span className="text-brand-purple">Panel</span></h1>
          <p className="text-gray-500 font-medium">Silakan masuk untuk mengelola data.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-4 text-center text-sm font-bold text-red-600 animate-fade-in">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Username</label>
            <input
              type="text"
              className="w-full bg-white/50 rounded-2xl border-2 border-gray-100 p-4 outline-none focus:border-brand-purple transition-all font-medium"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-gray-400 px-1">Password</label>
            <input
              type="password"
              className="w-full bg-white/50 rounded-2xl border-2 border-gray-100 p-4 outline-none focus:border-brand-purple transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-2xl p-4 font-black text-white uppercase tracking-widest transition-all transform active:scale-95 shadow-lg ${
              loading 
              ? "bg-gray-300 cursor-not-allowed" 
              : "bg-brand-purple hover:bg-brand-purple-light premium-shadow"
            }`}
          >
            {loading ? "Memverifikasi..." : "Login Sekarang"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button 
            onClick={() => router.push("/")}
            className="text-xs font-bold text-gray-400 hover:text-brand-purple transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            ← Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
