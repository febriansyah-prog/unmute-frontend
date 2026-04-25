"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (typeof window !== "undefined" && window.location.hostname === "localhost" 
                  ? "http://localhost:3001" 
                  : "https://unmute-backend-production.up.railway.app");

type Booking = {
  id: string;
  date: string;
  school_name: string;
  pic: string;
  phone: string;
  status: string;
  school_id: string;
};

type Delegate = {
  id: string;
  school_id: string;
  nisn: string;
  name: string;
  topic: string;
};

type Toast = {
  type: "success" | "error";
  text: string;
};

export default function AdminDelegatesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schools, setSchools] = useState<{id: string, name: string}[]>([]);
  
  // States for Modals
  const [selectedSchool, setSelectedSchool] = useState<{id: string, name: string} | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  
  // Delegates List state
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loadingDelegates, setLoadingDelegates] = useState(false);

  // Add/Edit Delegate state
  const [delId, setDelId] = useState("");
  const [nisn, setNisn] = useState("");
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("Public Speaking");
  const [savingDelegate, setSavingDelegate] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const TOPICS = ["Public Speaking", "Artificial Intelligence", "Content Creator"];

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (isAuth !== "true") {
      router.push("/admin/login");
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
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

  async function fetchData() {
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
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const visitedSchools = useMemo(() => {
    const visitedBookings = bookings.filter((b) => b.status === "Telah Dikunjungi");
    return visitedBookings.map((b) => {
      const s = schools.find((school) => school.name === b.school_name);
      return { id: s?.id || "", name: b.school_name, booking_id: b.id };
    }).filter(s => s.id !== "");
  }, [bookings, schools]);

  const openAddModal = (school: {id: string, name: string}) => {
    setSelectedSchool(school);
    setNisn("");
    setName("");
    setTopic("Public Speaking");
    setIsEditing(false);
    setDelId("");
    setIsAddModalOpen(true);
  };

  const openListModal = async (school: {id: string, name: string}) => {
    setSelectedSchool(school);
    setIsListModalOpen(true);
    await fetchDelegates(school.id);
  };

  const fetchDelegates = async (school_id: string) => {
    setLoadingDelegates(true);
    try {
      const res = await fetch(`${API_URL}/api/delegates/school/${school_id}`);
      if (!res.ok) throw new Error("Gagal mengambil data siswa");
      const data = await res.json();
      if (Array.isArray(data)) {
        setDelegates(data);
      }
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal memuat daftar siswa");
    } finally {
      setLoadingDelegates(false);
    }
  }

  const handleSaveDelegate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchool) return;
    if (!nisn.trim() || !name.trim()) {
      showToast("error", "NISN dan Nama wajib diisi");
      return;
    }
    
    setSavingDelegate(true);
    try {
      if (isEditing) {
        const res = await fetch(`${API_URL}/api/delegates/${delId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nisn, name, topic })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal memperbarui siswa");
        showToast("success", "Siswa berhasil diperbarui");
        setIsAddModalOpen(false);
        if (isListModalOpen) fetchDelegates(selectedSchool.id);
      } else {
        const res = await fetch(`${API_URL}/api/delegates`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ school_id: selectedSchool.id, nisn, name, topic })
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Gagal menambahkan siswa");
        showToast("success", "Siswa berhasil ditambahkan");
        setIsAddModalOpen(false);
        if (isListModalOpen) fetchDelegates(selectedSchool.id);
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err);
      showToast("error", err.message || "Terjadi kesalahan");
    } finally {
      setSavingDelegate(false);
    }
  }

  const handleDeleteDelegate = async (id: string, delName: string) => {
    if (!window.confirm(`Yakin ingin menghapus ${delName}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/delegates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus siswa");
      showToast("success", "Siswa berhasil dihapus");
      if (selectedSchool) fetchDelegates(selectedSchool.id);
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal menghapus siswa");
    }
  }

  const handleCancelVisit = async (school: {id: string, name: string, booking_id: string}) => {
    const confirmed = window.confirm(`PENTING: Menghapus sekolah ${school.name} dari daftar Telah Dikunjungi juga akan MENGHAPUS SEMUA DATA SISWA PERWAKILANNYA.\n\nLanjutkan (Yes / No)?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      // 1. Delete all delegates for this school
      const delRes = await fetch(`${API_URL}/api/delegates/school/${school.id}`, { method: "DELETE" });
      if (!delRes.ok) throw new Error("Gagal menghapus data siswa");

      // 2. Reset booking status
      const statusRes = await fetch(`${API_URL}/api/bookings/${school.booking_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Menunggu" })
      });
      if (!statusRes.ok) throw new Error("Gagal mereset status sekolah");

      showToast("success", "Sekolah dan data siswa berhasil dihapus dari kunjungan");
      await fetchData(); // Refresh table
    } catch (err) {
      console.error(err);
      showToast("error", "Gagal membatalkan kunjungan");
      setLoading(false);
    }
  }

  const handleEditClick = (d: Delegate) => {
    setDelId(d.id);
    setNisn(d.nisn);
    setName(d.name);
    setTopic(d.topic);
    setIsEditing(true);
    setIsAddModalOpen(true);
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
            <Image src="/logo.png" alt="Unmute by Unifers" width={120} height={40} className="h-8 sm:h-10 w-auto object-contain" priority />
            <div className="h-6 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
            <h1 className="text-xl font-black uppercase tracking-tight text-brand-purple-dark hidden sm:block">Panel <span className="text-brand-purple">Admin</span></h1>
            
            <button
              onClick={() => router.push("/admin")}
              className="px-4 py-2 bg-brand-purple/5 text-brand-purple rounded-xl text-sm font-black uppercase tracking-wider hover:bg-brand-purple hover:text-white transition-all ml-2"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/admin/schools")}
              className="px-4 py-2 bg-brand-purple/5 text-brand-purple rounded-xl text-sm font-black uppercase tracking-wider hover:bg-brand-purple hover:text-white transition-all ml-2"
            >
              Sekolah
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
            <h2 className="text-4xl font-black text-brand-purple-dark uppercase tracking-tight">Manajemen <span className="text-brand-purple">Perwakilan</span></h2>
            <p className="text-gray-500 font-medium">Kelola siswa delegasi dari sekolah yang telah dikunjungi untuk Bootcamp.</p>
          </div>
          <a
            href={`${API_URL}/api/export/delegates`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-lime text-brand-purple-dark rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-brand-lime-hover transition-all premium-shadow"
          >
            📥 Unduh Semua Perwakilan (Excel)
          </a>
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
          <div className="glass-card rounded-[2.5rem] overflow-hidden premium-shadow">
            <div className="p-8 sm:p-10 border-b border-gray-100">
              <h3 className="text-2xl font-black text-brand-purple-dark uppercase">Sekolah <span className="text-brand-purple">Telah Dikunjungi</span></h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-brand-purple/5 text-brand-purple text-[10px] font-black uppercase tracking-widest">
                    <th className="px-10 py-5 text-center">No</th>
                    <th className="px-10 py-5">Nama Sekolah</th>
                    <th className="px-10 py-5 text-center">Kelola Perwakilan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visitedSchools.length > 0 ? (
                    visitedSchools.map((school, index) => (
                      <tr key={school.id} className="hover:bg-brand-purple/[0.01] transition-colors group">
                        <td className="px-10 py-6 text-gray-300 font-bold text-center">{index + 1}</td>
                        <td className="px-10 py-6 font-black text-gray-800 group-hover:text-brand-purple transition-colors">{school.name}</td>
                        <td className="px-10 py-6">
                          <div className="flex justify-center gap-3">
                            <button 
                              onClick={() => openAddModal(school)} 
                              className="px-4 py-2 rounded-xl bg-brand-purple text-white font-bold text-xs uppercase tracking-wider hover:bg-brand-purple-light transition-all flex items-center gap-2"
                            >
                              <span>+</span> Tambah Siswa
                            </button>
                            <button 
                              onClick={() => openListModal(school)} 
                              className="px-4 py-2 rounded-xl bg-brand-lime/20 text-brand-purple-dark font-bold text-xs uppercase tracking-wider hover:bg-brand-lime transition-all flex items-center gap-2"
                            >
                              <span>👁️</span> Lihat Siswa
                            </button>
                            <button 
                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                              onClick={() => handleCancelVisit(school as any)} 
                              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 ml-4"
                              title="Hapus dari daftar kunjungan"
                            >
                              <span>🗑️</span> Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="px-10 py-20 text-center text-gray-400 italic">Belum ada sekolah yang ditandai Telah Dikunjungi.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {isAddModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-brand-purple-dark/40 backdrop-blur-sm p-6 animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border-white/50">
            <h2 className="text-2xl font-black text-brand-purple-dark mb-1">{isEditing ? "Edit Siswa" : "Tambah Siswa"}</h2>
            <p className="text-sm text-brand-purple font-bold mb-8 opacity-60 uppercase tracking-widest">{selectedSchool.name}</p>

            <form onSubmit={handleSaveDelegate} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">NISN</label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
                  onKeyDown={(e) => {
                    // Allow navigation and editing keys
                    if (["Backspace", "ArrowLeft", "ArrowRight", "Tab", "Delete"].includes(e.key)) return;
                    // Block non-numeric keys
                    if (!/[0-9]/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium"
                  required
                  placeholder="Hanya angka"
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Topik Materi</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium cursor-pointer"
                >
                  {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="mt-10 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={savingDelegate}
                  className="flex-1 px-6 py-4 bg-brand-purple text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-purple-light premium-shadow transition-all disabled:opacity-50"
                >
                  {savingDelegate ? "..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List Modal */}
      {isListModalOpen && selectedSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-purple-dark/40 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card rounded-[2.5rem] p-6 sm:p-10 premium-shadow border-white/50">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-brand-purple-dark mb-1">Daftar Perwakilan</h2>
                <p className="text-sm text-brand-purple font-bold opacity-60 uppercase tracking-widest">{selectedSchool.name}</p>
              </div>
              <button onClick={() => setIsListModalOpen(false)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 font-bold">✕</button>
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center bg-brand-purple/5 p-4 rounded-2xl border border-brand-purple/10 gap-3">
              <span className="font-bold text-brand-purple-dark">Total: {delegates.length}/10 Siswa</span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                {delegates.length >= 10 && (
                  <span className="text-red-500 text-[10px] sm:text-xs font-bold bg-red-50 px-3 py-2 rounded-xl border border-red-100 uppercase tracking-wide">
                    Siswa terdaftar sudah 10 orang
                  </span>
                )}
                <button 
                  onClick={() => openAddModal(selectedSchool)} 
                  disabled={delegates.length >= 10}
                  className="px-4 py-2 bg-brand-purple text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-purple-light transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  + Tambah Siswa
                </button>
              </div>
            </div>

            {loadingDelegates ? (
              <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-brand-purple border-t-transparent rounded-full animate-spin"></div></div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-widest">
                      <th className="px-6 py-4">No</th>
                      <th className="px-6 py-4">NISN</th>
                      <th className="px-6 py-4">Nama Siswa</th>
                      <th className="px-6 py-4">Topik</th>
                      <th className="px-6 py-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {delegates.length > 0 ? (
                      delegates.map((d, idx) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-400 font-bold">{idx + 1}</td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-600">{d.nisn}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">{d.name}</td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-brand-lime/10 text-brand-purple-dark rounded-full text-[10px] font-black border border-brand-lime/20">{d.topic}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => handleEditClick(d)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-brand-lime/50 transition-all flex items-center justify-center text-xs">✏️</button>
                              <button onClick={() => handleDeleteDelegate(d.id, d.name)} className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center text-xs">🗑️</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">Belum ada siswa yang ditambahkan.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
