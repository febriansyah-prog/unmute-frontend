"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 
                (typeof window !== "undefined" && window.location.hostname === "localhost" 
                  ? "http://localhost:3001" 
                  : "https://unmute-backend-production.up.railway.app");

type Delegate = {
  id: string;
  school_id: string;
  nisn: string;
  student_name: string;
  topic: string;
  school_name?: string;
};

type School = {
  id: string;
  name: string;
};

type Toast = {
  type: "success" | "error";
  text: string;
};

export default function AdminDelegatesPage() {
  const [authorized, setAuthorized] = useState(false);
  const [visitedSchools, setVisitedSchools] = useState<School[]>([]);
  const [allDelegates, setAllDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  // Modal states
  const [activeModal, setActiveModal] = useState<"add" | "view" | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);

  // Add/Edit Delegate states
  const [nisn, setNisn] = useState("");
  const [studentName, setStudentName] = useState("");
  const [topic, setTopic] = useState("");
  const [editingDelegate, setEditingDelegate] = useState<Delegate | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      const [bookingsRes, schoolsRes, delegatesRes] = await Promise.all([
        fetch(`${API_URL}/api/bookings`),
        fetch(`${API_URL}/api/schools`),
        fetch(`${API_URL}/api/delegates`)
      ]);
      
      if (!bookingsRes.ok || !schoolsRes.ok || !delegatesRes.ok) {
        throw new Error("Gagal mengambil data dari server");
      }

      const bookings = await bookingsRes.json();
      const schools = await schoolsRes.json();
      const delegates = await delegatesRes.json();

      // Extract unique schools that have status 'visited'
      const visitedSchoolIds = new Set(bookings.filter((b: any) => b.status === "visited").map((b: any) => b.school_id));
      // wait, our GET /api/bookings returns school_name, not school_id directly in the view.
      // But we need school_id for creating delegates.
      // Let's match by school_name from bookings to get the real school object.
      
      const visitedNames = new Set(bookings.filter((b: any) => b.status === "visited").map((b: any) => b.school_name));
      const visited = schools.filter((s: School) => visitedNames.has(s.name));

      setVisitedSchools(visited);
      setAllDelegates(delegates);
    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/admin/login");
  };

  const openAddModal = (school: School) => {
    setSelectedSchool(school);
    setNisn("");
    setStudentName("");
    setTopic("");
    setEditingDelegate(null);
    setActiveModal("add");
  };

  const openViewModal = (school: School) => {
    setSelectedSchool(school);
    setActiveModal("view");
  };

  const saveDelegate = async () => {
    if (!selectedSchool) return;
    if (!nisn.trim() || !studentName.trim() || !topic) {
      showToast("error", "Semua field wajib diisi");
      return;
    }

    setSubmitting(true);
    try {
      const isEdit = !!editingDelegate;
      const url = isEdit 
        ? `${API_URL}/api/delegates/${editingDelegate.id}` 
        : `${API_URL}/api/delegates`;
        
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          school_id: selectedSchool.id,
          nisn,
          student_name: studentName,
          topic
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan data");

      showToast("success", isEdit ? "Data diperbarui" : "Siswa ditambahkan");
      await fetchData();
      
      if (!isEdit) {
        setNisn("");
        setStudentName("");
        setTopic("");
      } else {
        setEditingDelegate(null);
        setActiveModal("view"); // go back to view mode
      }
    } catch (err: any) {
      showToast("error", err.message || "Gagal menghubungi server");
    } finally {
      setSubmitting(false);
    }
  };

  const editDelegate = (d: Delegate) => {
    setEditingDelegate(d);
    setNisn(d.nisn);
    setStudentName(d.student_name);
    setTopic(d.topic);
    setActiveModal("add"); // use add modal for editing
  };

  const deleteDelegate = async (id: string) => {
    if (!window.confirm("Hapus data siswa ini?")) return;
    try {
      const res = await fetch(`${API_URL}/api/delegates/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus");
      showToast("success", "Siswa dihapus");
      await fetchData();
    } catch (err: any) {
      showToast("error", err.message);
    }
  };

  if (!authorized) return null;

  return (
    <div className="min-h-screen pb-20">
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
            <h1 className="text-xl font-black uppercase tracking-tight text-brand-purple-dark hidden sm:block">Perwakilan <span className="text-brand-purple">Sekolah</span></h1>
            
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
            <div className="glass-card rounded-[2.5rem] overflow-hidden premium-shadow">
              <div className="p-6 sm:p-10 flex flex-col md:flex-row justify-between gap-6 border-b border-gray-100 items-start md:items-center">
                <div>
                  <h2 className="text-2xl font-black text-brand-purple-dark uppercase mb-2">Delegasi <span className="text-brand-purple">Sekolah</span></h2>
                  <p className="text-sm text-gray-500 font-medium">Daftar sekolah yang telah dikunjungi. Input maksimal 10 siswa perwakilan per sekolah.</p>
                </div>
                
                <a
                  href={`${API_URL}/api/export/delegates`}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-brand-lime text-brand-purple-dark rounded-2xl font-black text-sm uppercase tracking-wider hover:bg-brand-lime-hover transition-all premium-shadow whitespace-nowrap"
                >
                  📥 Unduh Semua (Excel)
                </a>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-brand-purple/5 text-brand-purple text-[10px] font-black uppercase tracking-widest">
                      <th className="px-8 py-5 text-center">No</th>
                      <th className="px-8 py-5">Nama Sekolah</th>
                      <th className="px-8 py-5 text-center">Jumlah Delegasi</th>
                      <th className="px-8 py-5 text-center">Opsi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {visitedSchools.length > 0 ? (
                      visitedSchools.map((s, index) => {
                        const count = allDelegates.filter(d => d.school_id === s.id).length;
                        return (
                          <tr key={s.id} className="hover:bg-brand-purple/[0.01] transition-colors group">
                            <td className="px-8 py-6 text-gray-300 font-bold text-center">{index + 1}</td>
                            <td className="px-8 py-6 font-black text-gray-800 group-hover:text-brand-purple transition-colors">{s.name}</td>
                            <td className="px-8 py-6 text-center">
                              <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black border ${count >= 10 ? 'bg-green-50 text-green-600 border-green-200' : 'bg-orange-50 text-orange-500 border-orange-200'}`}>
                                {count} / 10
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => openAddModal(s)}
                                  className="px-4 py-2 bg-brand-purple text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-brand-purple-light transition-all shadow-sm"
                                >
                                  + Tambah
                                </button>
                                <button
                                  onClick={() => openViewModal(s)}
                                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                >
                                  👁️ Lihat
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">Belum ada sekolah yang ditandai "Telah Dikunjungi".</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      {activeModal === "add" && selectedSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-purple-dark/40 backdrop-blur-sm p-6 animate-fade-in">
          <div className="w-full max-w-md glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border-white/50">
            <h2 className="text-2xl font-black text-brand-purple-dark mb-1">{editingDelegate ? "Edit Siswa" : "Tambah Siswa"}</h2>
            <p className="text-sm text-brand-purple font-bold mb-8 opacity-60 uppercase tracking-widest">{selectedSchool.name}</p>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">NISN</label>
                <input
                  type="text"
                  value={nisn}
                  onChange={(e) => setNisn(e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-mono"
                  placeholder="Contoh: 0081234567"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Nama Siswa</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 px-1">Topik Materi</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-brand-purple focus:bg-white rounded-2xl p-4 outline-none transition-all font-medium"
                >
                  <option value="" disabled>Pilih Topik...</option>
                  <option value="Public Speaking">Public Speaking</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="Content Creator">Content Creator</option>
                </select>
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button
                onClick={() => { setActiveModal(editingDelegate ? "view" : null); setEditingDelegate(null); }}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all"
              >
                Batal
              </button>
              <button
                onClick={saveDelegate}
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-brand-purple text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-brand-purple-light premium-shadow transition-all disabled:opacity-50"
              >
                {submitting ? "..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {activeModal === "view" && selectedSchool && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-purple-dark/40 backdrop-blur-sm p-6 animate-fade-in">
          <div className="w-full max-w-4xl glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border-white/50 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-brand-purple-dark mb-1">Daftar Siswa</h2>
                <p className="text-sm text-brand-purple font-bold opacity-60 uppercase tracking-widest">{selectedSchool.name}</p>
              </div>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 hover:bg-gray-200">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[300px]">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="bg-brand-purple/5 text-brand-purple text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">No</th>
                    <th className="px-6 py-4">NISN</th>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">Topik</th>
                    <th className="px-6 py-4 text-center">Opsi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {allDelegates.filter(d => d.school_id === selectedSchool.id).length > 0 ? (
                    allDelegates.filter(d => d.school_id === selectedSchool.id).map((d, index) => (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-400 font-bold">{index + 1}</td>
                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">{d.nisn}</td>
                        <td className="px-6 py-4 font-black text-gray-800">{d.student_name}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black">
                            {d.topic}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => editDelegate(d)} className="p-2 text-blue-500 hover:text-blue-700 transition-colors">✏️</button>
                            <button onClick={() => deleteDelegate(d.id)} className="p-2 text-red-500 hover:text-red-700 transition-colors">🗑️</button>
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
          </div>
        </div>
      )}
    </div>
  );
}
