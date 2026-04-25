"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Robust API URL detection
const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:3001"
    : "https://unmute-backend-production.up.railway.app");

type School = {
  id: string;
  name: string;
  logo_url: string;
};

type Booking = {
  id: string;
  date: string;
  school_name: string;
  pic: string;
  phone: string;
};

const MONTHS = [
  { year: 2026, month: 4, label: "Mei 2026" },
  { year: 2026, month: 5, label: "Juni 2026" },
  { year: 2026, month: 6, label: "Juli 2026" },
];

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const HOLIDAYS = new Set([
  "2026-05-01",
  "2026-05-04",
  "2026-05-14",
  "2026-05-15",
  "2026-05-27",
  "2026-05-28",
  "2026-05-29",
  "2026-06-01",
  "2026-06-16",
  "2026-07-27",
  "2026-07-31",
]);

const BOOTCAMP_DATES = new Set([
  "2026-07-28",
  "2026-07-29",
  "2026-07-30",
]);

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
  const raw = getDateKey(dateString);
  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function validatePhone(value: string) {
  if (!value) return "Nomor HP wajib diisi";
  if (!/^\d+$/.test(value)) return "Nomor HP hanya boleh angka";
  if (value.length < 10 || value.length > 15) {
    return "Nomor HP harus 10-15 digit angka";
  }
  return "";
}

