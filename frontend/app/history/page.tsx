"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SessionHistoryItem {
  id: string;
  documentTitle: string;
  date: string;
  mode: "QUICK" | "STANDARD" | "DEEP";
  score: number | null;
  status: "COMPLETED" | "FAILED" | "IN_PROGRESS";
  chapterCount: number;
}

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionHistoryItem[]>([
    {
      id: "session-1",
      documentTitle: "Skripsi_Final_Draft_Revisi_2.pdf",
      date: "05 Jun 2026, 14:30",
      mode: "STANDARD",
      score: 78,
      status: "COMPLETED",
      chapterCount: 3,
    },
    {
      id: "session-2",
      documentTitle: "Skripsi_Final_Draft_Revisi_2.pdf",
      date: "04 Jun 2026, 09:15",
      mode: "QUICK",
      score: 62,
      status: "COMPLETED",
      chapterCount: 1,
    },
    {
      id: "session-3",
      documentTitle: "Analisis_Heteroskedastisitas_OLS.pdf",
      date: "02 Jun 2026, 16:45",
      mode: "DEEP",
      score: 84,
      status: "COMPLETED",
      chapterCount: 2,
    },
    {
      id: "session-4",
      documentTitle: "Skripsi_Final_Draft.pdf",
      date: "28 May 2026, 11:20",
      mode: "STANDARD",
      score: null,
      status: "IN_PROGRESS",
      chapterCount: 3,
    },
  ]);

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

  const getModeDetails = (mode: string) => {
    switch (mode) {
      case "QUICK":
        return {
          label: "Quick Review",
          icon: "bolt",
          classes: "bg-amber-50 text-amber-700 border-amber-200/50",
        };
      case "STANDARD":
        return {
          label: "Standard Exam",
          icon: "school",
          classes: "bg-indigo-50 text-[#3525cd] border-indigo-200/50",
        };
      case "DEEP":
        return {
          label: "Deep Drill",
          icon: "science",
          classes: "bg-purple-50 text-purple-700 border-purple-200/50",
        };
      default:
        return {
          label: mode,
          icon: "wysiwyg",
          classes: "bg-gray-50 text-gray-700 border-gray-200/50",
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body relative overflow-hidden">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <header className="w-full max-w-[1240px] mx-auto px-4 pt-4 sticky top-0 z-50 animate-header">
        <div className="w-full bg-white/80 backdrop-blur-md border border-[#C7C4D8]/40 px-6 py-3 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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

          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <a
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#C7C4D8]/60 text-gray-700 text-xs font-bold hover:bg-indigo-50/20 hover:text-[#3525cd] hover:border-indigo-100 transition-all shadow-sm active:scale-[0.98]"
            >
              Dashboard
            </a>

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
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-[#3525cd] bg-indigo-50/30 rounded-xl transition-all"
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
      <main className="flex-1 w-full max-w-[840px] mx-auto px-6 py-10 flex flex-col gap-8 z-10">
        
        {/* Title Section */}
        <div className="animate-title">
          <h1 className="text-3xl font-heading font-extrabold text-[#0B1C30] tracking-tight mb-2">
            Riwayat Simulasi
          </h1>
          <p className="text-sm text-gray-500">
            Pantau hasil evaluasi akademik dan tingkatkan penguasaan argumentasi dari sesi latihan Anda sebelumnya.
          </p>
        </div>

        {/* Sessions list */}
        <div className="space-y-4">
          {sessions.length === 0 ? (
            <div className="bg-white border border-[#C7C4D8]/50 p-12 rounded-2xl text-center space-y-4 shadow-sm animate-card-1">
              <span className="material-symbols-outlined text-5xl text-indigo-300">
                history_toggle_off
              </span>
              <h3 className="text-base font-bold text-[#0B1C30]">Belum ada riwayat simulasi</h3>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Anda belum melakukan simulasi sidang apa pun. Unggah draf dokumen skripsi Anda di dashboard untuk memulai latihan.
              </p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-3 rounded-xl bg-[#3525cd] hover:bg-[#281baf] text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98]"
              >
                Mulai Uji Coba Pertama
              </a>
            </div>
          ) : (
            sessions.map((session, index) => {
              const isCompleted = session.status === "COMPLETED";
              const isProgress = session.status === "IN_PROGRESS";
              const mode = getModeDetails(session.mode);
              
              // Calculate custom animation delay for staggered entrance
              const cardAnimClass = `animate-card-${Math.min(index + 1, 4)}`;

              return (
                <div
                  key={session.id}
                  className={`bg-white border border-[#C7C4D8]/50 rounded-2xl p-5 md:p-6 shadow-sm hover:border-[#3525cd]/40 hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 ${cardAnimClass}`}
                >
                  {/* Left Metadata info */}
                  <div className="space-y-3.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {/* Mode badge */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${mode.classes}`}>
                        <span className="material-symbols-outlined text-xs font-bold">
                          {mode.icon}
                        </span>
                        {mode.label}
                      </span>

                      {/* Chapters badge */}
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full">
                        {session.chapterCount} Bab Diuji
                      </span>

                      {/* Status badge */}
                      {isProgress && (
                        <span className="text-[9px] font-extrabold text-[#9d4300] bg-orange-50 px-2.5 py-1 rounded-full border border-orange-100 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                          SEDANG BERJALAN
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#0B1C30] truncate pr-2">
                      {session.documentTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <p className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {session.date}
                      </p>
                      <span>•</span>
                      <p className="flex items-center gap-1 font-semibold text-[#3525cd]">
                        <span className="material-symbols-outlined text-sm font-bold">fingerprint</span>
                        ID: {session.id}
                      </p>
                    </div>
                  </div>

                  {/* Right Score & CTA Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-50">
                    {/* Score display */}
                    {isCompleted ? (
                      <div className="text-right pr-2">
                        <span className="text-3xl font-heading font-extrabold text-[#3525cd] bg-[#3525cd]/5 px-3 py-1.5 rounded-xl border border-indigo-100/50">
                          {session.score}
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1.5 font-bold font-mono">SKOR AKHIR</span>
                      </div>
                    ) : (
                      <div className="text-right pr-2">
                        <span className="text-xl font-mono font-bold text-gray-300 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          —
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1.5 font-bold font-mono">BELUM SELESAI</span>
                      </div>
                    )}

                    {/* CTA Button */}
                    {isCompleted ? (
                      <a
                        href={`/evaluation/${session.id}`}
                        className="px-5 py-3 rounded-xl border border-[#C7C4D8]/60 text-gray-700 hover:text-[#3525cd] hover:border-[#3525cd]/60 hover:bg-[#3525cd]/[0.02] transition-all text-xs font-extrabold shadow-sm active:scale-[0.97]"
                      >
                        Lihat Laporan
                      </a>
                    ) : (
                      <a
                        href={`/workspace/${session.id}`}
                        className="px-5 py-3 rounded-xl bg-[#3525cd] hover:bg-[#281baf] text-white transition-all text-xs font-extrabold shadow-md shadow-indigo-600/10 active:scale-[0.97]"
                      >
                        Lanjutkan
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Embedded style block for entrance animations */}
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
