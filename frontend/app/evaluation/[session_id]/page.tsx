"use client";

import { useRef, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

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

  // Mock score statistics
  const scores = {
    overall: 78,
    grade: "B+",
    totalQuestions: 8,
    avgRebuttals: "1.4",
    methodology: 85,
    theory: 72,
    argument: 75,
  };

  const chapterFeedbacks = [
    {
      id: "1",
      number: "I",
      name: "Pendahuluan",
      status: "PASS",
      summary: "Rumusan masalah dan tujuan penelitian dirumuskan secara padat dan logis. Latar belakang memiliki alur deduktif yang kuat.",
    },
    {
      id: "3",
      number: "III",
      name: "Metodologi",
      status: "NEEDS_IMPROVEMENT",
      summary: "Justifikasi teknik sampling kualitatif dan parameter durasi informan perlu diperjelas secara akademis agar tidak dituduh bias subjektif.",
    },
    {
      id: "4",
      number: "IV",
      name: "Hasil & Pembahasan",
      status: "PASS",
      summary: "Penyajian data tabel analisis sudah memadai, namun korelasi negatif yang tidak signifikan perlu didukung literatur tandingan.",
    },
  ];

  const recommendations = [
    {
      id: "r1",
      category: "Methodology",
      question: "Bagaimana Anda menjustifikasi bahwa jumlah informan tersebut cukup representatif?",
      weakAnswer: "Mungkin 5 informan sudah cukup karena mereka adalah manajer utama yang tahu segalanya.",
      suggestedAnswer: "Pemilihan 5 informan dilakukan berdasarkan kriteria kejenuhan data (data saturation) di mana pada informan ke-4 dan ke-5 tidak ditemukan tema konseptual baru. Kami mengacu pada teori sampling kualitatif Marshall (1996) yang merekomendasikan kedalaman kedekatan data daripada kuantitas sampel.",
      tip: "Hindari kata spekulatif seperti 'mungkin' atau 'tahu segalanya'. Gunakan istilah metodologi formal seperti 'kejenuhan data' (data saturation).",
    },
    {
      id: "r2",
      category: "Theory",
      question: "Bagaimana Anda mencocokkan korelasi negatif tidak signifikan dengan grand theory?",
      weakAnswer: "Ya saya rasa datanya memang begini di lapangan, teorinya saja yang kurang update.",
      suggestedAnswer: "Temuan korelasi negatif tidak signifikan ini menyoroti adanya anomali kontekstual lokal yang menyimpang dari grand theory Bourdieu. Hal ini diperkuat oleh penelitian tandingan Smith (2021) yang membuktikan bahwa pada ekosistem digital, habitus tidak beroperasi linier.",
      tip: "Jangan menyalahkan teori secara defensif tanpa referensi pendukung. Sebutkan anomali kontekstual dan kutip studi tandingan.",
    },
  ];

  // SVG concentric radial settings
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scores.overall / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body relative overflow-hidden print:bg-white print:text-black">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0 print:hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0 print:hidden" />

      {/* Top Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-[#C7C4D8]/40 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm print:hidden animate-header">
        <a href="/dashboard" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/20">
            <span className="material-symbols-outlined text-xl font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>
              neurology
            </span>
          </div>
          <span className="text-xl font-heading font-extrabold text-[#3525cd] tracking-tight">
            Phom
          </span>
        </a>

        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#C7C4D8]/60 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            <span className="material-symbols-outlined text-sm font-bold">print</span>
            Cetak PDF
          </button>

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
            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-indigo-50 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn">
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
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[840px] mx-auto px-6 py-10 flex flex-col gap-8 z-10 print:py-0 print:px-0">
        
        {/* Title */}
        <div className="text-center animate-title print:text-left print:border-b print:pb-4 print:mb-4">
          <h1 className="text-3xl font-heading font-extrabold text-[#0B1C30] tracking-tight mb-2">
            Laporan Evaluasi Simulasi
          </h1>
          <p className="text-sm text-gray-500">
            Hasil penilaian komprehensif atas pertahanan metodologi, penguasaan teori, dan retorika jawaban Anda.
          </p>
        </div>

        {/* 1. Score Overview Dial Banner */}
        <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center justify-around gap-8 animate-card-1 print:border-gray-200">
          {/* Concentric Radial Meter */}
          <div className="relative w-40 h-40 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-indigo-50/50 print:stroke-gray-100"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-[#3525cd] transition-all duration-1000 print:stroke-black"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-5xl font-heading font-extrabold text-[#3525cd] print:text-black">
                {scores.overall}
              </span>
              <span className="text-[10px] text-gray-400 block font-bold font-mono tracking-wider mt-0.5">SKOR AKHIR</span>
            </div>
          </div>

          {/* Quick Metrics Info */}
          <div className="flex flex-col gap-3.5 flex-1 max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full text-[10px] font-bold border border-emerald-100/50 flex items-center gap-1.5 print:border-black print:text-black print:bg-white">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 print:bg-black"></span>
                LAYAK MAJU SIDANG
              </span>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed">
              Komite penguji AI menilai tingkat argumentasi dan penguasaan naskah Anda berada di kategori kelayakan **{scores.grade}**. Pertahankan kualitas respon dan perkuat basis justifikasi sampel.
            </p>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 mt-1">
              <div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">
                  Total Pertanyaan
                </span>
                <span className="text-base font-bold text-[#0B1C30] print:text-black">
                  {scores.totalQuestions} Soal Diuji
                </span>
              </div>
              <div>
                <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider block">
                  Rata-rata Sanggahan
                </span>
                <span className="text-base font-bold text-[#0B1C30] print:text-black">
                  {scores.avgRebuttals}x Sanggahan
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Three Dimension Metrics Bar Graph */}
        <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-8 shadow-sm space-y-6 animate-card-2 print:border-gray-200">
          <p className="text-center text-[10px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
            ACADEMIC DIMENSION GRADES
          </p>

          <div className="space-y-6">
            {/* Methodology */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#3525cd] text-base print:hidden">settings_suggest</span>
                  Metodologi & Validitas Penelitian (Bobot 40%)
                </span>
                <span className="text-[#3525cd] font-mono font-bold">{scores.methodology} / 100</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3525cd] to-indigo-500 rounded-full print:bg-black"
                  style={{ width: `${scores.methodology}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                Logika penarikan kriteria purposive sampling sudah sangat baik. Namun, justifikasi teoritis mengapa batas kerja 5 tahun dipilih perlu dipertegas pada draf tertulis.
              </p>
            </div>

            {/* Theory */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600 text-base print:hidden">menu_book</span>
                  Penguasaan Teori & Tinjauan Pustaka (Bobot 30%)
                </span>
                <span className="text-purple-600 font-mono font-bold">{scores.theory} / 100</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full print:bg-black"
                  style={{ width: `${scores.theory}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                Tinjauan konsep cukup komprehensif, namun kaitan logis antara kerangka pemikiran di Bab II dengan temuan anomali data di Bab IV masih kurang teratur.
              </p>
            </div>

            {/* Argument */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600 text-base print:hidden">forum</span>
                  Ketahanan Argumentasi & Retorika (Bobot 30%)
                </span>
                <span className="text-amber-600 font-mono font-bold">{scores.argument} / 100</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full print:bg-black"
                  style={{ width: `${scores.argument}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed font-medium">
                Penyampaian tanggapan lisan tenang dan akademis. Hindari penggunaan kalimat spekulatif seperti "saya rasa" ketika menghadapi sanggahan kedua.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Chapter Breakdown Status */}
        <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-8 shadow-sm space-y-5 animate-card-3 print:border-gray-200">
          <p className="text-center text-[10px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
            CHAPTER EVALUATION BREAKDOWN
          </p>

          <div className="space-y-4.5">
            {chapterFeedbacks.map((ch) => {
              const isPass = ch.status === "PASS";
              return (
                <div
                  key={ch.id}
                  className="flex flex-col md:flex-row md:items-start gap-4 p-4 rounded-xl border border-gray-100 bg-[#F8F9FF]/20"
                >
                  <div className="flex items-center justify-between md:flex-col md:items-start gap-2 flex-shrink-0 md:w-36">
                    <span className="text-xs font-extrabold text-[#0B1C30]">
                      Bab {ch.number}: {ch.name}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-3 py-1 rounded-full border ${
                        isPass
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                          : "bg-amber-50 text-amber-700 border-amber-200/50"
                      }`}
                    >
                      {isPass ? "LULUS" : "REVISI"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed flex-1">
                    {ch.summary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Actionable Speech Improvement Recommendations */}
        <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-8 shadow-sm space-y-6 animate-card-4 print:border-gray-200">
          <p className="text-center text-[10px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
            SPEECH RECONSTRUCTION & RECOMMENDATIONS
          </p>

          <div className="space-y-7">
            {recommendations.map((rec, i) => (
              <div key={rec.id} className="border-b border-gray-100 pb-7 last:border-0 last:pb-0 space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-[#3525cd] print:text-black">Rekomendasi #{i + 1}</span>
                  <span className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-[9px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                    {rec.category}
                  </span>
                </div>
                
                <div className="text-xs text-[#0B1C30] leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 font-semibold">
                  <strong>Tanya:</strong> "{rec.question}"
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Defensif */}
                  <div className="bg-red-50/20 border border-red-100/60 p-4 rounded-xl text-gray-500">
                    <span className="block text-[9px] font-extrabold text-red-600 mb-2 uppercase tracking-wider">
                      JAWABAN DEFENSIF ANDA
                    </span>
                    <p className="italic leading-relaxed">"{rec.weakAnswer}"</p>
                  </div>

                  {/* Rekomendasi */}
                  <div className="bg-emerald-50/25 border border-emerald-100/60 p-4 rounded-xl text-gray-700 font-medium">
                    <span className="block text-[9px] font-extrabold text-emerald-700 mb-2 uppercase tracking-wider">
                      REKOMENDASI REDAKSI AKADEMIS
                    </span>
                    <p className="leading-relaxed">"{rec.suggestedAnswer}"</p>
                  </div>
                </div>

                {/* Tips */}
                <div className="p-4 bg-indigo-50/20 border border-indigo-100/30 rounded-xl text-xs text-gray-500 flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-base text-[#3525cd] font-bold mt-0.5 print:hidden">lightbulb</span>
                  <p className="leading-relaxed">
                    <strong className="text-gray-700">Tips Penguji:</strong> {rec.tip}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-12 print:hidden">
          <a
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#C7C4D8]/60 text-center font-heading font-extrabold text-xs text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            Kembali ke Dashboard
          </a>
          <a
            href="/dashboard" 
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3525cd] text-white text-center font-heading font-extrabold text-xs hover:bg-[#281baf] transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]"
          >
            Ulangi Simulasi Sidang
          </a>
        </div>
      </main>

      {/* Style blocks */}
      <style dangerouslySetInnerHTML={{ __html: `
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
        .animate-card-4 {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s forwards;
          opacity: 0;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}} />
    </div>
  );
}