function getMonthMatrix(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

export default function Home() {
  const [schools, setSchools] = useState<School[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [successSummary, setSuccessSummary] = useState<{
    schoolName: string;
    pic: string;
    phone: string;
    date: string;
  } | null>(null);

  const fetchSchools = async () => {
    const res = await fetch(`${API_URL}/api/schools`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setSchools(data);
    } else {
      throw new Error(data.message || "Invalid data format from API");
    }
  };

  const fetchBookings = async () => {
    const res = await fetch(`${API_URL}/api/bookings`);
    const data = await res.json();
    if (Array.isArray(data)) {
      setBookings(data);
    } else {
      throw new Error(data.message || "Invalid data format from API");
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await fetchSchools();
        await fetchBookings();
      } catch {
        setError("Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const bookedSchoolNames = useMemo(() => new Set(bookings.map((b) => b.school_name)), [bookings]);
  const availableSchools = useMemo(() => {
    return schools.filter((s) => !bookedSchoolNames.has(s.name)).sort((a, b) => a.name.localeCompare(b.name));
  }, [schools, bookedSchoolNames]);
  const bookedDates = useMemo(() => new Set(bookings.map((b) => getDateKey(b.date))), [bookings]);
  const sortedBookings = useMemo(() => [...bookings].sort((a, b) => getDateKey(a.date).localeCompare(getDateKey(b.date))), [bookings]);

  const filteredBookings = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return sortedBookings;
    return sortedBookings.filter((b) => {
      const displayDate = formatLongDate(b.date).toLowerCase();
      return (
        b.school_name.toLowerCase().includes(keyword) ||
        b.pic.toLowerCase().includes(keyword) ||
        b.phone.toLowerCase().includes(keyword) ||
        displayDate.includes(keyword)
      );
    });
  }, [sortedBookings, searchTerm]);

  const selectedSchool = useMemo(() => schools.find((s) => s.id === schoolId) || null, [schools, schoolId]);

  const getDateStatus = (currentDate: Date) => {
    const dateKey = formatDateLocal(currentDate);
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const day = currentDate.getDay();
    if (year !== 2026 || !(month === 4 || month === 5 || month === 6)) return "blocked";
    if (bookedDates.has(dateKey)) return "booked";
    if (BOOTCAMP_DATES.has(dateKey)) return "bootcamp";
    if (day === 0 || day === 6 || HOLIDAYS.has(dateKey)) return "holiday";
    if (month === 4 && Number(dateKey.slice(8, 10)) < 5) return "holiday";
    return "available";
  };

  const getDayClassName = (currentDate: Date) => {
    const dateKey = formatDateLocal(currentDate);
    const status = getDateStatus(currentDate);
    const base = "h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center text-sm font-semibold transition-all duration-200 border-2 shadow-sm";

    if (dateKey === date) return `${base} bg-brand-purple text-white border-brand-purple scale-110 z-10`;
    if (status === "booked") return `${base} bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed grayscale`;
    if (status === "bootcamp") return `${base} bg-brand-lime text-brand-purple-dark border-brand-lime cursor-not-allowed opacity-80`;
    if (status === "holiday" || status === "blocked") return `${base} bg-red-50 text-red-400 border-red-100 cursor-not-allowed`;

    return `${base} bg-white text-brand-purple-dark border-gray-100 hover:border-brand-purple hover:bg-brand-purple/5 hover:scale-105`;
  };

  const handleDateClick = (clickedDate: Date) => {
    const status = getDateStatus(clickedDate);
    if (status !== "available") return;
    setDate(formatDateLocal(clickedDate));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSuccessSummary(null);
    setPhoneError("");
    if (!schoolId || !pic || !phone || !date) {
      setError("Semua field wajib diisi");
      return;
    }
    const currentPhoneError = validatePhone(phone);
    if (currentPhoneError) {
      setPhoneError(currentPhoneError);
      return;
    }
    if (bookedDates.has(date)) {
      setError("Tanggal ini sudah dipilih dan tidak bisa digunakan lagi.");
      return;
    }
    if (!selectedSchool) {
      setError("Sekolah tidak ditemukan.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ school_id: schoolId, contact_name: pic, phone_number: phone, date }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Gagal menyimpan booking");
        return;
      }
      setSuccess("Booking berhasil disimpan! Sampai jumpa di lokasi.");
      setSuccessSummary({ schoolName: selectedSchool.name, pic, phone, date });
      await fetchBookings();
      setSchoolId("");
      setPic("");
      setPhone("");
      setDate("");
      setPhoneError("");
    } catch (err) {
      console.error(err);
      setError("Server tidak bisa dihubungi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pb-20 overflow-x-hidden">
      {/* Navbar / Header */}
      <nav className="sticky top-0 z-50 glass-card px-4 py-3 sm:px-6 mb-8 border-b border-white/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Unmute by Unifers" width={150} height={50} className="h-10 sm:h-12 w-auto object-contain" priority />
            <div className="h-6 w-[2px] bg-gray-200 mx-2 hidden sm:block"></div>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-brand-purple-dark hidden sm:block">Portal <span className="text-brand-purple">Booking</span></h1>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link href="/home" className="text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-purple transition-colors uppercase tracking-wider">
              Home
            </Link>
            <Link href="/" className="text-xs sm:text-sm font-bold text-brand-purple hover:text-brand-purple-light transition-colors uppercase tracking-wider">
              Booking
            </Link>
            <div className="relative group" tabIndex={0}>
              <button className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-purple focus:text-brand-purple transition-colors uppercase tracking-wider">
                Pengumuman <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all flex flex-col overflow-hidden z-50">
                <a href="/pengumuman/sekolah" className="px-5 py-4 text-xs font-black text-gray-600 hover:bg-brand-purple/5 hover:text-brand-purple uppercase tracking-wider">Daftar Partisipan Sekolah</a>
                <a href="/pengumuman/perwakilan" className="px-5 py-4 text-xs font-black text-gray-600 hover:bg-brand-purple/5 hover:text-brand-purple border-t border-gray-50 uppercase tracking-wider">Daftar Siswa Perwakilan</a>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Sistem Aktif
            </div>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in">
        
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto py-6">
          <h1 className="text-4xl sm:text-5xl font-black text-brand-purple-dark tracking-tight">
            Booking <span className="text-brand-purple underline decoration-brand-lime decoration-8">Kunjungan</span> Roadshow
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Amankan jadwal sekolahmu untuk ikut keseruan roadshow Unmute. Pilih sekolah, isi data, dan tentukan tanggalnya.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-brand-purple border-t-brand-lime rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Booking Form Card */}
            <div className="glass-card rounded-[2.5rem] p-6 sm:p-10 premium-shadow relative overflow-hidden group hover:border-brand-purple/30 transition-colors duration-700">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-lime/10 rounded-full blur-[80px] -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 pointer-events-none -z-10"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-purple/10 rounded-full blur-[80px] -ml-16 -mb-16 transition-transform group-hover:scale-150 duration-700 pointer-events-none -z-10"></div>
              
              <div className="relative z-10 grid lg:grid-cols-5 gap-10">
                
                {/* Left Side: Form */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-brand-purple-dark mb-1">Data Booking</h2>
                    <p className="text-sm text-gray-500">Lengkapi formulir di bawah ini.</p>
                  </div>

                  {success && (
                    <div className="p-4 rounded-2xl bg-green-50 text-green-700 border border-green-100 flex items-center gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center shrink-0">✓</div>
                      <span className="text-sm font-semibold">{success}</span>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 rounded-2xl bg-red-50 text-red-700 border border-red-100 flex items-center gap-3 animate-fade-in">
                      <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center shrink-0">!</div>
                      <span className="text-sm font-semibold">{error}</span>
                    </div>
                  )}

                  {successSummary && (
                    <div className="p-5 rounded-2xl bg-brand-purple/5 border border-brand-purple/10 space-y-2 animate-fade-in">
                      <h3 className="font-bold text-brand-purple">Ringkasan Terakhir:</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>🏫 <span className="font-medium">{successSummary.schoolName}</span></p>
                        <p>👤 <span className="font-medium">{successSummary.pic}</span></p>
                        <p>📅 <span className="font-medium">{formatLongDate(successSummary.date)}</span></p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 px-1">Pilih Sekolah</label>
                      <select
                        value={schoolId}
                        onChange={(e) => {
                          setSchoolId(e.target.value);
                          if (error) setError("");
                          if (success) setSuccess("");
                        }}
                        className="w-full bg-white/60 rounded-2xl border-2 border-gray-100 p-4 outline-none focus:border-brand-purple focus:bg-white transition-all appearance-none cursor-pointer hover:border-brand-purple/30 font-medium"
                        disabled={availableSchools.length === 0}
                      >
                        <option value="">-- Pilih Sekolah --</option>
                        {availableSchools.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      {availableSchools.length === 0 && (
                        <p className="text-xs text-orange-600 font-medium italic">⚠️ Semua sekolah sudah penuh dibooking.</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 px-1">Nama PIC</label>
                      <input
                        type="text"
                        placeholder="Siapa yang bisa dihubungi?"
                        value={pic}
                        onChange={(e) => {
                          setPic(e.target.value);
                          if (error) setError("");
                          if (success) setSuccess("");
                        }}
                        className="w-full bg-white/60 rounded-2xl border-2 border-gray-100 p-4 outline-none focus:border-brand-purple focus:bg-white transition-all font-medium"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 px-1">Nomor WhatsApp</label>
                      <input
                        type="text"
                        placeholder="Contoh: 08123456789"
                        value={phone}
                        onChange={(e) => {
                          const onlyDigits = e.target.value.replace(/\D/g, "");
                          setPhone(onlyDigits);
                          setPhoneError(validatePhone(onlyDigits));
                          if (error) setError("");
                          if (success) setSuccess("");
                        }}
                        className={`w-full bg-white/60 rounded-2xl border-2 p-4 outline-none focus:bg-white transition-all font-medium ${phoneError ? "border-red-400" : "border-gray-100 focus:border-brand-purple hover:border-brand-purple/30"}`}
                      />
                      {phoneError && <p className="text-xs text-red-500 font-medium px-1">{phoneError}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 px-1">Tanggal Terpilih</label>
                      <div className="w-full bg-gray-50/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-200 p-4 text-brand-purple font-bold">
                        {date ? formatLongDate(date) : "⚠️ Pilih di kalender →"}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!schoolId || !pic || !phone || !date || submitting}
                      className={`w-full rounded-2xl p-4 text-white font-bold text-lg shadow-lg transition-all transform active:scale-95 ${!schoolId || !pic || !phone || !date || submitting
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-brand-purple hover:bg-brand-purple-light premium-shadow hover:-translate-y-1 hover:shadow-brand-purple/20"
                        }`}
                    >
                      {submitting ? "Memproses..." : "Konfirmasi Booking"}
                    </button>
                  </form>
                </div>

                {/* Right Side: Calendar */}
                <div className="lg:col-span-3 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-brand-purple-dark mb-1">Kalender Jadwal</h2>
                      <p className="text-sm text-gray-500">Pilih slot yang masih tersedia (hijau).</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs font-bold uppercase">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full border border-gray-100 shadow-sm hover:scale-105 transition-transform">
                        <span className="w-2.5 h-2.5 rounded-full bg-white border-2 border-gray-100"></span> Tersedia
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-full text-gray-400 border border-gray-100 hover:scale-105 transition-transform">
                        <span className="w-2.5 h-2.5 rounded-full bg-gray-300"></span> Terisi
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-brand-lime/20 rounded-full text-brand-purple border border-brand-lime/30 hover:scale-105 transition-transform">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-lime"></span> Event
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-full text-red-400 border border-red-100 hover:scale-105 transition-transform">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-200"></span> Libur
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {MONTHS.map((item) => {
                      const weeks = getMonthMatrix(item.year, item.month);
                      return (
                        <div key={`${item.year}-${item.month}`} className="space-y-4">
                          <h3 className="text-center font-black text-brand-purple uppercase tracking-widest">{item.label}</h3>
                          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                            <div className="grid grid-cols-7 mb-2">
                              {WEEKDAYS.map((day) => (
                                <div key={day} className="text-[10px] text-center font-black text-gray-400 uppercase">{day}</div>
                              ))}
                            </div>
                            <div className="space-y-2">
                              {weeks.map((week, wIdx) => (
                                <div key={wIdx} className="grid grid-cols-7 gap-1 sm:gap-2">
                                  {week.map((day, dIdx) => {
                                    if (!day) return <div key={dIdx} className="h-10 w-10 sm:h-11 sm:w-11" />;
                                    return (
                                      <button
                                        key={dIdx}
                                        type="button"
                                        onClick={() => handleDateClick(day)}
                                        className={getDayClassName(day)}
                                      >
                                        {day.getDate()}
                                      </button>
                                    );
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
                      <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Sekolah</p>
                      <p className="text-xl font-black text-brand-purple">{schools.length}</p>
                    </div>
                    <div className="bg-brand-purple/5 rounded-2xl p-4 border border-brand-purple/10 shadow-sm text-center">
                      <p className="text-[10px] font-black text-brand-purple-light uppercase mb-1">Sudah Booking</p>
                      <p className="text-xl font-black text-brand-purple">{bookedSchoolNames.size}</p>
                    </div>
                    <div className="bg-brand-lime/10 rounded-2xl p-4 border border-brand-lime/20 shadow-sm text-center">
                      <p className="text-[10px] font-black text-brand-purple-dark/60 uppercase mb-1">Tersisa</p>
                      <p className="text-xl font-black text-brand-purple-dark">{availableSchools.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings List Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-3xl font-black text-brand-purple-dark uppercase tracking-tight">Daftar <span className="text-brand-purple">Antrean</span></h2>
                <div className="relative w-full md:max-w-md">
                  <input
                    type="text"
                    placeholder="Cari sekolah, PIC, atau tanggal..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white rounded-2xl border-2 border-gray-100 p-4 pl-12 outline-none focus:border-brand-purple transition-all premium-shadow"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-hidden rounded-3xl border border-gray-100 bg-white premium-shadow">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-purple text-white">
                      <th className="px-6 py-5 text-sm font-black uppercase tracking-wider">No</th>
                      <th className="px-6 py-5 text-sm font-black uppercase tracking-wider">Nama Sekolah</th>
                      <th className="px-6 py-5 text-sm font-black uppercase tracking-wider">PIC</th>
                      <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-center">No HP</th>
                      <th className="px-6 py-5 text-sm font-black uppercase tracking-wider text-center">Tanggal Booking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.length > 0 ? (
                      filteredBookings.map((b, index) => (
                        <tr key={b.id} className="hover:bg-brand-purple/[0.02] transition-colors group">
                          <td className="px-6 py-5 text-gray-400 font-medium">{index + 1}</td>
                          <td className="px-6 py-5">
                            <span className="font-bold text-gray-800 group-hover:text-brand-purple transition-colors">{b.school_name}</span>
                          </td>
                          <td className="px-6 py-5 text-gray-600 font-medium">{b.pic}</td>
                          <td className="px-6 py-5 text-center text-gray-600 font-mono text-sm">{b.phone}</td>
                          <td className="px-6 py-5 text-center">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-purple/5 text-brand-purple text-xs font-bold border border-brand-purple/10">
                              {formatLongDate(b.date)}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic">
                          Tidak ada data booking yang ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-4">
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((b, index) => (
                    <div key={b.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-md uppercase">#{index + 1}</span>
                        <span className="px-3 py-1 rounded-full bg-brand-purple/5 text-brand-purple text-[10px] font-black border border-brand-purple/10">
                          {formatLongDate(b.date)}
                        </span>
                      </div>
                      <div>
                        <p className="text-lg font-black text-gray-800 leading-tight">{b.school_name}</p>
                        <p className="text-sm text-gray-500 font-medium">PIC: {b.pic}</p>
                      </div>
                      <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">{b.phone}</span>
                        <div className="w-8 h-8 bg-brand-lime rounded-full flex items-center justify-center text-brand-purple text-xs shadow-sm">📞</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl p-10 text-center text-gray-400 italic border border-gray-100 shadow-sm">
                    Tidak ada data booking.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer Decoration */}
      <div className="mt-20 py-10 text-center opacity-30 grayscale pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-purple">Created with ❤️ for Unmute Roadshow 2026</p>
      </div>
    </main>
  );
}