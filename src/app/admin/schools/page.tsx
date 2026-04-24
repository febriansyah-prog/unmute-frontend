"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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

export default function AdminSchoolsPage() {
  const router = useRouter();

  const [authorized, setAuthorized] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [adding, setAdding] = useState(false);

  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editSchoolName, setEditSchoolName] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const [toast, setToast] = useState<Toast | null>(null);

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

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [schoolsRes, bookingsRes] = await Promise.all([
        fetch(`${API_URL}/api/schools`),
        fetch(`${API_URL}/api/bookings`),
      ]);
      if (!schoolsRes.ok || !bookingsRes.ok) throw new Error("Gagal mengambil data");
      const schoolsData = await schoolsRes.json();
      const bookingsData = await bookingsRes.json();
      setSchools(schoolsData);
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
      setError("Server tidak bisa dihubungi atau terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => setToast({ type, text });

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const bookedSchoolNames = useMemo(() => new Set(bookings.map((b) => b.school_name)), [bookings]);

  const filteredSchools = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const sorted = [...schools].sort((a, b) => a.name.localeCompare(b.name));
    if (!keyword) return sorted;
    return sorted.filter((school) => {
      const status = bookedSchoolNames.has(school.name) ? "sudah booking" : "belum booking";
      return school.name.toLowerCase().includes(keyword) || status.includes(keyword);
    });
  }, [schools, searchTerm, bookedSchoolNames]);

  const handleAddSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newSchoolName.trim();
    if (!name) {
      showToast("error", "Nama sekolah wajib diisi");
      return;
    }
    const duplicate = schools.some((s) => s.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      showToast("error", "Nama sekolah sudah ada");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`${API_URL}/api/schools`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menambahkan sekolah");
      showToast("success", "Sekolah berhasil ditambahkan");
      setNewSchoolName("");
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal menambahkan sekolah");
    } finally {
      setAdding(false);
    }
  };

  const openEditModal = (school: School) => {
    setEditingSchool(school);
    setEditSchoolName(school.name);
  };

  const handleEditSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    const name = editSchoolName.trim();
    if (!name) {
      showToast("error", "Nama sekolah wajib diisi");
      return;
    }
    const duplicate = schools.some((s) => s.id !== editingSchool.id && s.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      showToast("error", "Nama sekolah sudah ada");
      return;
    }
    setSavingEdit(true);
    try {
      const res = await fetch(`${API_URL}/api/schools/${editingSchool.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mengubah sekolah");
      showToast("success", "Sekolah berhasil diubah");
      setEditingSchool(null);
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal mengubah sekolah");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteSchool = async (school: School) => {
    if (bookedSchoolNames.has(school.name)) {
      showToast("error", "Sekolah ini sudah memiliki booking. Hapus booking terlebih dahulu.");
      return;
    }
    const agree = window.confirm(`Yakin ingin menghapus ${school.name}?`);
    if (!agree) return;
    try {
      const res = await fetch(`${API_URL}/api/schools/${school.id}`, { method: "DELETE" });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || "Gagal menghapus sekolah");
      }
      showToast("success", "Sekolah berhasil dihapus");
      await fetchData();
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal menghapus sekolah");
    }
  };

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
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-brand-purple rounded-xl flex items-center justify-center text-brand-lime font-black text-xl premium-shadow transform rotate-3">P</div>
            <h1 className="text-xl font-black uppercase tracking-tight text-brand-purple-dark hidden sm:block">Panel <span className="text-brand-purple">Admin</span></h1>
            
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 bg-brand-purple/5 text-brand-purple rounded-xl text-sm font-black uppercase tracking-wider hover:bg-brand-purple hover:text-white transition-all ml-2"
            >
              Dashboard
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 animate-fade-in space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-4xl font-black text-brand-purple-dark uppercase tracking-tight">Kelola <span className="text-brand-purple">Sekolah</span></h2>
            <p className="text-gray-500 font-medium">Tambah atau perbarui database sekolah peserta roadshow.</p>
          </div>
        </div>

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
          <>
            {/* Add School Form */}
            <div className="glass-card rounded-[2.5rem] p-8 sm:p-10 premium-shadow border-white/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <div className="relative z-10 space-y-6">
                <h3 className="text-xl font-black text-brand-purple-dark uppercase">Tambah Sekolah Baru</h3>
                <form onSubmit={handleAddSchool} className="flex flex-col md:flex-row gap-4">
                  <input
                    type="text"
                    placeholder="Contoh: SMA Negeri 1 Makassar"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    className="flex-1 bg-white border-2 border-gray-100 focus:border-brand-purple rounded-2xl p-4 outline-none transition-all font-medium"
                  />
                  <button
                    type="submit"
                    disabled={adding}
                    className={`px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all transform active:scale-95 shadow-lg ${adding ? "bg-gray-300 cursor-not-allowed" : "bg-brand-purple hover:bg-brand-purple-light premium-shadow"}`}
                  >
                    {adding ? "..." : "Tambah Sekolah"}
                  </button>
                </form>
              </div>
            </div>

            {/* Schools List Table */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden premium-shadow">
              <div className="p-8 sm:p-10 flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100">
                <h3 className="text-2xl font-black text-brand-purple-dark uppercase">Daftar <span className="text-brand-purple">Sekolah</span></h3>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari sekolah..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-80 bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-3 pl-10 outline-none transition-all font-medium"
                  />
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-brand-purple/5 text-brand-purple text-[10px] font-black uppercase tracking-widest">
                      <th className="px-10 py-5 text-center">No</th>
                      <th className="px-10 py-5">Nama Sekolah</th>
                      <th className="px-10 py-5 text-center">Status Booking</th>
                      <th className="px-10 py-5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSchools.length > 0 ? (
                      filteredSchools.map((school, index) => {
                        const hasBooking = bookedSchoolNames.has(school.name);
                        return (
                          <tr key={school.id} className="hover:bg-brand-purple/[0.01] transition-colors group">
                            <td className="px-10 py-6 text-gray-300 font-bold text-center">{index + 1}</td>
                            <td className="px-10 py-6 font-black text-gray-800 group-hover:text-brand-purple transition-colors">{school.name}</td>
                            <td className="px-10 py-6 text-center">
                              <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${hasBooking ? "bg-green-50 text-green-600 border-green-100" : "bg-gray-50 text-gray-400 border-gray-100"}`}>
                                {hasBooking ? "✓ Sudah Booking" : "○ Belum Booking"}
                              </span>
                            </td>
                            <td className="px-10 py-6">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => openEditModal(school)} className="w-10 h-10 rounded-xl bg-brand-lime/20 text-brand-purple-dark hover:bg-brand-lime transition-all flex items-center justify-center">✏️</button>
                                <button 
                                  onClick={() => handleDeleteSchool(school)} 
                                  disabled={hasBooking}
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${hasBooking ? "opacity-20 cursor-not-allowed bg-gray-200" : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"}`}
                                >
                                  🗑️
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-400 italic">Data sekolah tidak ditemukan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Edit Modal */}
      {editingSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-purple-dark/40 backdrop-blur-sm p-6 animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border-white/50">
            <h2 className="text-2xl font-black text-brand-purple-dark mb-1">Edit Sekolah</h2>
            <p className="text-sm text-brand-purple font-bold mb-8 opacity-60 uppercase tracking-widest">Update Informasi</p>

            <form onSubmit={handleEditSchool} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nama Sekolah</label>
                <input
                  type="text"
                  value={editSchoolName}
                  onChange={(e) => setEditSchoolName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium"
                  required
                />
              </div>

              <div className="mt-10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingSchool(null)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 px-6 py-4 bg-brand-purple text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-purple-light premium-shadow transition-all disabled:opacity-50"
                >
                  {savingEdit ? "..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}