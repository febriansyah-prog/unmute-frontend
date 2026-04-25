"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Robust API URL detection
const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (typeof window !== "undefined" && window.location.hostname === "localhost" 
                  ? "http://localhost:3001" 
                  : "https://unmute-backend-production.up.railway.app");

type School = {
  id: string;
  name: string;
};

type Booking = {
  id: string;
  date: string;
  school_name: string;
  pic: string;
  phone: string;
};

type Toast = {
  type: "success" | "error";
  text: string;
};

function formatDateLocal(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDateKey(dateString: string) {
  if (!dateString) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return dateString.slice(0, 10);
  return formatDateLocal(parsed);
}

function formatLongDate(dateString: string) {
  try {
    const raw = getDateKey(dateString);
    const [year, month, day] = raw.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateString;
  }
}

function validatePhone(value: string) {
  if (!value) return "Nomor HP wajib diisi";
  if (!/^\d+$/.test(value)) return "Nomor HP hanya boleh angka";
  if (value.length < 10 || value.length > 15) {
    return "Nomor HP harus 10-15 digit angka";
  }
  return "";
}

export default function AdminDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editPic, setEditPic] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editError, setEditError] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const router = useRouter();

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (isAuth !== "true") {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
      fetchData();
    }
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (type: "success" | "error", text: string) => setToast({ type, text });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [schoolsRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/api/schools`),
        fetch(`${API_URL}/api/bookings`),
      ]);
      if (!schoolsRes.ok || !bookingsRes.ok) throw new Error("Gagal mengambil data dari server");
      const schoolsData = await schoolsRes.json();
      const bookingsData = await bookingsRes.json();
      if (!Array.isArray(schoolsData) || !Array.isArray(bookingsData)) {
        throw new Error("Invalid data format from API");
      }
      setSchools(schoolsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
      setError("Server tidak bisa dihubungi atau terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditPic(booking.pic);
    setEditPhone(booking.phone);
    setEditDate(getDateKey(booking.date));
    setEditError("");
  };

  const handleUpdateBooking = async () => {
    if (!editingBooking) return;
    setEditError("");
    if (!editPic.trim()) {
      setEditError("PIC wajib diisi");
      return;
    }
    const phoneValidation = validatePhone(editPhone);
    if (phoneValidation) {
      setEditError(phoneValidation);
      return;
    }
    if (!editDate) {
      setEditError("Tanggal booking wajib dipilih");
      return;
    }
    const selectedSchool = schools.find((school) => school.name === editingBooking.school_name);
    if (!selectedSchool) {
      setEditError("Data sekolah tidak ditemukan");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings/${editingBooking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: editDate,
          school_id: selectedSchool.id,
          contact_name: editPic.trim(),
          phone_number: editPhone,
        }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setEditError(result.message || "Gagal memperbarui booking");
        return;
      }
      showToast("success", "Booking berhasil diperbarui");
      setEditingBooking(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      setEditError("Server error saat memperbarui booking");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteBooking = async (booking: Booking) => {
    if (typeof window === "undefined") return;
    const confirmed = window.confirm(`Yakin ingin menghapus booking ${booking.school_name}?`);
    if (!confirmed) return;
    
    try {
      const res = await fetch(`${API_URL}/api/bookings/${booking.id}`, { 
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("error", result.message || "Gagal menghapus booking");
        return;
      }
      showToast("success", "Booking berhasil dihapus");
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast("error", "Server error saat menghapus booking");
    }
  };

  const totalSchools = schools.length;
  const totalBookings = bookings.length;
  const bookedSchoolsCount = new Set(bookings.map((b) => b.school_name)).size;
  const unbookedSchoolsCount = totalSchools - bookedSchoolsCount;

  const filteredBookings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const sorted = [...bookings].sort((a, b) => getDateKey(a.date).localeCompare(getDateKey(b.date)));
    if (!keyword) return sorted;
    return sorted.filter((b) => {
      const displayDate = formatLongDate(b.date).toLowerCase();
      return (
        b.school_name.toLowerCase().includes(keyword) ||
        b.pic.toLowerCase().includes(keyword) ||
        b.phone.toLowerCase().includes(keyword) ||
        displayDate.includes(keyword)
      );
    });
  }, [bookings, searchTerm]);

  if (!authorized) return null;

  return (
    <div className="min-h-screen pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed right-5 top-5 z-[9999] animate-fade-in">
          <div className={`flex items-center gap-4 rounded-2xl px-6 py-4 text-white shadow-xl font-bold border ${toast.type === "success" ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"}`}>
            <span>{toast.type === "success" ? "✓" : "⚠️"} {toast.text}</span>
            <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 transition-opacity">✕</button>
          </div>
        </div>
      )}

      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 glass-card border-b border-white/50 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Unmute by Unifers" width={120} height={40} className="h-8 sm:h-10 w-auto object-contain" priority />
            <div className="h-6 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
            <h1 className="text-xl font-black uppercase tracking-tight text-brand-purple-dark hidden sm:block">Panel <span className="text-brand-purple">Admin</span></h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/schools")}
              className="px-4 py-2 bg-brand-purple/5 text-brand-purple rounded-xl text-sm font-black uppercase tracking-wider hover:bg-brand-purple hover:text-white transition-all"
            >
              Sekolah
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 animate-fade-in">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-brand-lime rounded-full animate-spin"></div>
            <p className="font-black text-gray-400 uppercase tracking-widest text-xs">Memuat Data...</p>
          </div>
        ) : error ? (
          <div className="glass-card border-red-100 bg-red-50/50 rounded-3xl p-10 text-center space-y-4 max-w-lg mx-auto">
            <p className="text-red-700 font-bold">{error}</p>
            <button onClick={fetchData} className="px-6 py-2 bg-brand-purple text-white rounded-xl font-bold premium-shadow">Coba Lagi</button>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Total Sekolah", val: totalSchools, color: "text-gray-800", bg: "bg-white" },
                { label: "Total Booking", val: totalBookings, color: "text-brand-purple", bg: "bg-brand-purple/5" },
                { label: "Sudah Booking", val: bookedSchoolsCount, color: "text-green-600", bg: "bg-green-50" },
                { label: "Sisa Sekolah", val: unbookedSchoolsCount, color: "text-orange-600", bg: "bg-orange-50" },
              ].map((stat, i) => (
                <div key={i} className={`${stat.bg} p-6 rounded-3xl border border-gray-100 shadow-sm transition-transform hover:scale-105 duration-300`}>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                  <h3 className={`text-4xl font-black ${stat.color}`}>{stat.val}</h3>
                </div>
              ))}
            </div>

            {/* Main Table Content */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden premium-shadow">
              <div className="p-6 sm:p-10 flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100">
                <h2 className="text-2xl font-black text-brand-purple-dark uppercase">Manajemen <span className="text-brand-purple">Booking</span></h2>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`${API_URL}/api/export/bookings`}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-lime text-brand-purple-dark rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-brand-lime-hover transition-all premium-shadow"
                  >
                    📥 Excel
                  </a>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-80 bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-3 pl-10 outline-none transition-all font-medium"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-brand-purple/5 text-brand-purple text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-5 text-center">No</th>
                      <th className="px-8 py-5">Nama Sekolah</th>
                      <th className="px-8 py-5">PIC</th>
                      <th className="px-8 py-5">No HP</th>
                      <th className="px-8 py-5">Tanggal</th>
                      <th className="px-8 py-5 text-center">Opsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b, index) => (
                        <tr key={b.id} className="hover:bg-brand-purple/[0.01] transition-colors group">
                          <td className="px-8 py-6 text-gray-300 font-bold text-center">{index + 1}</td>
                          <td className="px-8 py-6 font-black text-gray-800 group-hover:text-brand-purple transition-colors">{b.school_name}</td>
                          <td className="px-8 py-6 text-gray-600 font-medium">{b.pic}</td>
                          <td className="px-8 py-6 text-gray-400 font-mono text-xs">{b.phone}</td>
                          <td className="px-8 py-6">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/5 text-brand-purple text-[10px] font-black border border-brand-purple/10">
                              {formatLongDate(b.date)}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditBooking(b)} className="w-10 h-10 rounded-xl bg-brand-lime/20 text-brand-purple-dark hover:bg-brand-lime transition-all flex items-center justify-center">✏️</button>
                              <button onClick={() => handleDeleteBooking(b)} className="w-10 h-10 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="px-8 py-20 text-center text-gray-400 italic">Belum ada data booking.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {editingBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-purple-dark/40 backdrop-blur-sm p-6 animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border-white/50">
            <h2 className="text-2xl font-black text-brand-purple-dark mb-1">Edit Booking</h2>
            <p className="text-sm text-brand-purple font-bold mb-8 opacity-60 uppercase tracking-widest">{editingBooking.school_name}</p>

            {editError && <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold">{editError}</div>}

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nama PIC</label>
                <input
                  type="text"
                  value={editPic}
                  onChange={(e) => setEditPic(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">No WhatsApp</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Tanggal Kunjungan</label>
                <input
                  type="date"
                  value={editDate}
                  min="2026-05-05"
                  max="2026-07-31"
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button
                onClick={() => setEditingBooking(null)}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateBooking}
                disabled={savingEdit}
                className="flex-1 px-6 py-4 bg-brand-purple text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-purple-light premium-shadow transition-all disabled:opacity-50"
              >
                {savingEdit ? "..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}