"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function HomePublicPage() {
  return (
    <main className="min-h-screen pb-20 overflow-x-hidden dark:bg-black transition-colors duration-500">
      {/* Navbar / Header */}
      <nav className="sticky top-0 z-50 glass-card dark:bg-black/50 px-4 py-3 sm:px-6 mb-8 border-b border-white/50 dark:border-gray-800 transition-colors duration-500">
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
            <div className="relative group" tabIndex={0}>
              <button className="flex items-center gap-1 text-xs sm:text-sm font-bold text-gray-500 hover:text-brand-purple focus:text-brand-purple transition-colors uppercase tracking-wider">
                Pengumuman <span className="text-[10px]">▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all flex flex-col overflow-hidden z-50">
                <Link href="/pengumuman/sekolah" className="px-5 py-4 text-xs font-black text-gray-600 hover:bg-brand-purple/5 hover:text-brand-purple uppercase tracking-wider">Daftar Partisipan Sekolah</Link>
                <Link href="/pengumuman/perwakilan" className="px-5 py-4 text-xs font-black text-gray-600 hover:bg-brand-purple/5 hover:text-brand-purple border-t border-gray-50 uppercase tracking-wider">Daftar Siswa Perwakilan</Link>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Banner Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="glass-card dark:bg-gray-900/40 rounded-[2.5rem] p-10 sm:p-20 text-center premium-shadow relative overflow-hidden border border-white/50 dark:border-gray-800 transition-colors duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/5 to-brand-lime/10 dark:from-brand-purple/10 dark:to-brand-lime/5 -z-10 transition-colors duration-500"></div>
          <span className="inline-block px-4 py-1.5 bg-brand-purple/10 dark:bg-brand-purple/20 text-brand-purple dark:text-brand-lime rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-brand-purple/20 dark:border-brand-lime/20 transition-colors">Selamat Datang di Unmute</span>
          <h2 className="text-4xl sm:text-6xl font-black text-brand-purple-dark dark:text-white tracking-tight uppercase leading-tight mb-10 transition-colors">
            Membangun <span className="text-brand-purple underline decoration-brand-lime decoration-8">Karakter</span> Menginspirasi Negeri
          </h2>

          <div className="flex flex-col items-center gap-6 sm:gap-8 mb-12 animate-fade-in relative z-10" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-14 bg-white/40 p-6 sm:p-8 rounded-[2rem] border border-white/60 shadow-xl backdrop-blur-md hover:bg-white/50 transition-colors">
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image src="/logo-unifa.png" alt="Universitas Fajar" width={120} height={120} className="h-20 sm:h-28 w-auto object-contain hover:scale-110 hover:-rotate-3 transition-transform duration-300 relative z-10 drop-shadow-md" />
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image src="/logo-sulsel.png" alt="Provinsi Sulawesi Selatan" width={120} height={120} className="h-20 sm:h-28 w-auto object-contain hover:scale-110 transition-transform duration-300 relative z-10 drop-shadow-md" />
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-brand-lime/30 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Image src="/logo-kbb.png" alt="Kelas Bebas Bicara" width={120} height={120} className="h-20 sm:h-28 w-auto object-contain hover:scale-110 hover:rotate-3 transition-transform duration-300 relative z-10 drop-shadow-md" />
              </div>
            </div>
            
            <div className="flex justify-center mt-6 relative group animate-float">
              <div className="absolute inset-0 bg-brand-purple/20 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <Image src="/logo-unmute-large.png" alt="Unmute by Unifers" width={300} height={150} className="h-32 sm:h-40 w-auto object-contain hover:scale-105 transition-transform duration-500 relative z-10 drop-shadow-2xl" />
            </div>
            
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-medium max-w-3xl mx-auto text-center mt-4 px-4 transition-colors">
              <strong className="text-brand-purple-dark dark:text-brand-lime">Sebuah inisiatif pengabdian masyarakat oleh Universitas Fajar.</strong> Menargetkan pelatihan intensif untuk <strong className="text-brand-purple dark:text-white">5.000 siswa-siswi tingkat SMA, SMK, dan MA</strong> di seluruh Sulawesi Selatan guna mencetak talenta muda yang adaptif di era digital.
            </p>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <Link href="/" className="px-8 py-4 bg-brand-purple text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform premium-shadow">
              Booking Sekarang
            </Link>
          </div>
        </motion.div>

        {/* Features / Content Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mt-16 max-w-6xl mx-auto px-4 z-10 relative">
          
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-card dark:bg-gray-900/50 p-6 sm:p-8 lg:p-10 rounded-3xl premium-shadow flex flex-col items-center text-center group hover:border-brand-purple/50 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(79,38,166,0.1)] dark:hover:shadow-[0_20px_40px_rgba(217,253,31,0.05)]"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-purple to-brand-purple-light dark:from-brand-purple-dark dark:to-brand-purple text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <span className="text-3xl sm:text-4xl">🎙️</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-brand-purple-dark dark:text-white uppercase tracking-wide mb-4 group-hover:text-brand-purple dark:group-hover:text-brand-lime transition-colors">Public Speaking</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Meningkatkan kepercayaan diri dan seni berbicara di depan umum secara memukau, dirancang khusus untuk menggali potensi kepemimpinan siswa-siswi di bangku sekolah.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-card dark:bg-gray-900/50 p-6 sm:p-8 lg:p-10 rounded-3xl premium-shadow flex flex-col items-center text-center group hover:border-brand-lime/80 dark:border-gray-800 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(217,253,31,0.15)] dark:hover:shadow-[0_20px_40px_rgba(217,253,31,0.05)]"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-lime to-brand-lime-hover text-brand-purple-dark rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
              <span className="text-3xl sm:text-4xl">💻</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-brand-purple-dark dark:text-white uppercase tracking-wide mb-4 group-hover:text-brand-purple dark:group-hover:text-brand-lime transition-colors">Artificial Intelligence (AI)</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Membekali siswa dengan pemahaman dasar Kecerdasan Buatan (AI) serta penerapannya yang inovatif dan etis untuk mendukung proses pembelajaran di dunia pendidikan modern.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="glass-card dark:bg-gray-900/50 p-6 sm:p-8 lg:p-10 rounded-3xl premium-shadow flex flex-col items-center text-center group hover:border-brand-purple/50 dark:border-gray-800 transition-all duration-300 sm:col-span-2 lg:col-span-1 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(79,38,166,0.1)] dark:hover:shadow-[0_20px_40px_rgba(217,253,31,0.05)]"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-brand-purple to-brand-purple-light dark:from-brand-purple-dark dark:to-brand-purple text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <span className="text-3xl sm:text-4xl">🚀</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-brand-purple-dark dark:text-white uppercase tracking-wide mb-4 group-hover:text-brand-purple dark:group-hover:text-brand-lime transition-colors">Content Creator</h3>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
              Membuka wawasan generasi muda terhadap peluang ekonomi kreatif di era digital, melalui strategi produksi konten visual dan naratif yang positif serta berdampak luas.
            </p>
          </motion.div>

        </div>

        {/* Content Details */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          <div className="glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border border-white/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-brand-purple/10 rounded-2xl flex items-center justify-center text-3xl mb-6">🏛️</div>
            <h3 className="text-2xl font-black text-brand-purple-dark uppercase mb-4">Inisiatif & Kolaborasi</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              <strong className="text-brand-purple-dark">Unmute by Unifers</strong> adalah manifestasi nyata dari Tri Dharma Perguruan Tinggi yang diinisiasi oleh <strong className="text-brand-purple-dark">Universitas Fajar (Unifa)</strong>. Menggandeng mitra strategis <strong className="text-brand-purple-dark">Kelas Bebas Berbicara</strong> dan didukung penuh oleh <strong className="text-brand-purple-dark">Dinas Pendidikan Provinsi Sulawesi Selatan</strong>, program ini menghadirkan dedikasi para dosen berdampak untuk terjun langsung memajukan ekosistem pendidikan.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border border-white/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-brand-lime/20 rounded-2xl flex items-center justify-center text-3xl mb-6">🌟</div>
            <h3 className="text-2xl font-black text-brand-purple-dark uppercase mb-4">Nilai & Kontribusi</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Lebih dari sekadar berbagi ilmu, kegiatan ini dirancang sebagai ruang eskalasi kompetensi. Melalui transfer keterampilan praktis abad ke-21, sivitas akademika <strong className="text-brand-purple-dark">Universitas Fajar</strong> berkomitmen kuat mencetak generasi muda yang adaptif, percaya diri, dan siap bersaing secara global di era digital.
            </p>
          </div>

          <div className="glass-card rounded-[2rem] p-8 sm:p-10 premium-shadow border border-white/50 hover:-translate-y-2 transition-transform">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mb-6">📈</div>
            <h3 className="text-2xl font-black text-brand-purple-dark uppercase mb-4">Visi Berkelanjutan</h3>
            <p className="text-gray-500 font-medium leading-relaxed">
              Komitmen kami tidak berhenti pada ruang kelas. Kami bertekad menjaring dan membina talenta-talenta unggul melalui program pendampingan intensif. Inisiatif berkelanjutan ini merupakan wujud nyata kontribusi akademisi dalam mencetak calon pemimpin masa depan yang berwawasan luas dan penuh inovasi.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
