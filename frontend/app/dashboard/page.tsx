"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

// ─── Types ───────────────────────────────────────────────────────────────────
type SimulationMode = "quick" | "standard" | "deep";

interface Chapter {
  id: string;
  label: string;
  title: string;
  pageStart: string;
  pageEnd: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const INITIAL_CHAPTERS: Chapter[] = [
  { id: "1", label: "I", title: "Pendahuluan", pageStart: "1", pageEnd: "10" },
  { id: "2", label: "II", title: "Tinjauan Pustaka", pageStart: "11", pageEnd: "25" },
  { id: "3", label: "III", title: "Metodologi", pageStart: "26", pageEnd: "45" },
  { id: "4", label: "IV", title: "Hasil & Pembahasan", pageStart: "", pageEnd: "" },
  { id: "5", label: "V", title: "Penutupan", pageStart: "", pageEnd: "" },
];

const SIMULATION_MODES = [
  {
    id: "quick" as SimulationMode,
    icon: "bolt",
    title: "Quick Review",
    description: "Rapid 15-minute fire-round (3-5 questions).",
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "standard" as SimulationMode,
    icon: "school",
    title: "Standard Exam",
    description: "Full 45-minute simulation (8-10 questions).",
    color: "from-indigo-500 to-blue-600",
  },
  {
    id: "deep" as SimulationMode,
    icon: "science",
    title: "Deep Drill",
    description: "Intensive methodology scrutiny (12-15 questions).",
    color: "from-purple-600 to-pink-600",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(["1", "2", "3"]);
  const [simulationMode, setSimulationMode] = useState<SimulationMode>("standard");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ingestion In-Progress State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingPhase, setProcessingPhase] = useState("Menunggu unggahan...");

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set initial file on client load for demo purposes if desired
  useEffect(() => {
    const mockFile = new File(["dummy content"], "Full_Thesis_Final_Draft.pdf", {
      type: "application/pdf",
    });
    Object.defineProperty(mockFile, "size", { value: 14.2 * 1024 * 1024 });
    setUploadedFile(mockFile);
  }, []);

  // Ingestion Simulation Trigger
  useEffect(() => {
    if (uploadedFile) {
      setIsProcessing(true);
      setProcessingProgress(0);
      setProcessingPhase("Membaca struktur PDF...");
      
      const interval = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsProcessing(false);
            setProcessingPhase("Analisis bab selesai!");
            return 100;
          }
          const next = prev + Math.floor(Math.random() * 12) + 6;
          const currentProgress = Math.min(next, 100);
          
          if (currentProgress < 25) {
            setProcessingPhase("Membaca struktur PDF...");
          } else if (currentProgress < 55) {
            setProcessingPhase("Mengekstrak teks & bab...");
          } else if (currentProgress < 85) {
            setProcessingPhase("Memetakan tabel & referensi...");
          } else {
            setProcessingPhase("Dokumen siap dianalisis!");
          }
          return currentProgress;
        });
      }, 250);

      return () => clearInterval(interval);
    } else {
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingPhase("Menunggu unggahan...");
    }
  }, [uploadedFile]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setUploadedFile(file);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChapterTitleChange = (id: string, newTitle: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, title: newTitle } : ch))
    );
  };

  const handlePageChange = (id: string, field: "pageStart" | "pageEnd", value: string) => {
    setChapters(
      chapters.map((ch) => (ch.id === id ? { ...ch, [field]: value } : ch))
    );
  };

  const handleDeleteChapter = (id: string) => {
    setChapters(chapters.filter((ch) => ch.id !== id));
    setSelectedChapterIds(selectedChapterIds.filter((x) => x !== id));
  };

  const handleAddChapter = () => {
    const nextNum = chapters.length + 1;
    const romanNumerals = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
    const romanLabel = romanNumerals[nextNum - 1] || String(nextNum);
    const newId = String(Date.now());
    
    const newChapter: Chapter = {
      id: newId,
      label: romanLabel,
      title: "Bab Baru",
      pageStart: "",
      pageEnd: "",
    };
    setChapters([...chapters, newChapter]);
    setSelectedChapterIds([...selectedChapterIds, newId]);
  };

  const toggleChapter = (id: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const readyChapters = chapters.filter((ch) => ch.pageStart && ch.pageEnd);
  const selectedFocusChapters = chapters.filter((ch) => selectedChapterIds.includes(ch.id));

  const canStartSimulation =
    uploadedFile !== null &&
    !isProcessing &&
    selectedFocusChapters.length > 0 &&
    selectedFocusChapters.every((ch) => ch.pageStart && ch.pageEnd);

  const getStatusText = () => {
    if (!uploadedFile) return "Silakan unggah draf skripsi PDF Anda terlebih dahulu.";
    if (isProcessing) return `Sedang memproses naskah: ${processingProgress}% (${processingPhase})`;
    if (selectedFocusChapters.length === 0) return "Silakan pilih minimal satu bab sebagai area fokus simulasi.";
    
    const invalidChapters = selectedFocusChapters.filter((ch) => !ch.pageStart || !ch.pageEnd);
    if (invalidChapters.length > 0) {
      return `Tentukan rentang halaman untuk ${invalidChapters.map((ch) => `Bab ${ch.label}`).join(", ")}.`;
    }

    const chapterNames = selectedFocusChapters.map((ch) => `Bab ${ch.label}`).join(", ");
    return `Sistem siap menganalisis ${chapterNames} dengan mode ${simulationMode.toUpperCase()}.`;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body relative overflow-hidden">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full max-w-[1240px] mx-auto px-4 pt-4 sticky top-0 z-50 animate-header">
        <div className="w-full bg-white/80 backdrop-blur-md border border-[#C7C4D8]/40 px-6 py-3 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/20">
              <span className="material-symbols-outlined text-xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
                neurology
              </span>
            </div>
            <span className="text-xl font-heading font-extrabold text-[#3525cd] tracking-tight">
              Phom
            </span>
          </a>

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {/* Active status pill */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-100 bg-indigo-50/50 text-[#3525cd] font-heading text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Workspace Aktif
            </div>
            
            {/* User profile dropdown button */}
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3.5 py-1.5 hover:bg-indigo-50/40 border border-[#C7C4D8]/50 bg-white transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                AS
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:inline-block">
                Dr. Aris Setiawan
              </span>
              <span className="material-symbols-outlined text-base text-gray-400">
                keyboard_arrow_down
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-52 bg-white border border-indigo-50 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Akun Demo</p>
                  <p className="text-xs font-bold text-gray-800 truncate">aris.setiawan@univ.ac.id</p>
                </div>
                <a 
                  href="/history" 
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50/50 hover:text-[#3525cd] rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-base">history</span>
                  Riwayat Sesi
                </a>
                <a 
                  href="/" 
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Keluar
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-6 py-10 flex flex-col gap-8 z-10">
        
        {/* Header Intro */}
        <div className="text-center max-w-2xl mx-auto animate-title">
          <h1 className="text-4xl font-heading font-extrabold text-[#0B1C30] tracking-tight mb-2">
            Dashboard Simulator
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Unggah naskah skripsi PDF Anda, verifikasi cakupan bab, dan pilih intensitas simulasi ujian untuk memulai pertahanan akademik Anda.
          </p>
        </div>

        {/* Statistics Grid Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto w-full animate-title">
          
          {/* Stat 1 */}
          <div className="bg-white border border-[#C7C4D8]/50 p-4 rounded-2xl shadow-sm flex items-center gap-3 hover:scale-[1.01] transition-transform duration-200">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3525cd] flex-shrink-0">
              <span className="material-symbols-outlined text-base font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Total Simulasi</p>
              <p className="text-xs font-extrabold text-[#0B1C30]">12 Sesi Selesai</p>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-white border border-[#C7C4D8]/50 p-4 rounded-2xl shadow-sm flex items-center gap-3 hover:scale-[1.01] transition-transform duration-200">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
              <span className="material-symbols-outlined text-base font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Rata-rata Skor</p>
              <p className="text-xs font-extrabold text-[#0B1C30]">78.4 / 100</p>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-white border border-[#C7C4D8]/50 p-4 rounded-2xl shadow-sm flex items-center gap-3 hover:scale-[1.01] transition-transform duration-200">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
              <span className="material-symbols-outlined text-base font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Waktu Latihan</p>
              <p className="text-xs font-extrabold text-[#0B1C30]">4.5 Jam</p>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-white border border-[#C7C4D8]/50 p-4 rounded-2xl shadow-sm flex items-center gap-3 hover:scale-[1.01] transition-transform duration-200">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <span className="material-symbols-outlined text-base font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            </div>
            <div>
              <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider">Kategori Layak</p>
              <p className="text-xs font-extrabold text-emerald-600">Sangat Layak (B+)</p>
            </div>
          </div>

        </div>

        {/* 1. Centered Processing Status Zone / Dropzone */}
        <div className="w-full max-w-4xl mx-auto animate-card-1">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`w-full rounded-2xl border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? "border-[#3525cd] bg-indigo-50/50 shadow-md scale-[1.01]"
                : "border-[#C7C4D8]/80 bg-white hover:border-[#3525cd]/60 shadow-sm"
            } p-8`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex flex-col items-center justify-center text-center">
              {uploadedFile ? (
                <div className="w-full max-w-xl flex flex-col items-center">
                  {/* Processing / Ingestion Active View */}
                  <div className="relative mb-5">
                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 shadow-sm relative overflow-hidden">
                      <span className="material-symbols-outlined text-4xl text-[#3525cd] z-10 font-bold">
                        picture_as_pdf
                      </span>
                      {/* Scanline line anim */}
                      {isProcessing && (
                        <div className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-b from-transparent via-indigo-600/20 to-transparent animate-scanline z-0" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-[#0B1C30] font-bold text-base mb-1 truncate max-w-[85%]">
                    {uploadedFile.name}
                  </h3>
                  
                  {isProcessing ? (
                    <div className="w-full mt-3">
                      <div className="flex justify-between items-center mb-1.5 text-xs">
                        <span className="text-indigo-600 font-bold animate-pulse">
                          {processingPhase}
                        </span>
                        <span className="text-gray-500 font-semibold">{processingProgress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#3525cd] to-[#6f3dd9] rounded-full transition-all duration-300"
                          style={{ width: `${processingProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100/50 mb-6">
                        <span className="material-symbols-outlined text-sm font-bold">check_circle</span>
                        Naskah Berhasil Diproses • {formatSize(uploadedFile.size)}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl border border-[#C7C4D8]/60 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
                        >
                          Ganti File
                        </button>
                        <button
                          onClick={handleRemoveFile}
                          className="px-4 py-2 rounded-xl border border-red-100 text-red-600 text-xs font-bold hover:bg-red-50/50 transition-all shadow-sm active:scale-[0.98]"
                        >
                          Hapus File
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50/50 flex items-center justify-center mb-4 border border-indigo-100/40">
                    <span className="material-symbols-outlined text-3xl text-indigo-500">
                      cloud_upload
                    </span>
                  </div>
                  <h3 className="text-[#0B1C30] font-bold text-base mb-1">
                    Jatuhkan naskah PDF skripsi Anda di sini
                  </h3>
                  <p className="text-gray-400 text-xs mb-5 max-w-xs leading-relaxed">
                    Unggah dokumen Bab I - V dalam satu file PDF (ukuran maksimal 25MB)
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-2.5 rounded-xl bg-[#3525cd] hover:bg-[#281baf] text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]"
                  >
                    Pilih File PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Chapter Configuration */}
          <section className="lg:col-span-7 bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-8 shadow-sm animate-card-2 flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-50">
              <div>
                <h2 className="text-lg font-heading font-extrabold text-[#0B1C30]">
                  Chapter Configuration
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Tentukan judul bab, rentang halaman, dan centang area yang ingin diuji.
                </p>
              </div>
              <button
                onClick={handleAddChapter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-100 hover:border-indigo-200 text-[#3525cd] hover:bg-indigo-50/30 text-xs font-bold transition-all active:scale-[0.97]"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tambah Bab
              </button>
            </div>

            {/* Config Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="py-2.5 px-2 w-10">Fokus</th>
                    <th className="py-2.5 px-2 w-8 text-center">No</th>
                    <th className="py-2.5 px-2">Nama Bab / Subjek</th>
                    <th className="py-2.5 px-2 w-48 text-center">Halaman</th>
                    <th className="py-2.5 px-2 w-12 text-center">Hapus</th>
                  </tr>
                </thead>
                <tbody>
                  {chapters.map((chapter) => {
                    const isSelected = selectedChapterIds.includes(chapter.id);
                    
                    return (
                      <tr 
                        key={chapter.id}
                        className={`border-b border-gray-50 transition-colors group ${
                          isSelected ? "bg-indigo-50/15" : "hover:bg-gray-50/30"
                        }`}
                      >
                        {/* Checkbox Selector */}
                        <td className="py-3 px-2 text-center">
                          <input 
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleChapter(chapter.id)}
                            className="rounded border-[#C7C4D8] text-[#3525cd] focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer transition-all"
                          />
                        </td>

                        {/* Label No. (e.g. Bab I) */}
                        <td className="py-3 px-2 text-center text-xs font-bold text-gray-400">
                          {chapter.label}
                        </td>

                        {/* Editable Title */}
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => handleChapterTitleChange(chapter.id, e.target.value)}
                            className="w-full bg-transparent border-b border-transparent focus:border-indigo-400 hover:border-gray-200 text-xs font-semibold text-gray-700 py-1 focus:outline-none transition-colors"
                            placeholder="Tulis Judul Bab..."
                          />
                        </td>

                        {/* Page Ranges */}
                        <td className="py-3 px-2">
                          <div className="flex items-center justify-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              placeholder="Mulai"
                              value={chapter.pageStart}
                              onChange={(e) => handlePageChange(chapter.id, "pageStart", e.target.value)}
                              className="w-16 h-8 text-center rounded-lg border border-[#C7C4D8]/60 bg-white text-xs font-semibold text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-indigo-400 transition-colors focus:ring-2 focus:ring-indigo-500/10"
                            />
                            <span className="text-gray-300 text-sm">—</span>
                            <input
                              type="number"
                              min="1"
                              placeholder="Akhir"
                              value={chapter.pageEnd}
                              onChange={(e) => handlePageChange(chapter.id, "pageEnd", e.target.value)}
                              className="w-16 h-8 text-center rounded-lg border border-[#C7C4D8]/60 bg-white text-xs font-semibold text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-indigo-400 transition-colors focus:ring-2 focus:ring-indigo-500/10"
                            />
                          </div>
                        </td>

                        {/* Delete Action */}
                        <td className="py-3 px-2 text-center">
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="p-1 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Hapus bab"
                          >
                            <span className="material-symbols-outlined text-base font-bold">delete</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {chapters.length === 0 && (
              <div className="py-8 text-center text-xs text-gray-400 font-medium">
                Belum ada bab dikonfigurasi. Klik "Tambah Bab" untuk memulai.
              </div>
            )}
          </section>

          {/* Right Column: Session Intensity & Recent Sessions */}
          <div className="lg:col-span-5 space-y-6 flex flex-col">
            
            <section className="w-full bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-8 shadow-sm animate-card-3 flex flex-col gap-6">
              <div>
                <h2 className="text-lg font-heading font-extrabold text-[#0B1C30]">
                  Session Intensity
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pilih beban mental & frekuensi pertanyaan ujian.
                </p>
              </div>

              {/* Intensity List */}
              <div className="flex flex-col gap-4">
                {SIMULATION_MODES.map((mode) => {
                  const isSelected = simulationMode === mode.id;
                  
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSimulationMode(mode.id)}
                      className={`relative p-4.5 rounded-xl border text-left transition-all duration-300 flex items-start gap-4 ${
                        isSelected
                          ? "border-[#3525cd] bg-[#3525cd]/[0.02] shadow-sm scale-[1.01]"
                          : "border-[#C7C4D8]/50 bg-white hover:border-[#3525cd]/30"
                      }`}
                    >
                      {/* Glowing highlight indicator */}
                      {isSelected && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-[#3525cd]" />
                      )}

                      {/* Icon Bubble with custom mode color */}
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-100 text-[#3525cd]"
                            : "bg-gray-50 border-gray-100 text-gray-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-lg font-bold">
                          {mode.icon}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 pr-6">
                        <h3
                          className={`text-xs font-bold leading-none ${
                            isSelected ? "text-[#3525cd]" : "text-[#0B1C30]"
                          }`}
                        >
                          {mode.title}
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1.5 leading-normal">
                          {mode.description}
                        </p>
                      </div>

                      {/* Checkmark bubble */}
                      {isSelected && (
                        <span className="material-symbols-outlined text-[#3525cd] text-base font-bold absolute top-4 right-4 animate-scaleUp">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent Sessions Widget */}
            <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-8 shadow-sm flex flex-col gap-4 animate-card-3">
              <div>
                <h2 className="text-sm font-heading font-extrabold text-[#0B1C30] uppercase tracking-wider">
                  Riwayat Simulasi Terakhir
                </h2>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  Akses cepat laporan evaluasi dari latihan sebelumnya.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {/* Session Item 1 */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-[#F8F9FF]/20 hover:bg-[#F8F9FF]/50 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-lg text-indigo-500 flex-shrink-0">
                      description
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-700 truncate max-w-[120px] sm:max-w-[180px]">
                        Full_Thesis_Final_Draft.pdf
                      </p>
                      <p className="text-[9px] text-gray-400">06 Juni 2026 • 8 Pertanyaan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      Skor: 78
                    </span>
                    <a 
                      href="/evaluation/mock-session" 
                      className="p-1 text-gray-400 hover:text-[#3525cd] transition-colors"
                      title="Lihat Laporan"
                    >
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </a>
                  </div>
                </div>

                {/* Session Item 2 */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-[#F8F9FF]/20 hover:bg-[#F8F9FF]/50 transition-all">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="material-symbols-outlined text-lg text-indigo-500 flex-shrink-0">
                      description
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-gray-700 truncate max-w-[120px] sm:max-w-[180px]">
                        Skripsi_Revisi_v1.pdf
                      </p>
                      <p className="text-[9px] text-gray-400">04 Juni 2026 • 5 Pertanyaan</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-extrabold text-[#3525cd] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                      Skor: 64
                    </span>
                    <a 
                      href="/evaluation/mock-session" 
                      className="p-1 text-gray-400 hover:text-[#3525cd] transition-colors"
                      title="Lihat Laporan"
                    >
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </a>
                  </div>
                </div>
              </div>

              <a 
                href="/history" 
                className="text-center text-[10px] font-extrabold text-[#3525cd] hover:underline uppercase tracking-wider block mt-1"
              >
                Lihat Semua Riwayat Sesi
              </a>
            </div>

          </div>

        </div>

        {/* Start Simulation Action */}
        <div className="flex flex-col items-center gap-3 pb-10 animate-cta max-w-xl mx-auto w-full">
          <button
            onClick={() => {
              if (canStartSimulation) {
                // Navigate to simulation session (pass parameters or mock-session id)
                router.push(`/workspace/mock-session`);
              }
            }}
            disabled={!canStartSimulation}
            className={`w-full py-4 rounded-2xl text-white font-heading font-extrabold text-base flex items-center justify-center gap-2 transition-all duration-300 ${
              canStartSimulation
                ? "bg-[#3525cd] hover:bg-[#281baf] shadow-lg shadow-indigo-600/20 hover:shadow-xl hover:shadow-indigo-600/35 hover:-translate-y-0.5 cursor-pointer"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Mulai Sidang Simulasi
            <span className="material-symbols-outlined text-lg font-bold">play_arrow</span>
          </button>

          <p className="text-xs text-gray-400 text-center font-medium mt-1 leading-relaxed px-4">
            {getStatusText()}
          </p>
        </div>

      </main>

      {/* Styled block with animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(-100%); }
        }
        @keyframes slideDownFadeIn {
          from { transform: translateY(-12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUpFadeIn {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scanline {
          animation: scanline 3s ease-in-out infinite;
        }
        .animate-header {
          animation: slideDownFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-title {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
          opacity: 0;
        }
        .animate-card-1 {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
          opacity: 0;
        }
        .animate-card-2 {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards;
          opacity: 0;
        }
        .animate-card-3 {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
          opacity: 0;
        }
        .animate-cta {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
          opacity: 0;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
}
