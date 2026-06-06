"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "USER" | "AI";
  content: string;
  subTurn: number;
  timestamp: Date;
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "q1",
      role: "AI",
      content:
        "Pada Bab III Metodologi, Anda menggunakan teknik purposive sampling dengan 5 kriteria informan. Bagaimana Anda menjustifikasi bahwa jumlah informan tersebut cukup representatif untuk menjawab pertanyaan penelitian Anda?",
      subTurn: 0,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [subTurn, setSubTurn] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  
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

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // 1. Add user answer
    const userMsgId = `user-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      role: "USER",
      content: inputText,
      subTurn: subTurn,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // 2. Simulate AI response delay
    setTimeout(() => {
      setIsTyping(false);
      
      if (subTurn === 0) {
        // First rebuttal (subTurn = 1)
        setSubTurn(1);
        const rebuttalMsg: Message = {
          id: `ai-r1-${Date.now()}`,
          role: "AI",
          content:
            "Jawaban Anda menekankan kedalaman informasi daripada keterwakilan statistik. Namun, salah satu kriteria informan Anda adalah lama bekerja minimal 5 tahun. Mengapa batas waktu 5 tahun ini kritikal? Apakah informan dengan masa kerja 3 tahun tidak dapat memberikan perspektif yang sama validnya?",
          subTurn: 1,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, rebuttalMsg]);
      } else if (subTurn === 1) {
        // Second rebuttal (subTurn = 2)
        setSubTurn(2);
        const rebuttalMsg2: Message = {
          id: `ai-r2-${Date.now()}`,
          role: "AI",
          content:
            "Tetapi bagaimana Anda membuktikan bias subjektivitas Anda sebagai peneliti tidak memengaruhi proses penafsiran data kualitatif ini? Langkah verifikasi apa saja yang Anda lakukan?",
          subTurn: 2,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, rebuttalMsg2]);
      } else {
        // Move to next question (subTurn resets to 0, currentStep increments)
        setSubTurn(0);
        setCurrentStep((prev) => Math.min(prev + 1, totalQuestions));
        const nextQuestionMsg: Message = {
          id: `ai-q2-${Date.now()}`,
          role: "AI",
          content:
            "Baik, mari kita beralih ke Bab IV Hasil & Pembahasan. Temuan Anda di tabel 4.2 menunjukkan korelasi negatif yang tidak signifikan antara variabel X2 dan Y. Bagaimana Anda mencocokkan anomali data ini dengan teori utama dari grand theory di Bab II?",
          subTurn: 0,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, nextQuestionMsg]);
      }
    }, 1500);
  };

  const handleEndSession = () => {
    router.push(`/evaluation/${sessionId || "mock-session"}`);
  };

  // Condition from AGENTS.md: Minimum 3 questions answered to allow ending session
  const answeredCount = messages.filter((m) => m.role === "USER").length;
  const isEndEnabled = answeredCount >= 3;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body relative overflow-hidden">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />

      {/* Top Workspace Header */}
      <header className="w-full max-w-[1240px] mx-auto px-4 pt-4 sticky top-0 z-50 animate-header">
        <div className="w-full bg-white/80 backdrop-blur-md border border-[#C7C4D8]/40 px-6 py-3 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center gap-5">
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
            
            <span className="text-gray-200 hidden sm:inline">|</span>

            <div className="flex items-center gap-3">
              <a
                href="/dashboard"
                className="flex items-center gap-1.5 text-gray-400 hover:text-[#3525cd] transition-colors text-xs font-bold font-heading"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Dashboard
              </a>
              <span className="text-gray-200">|</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-pulse"></span>
                <span className="text-xs font-extrabold text-[#3525cd]">
                  Simulasi Aktif: Bab III & IV
                </span>
              </div>
            </div>
          </div>

          {/* Brand center/right */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            <div className="hidden md:flex items-center gap-2 text-[10px] text-[#3525cd] bg-indigo-50/50 px-3.5 py-1.5 rounded-full border border-indigo-100/50 font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected to Examiner AI
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1280px] w-full mx-auto p-4 md:p-6 gap-6 overflow-hidden h-[calc(100vh-100px)] z-10">
        
        {/* Sidebar Panel */}
        <aside className="w-full md:w-68 flex-shrink-0 flex flex-col gap-6 bg-white border border-[#C7C4D8]/50 rounded-2xl p-6 shadow-sm justify-between md:h-full animate-card-1">
          <div className="space-y-6">
            
            {/* Session Info */}
            <div className="space-y-2">
              <span className="text-[10px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
                SESSION MODE
              </span>
              <div className="p-3.5 bg-indigo-50/30 rounded-xl border border-indigo-100/40 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-[#3525cd]">
                  <span className="material-symbols-outlined text-lg font-bold">school</span>
                </div>
                <div>
                  <span className="text-xs font-bold text-gray-800 block leading-tight">Standard Exam</span>
                  <span className="text-[10px] text-gray-400">45 Min. Simulation</span>
                </div>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3.5">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>PROGRESS SIMULASI</span>
                <span className="text-[#3525cd] font-mono">
                  {currentStep} / {totalQuestions}
                </span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#3525cd] to-[#6f3dd9] rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalQuestions) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
                Sesi sedang berlangsung. Selesaikan minimal 3 pertanyaan untuk membuka tombol penyelesaian ujian.
              </p>
            </div>

            {/* Scope info */}
            <div className="space-y-2">
              <span className="text-[10px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
                TEST SCOPE
              </span>
              <div className="space-y-2">
                <div className="text-xs text-gray-600 font-semibold flex items-center gap-2 bg-indigo-50/20 px-2.5 py-1.5 rounded-lg border border-indigo-50/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                  Bab I: Pendahuluan
                </div>
                <div className="text-xs text-gray-600 font-semibold flex items-center gap-2 bg-indigo-50/20 px-2.5 py-1.5 rounded-lg border border-indigo-50/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                  Bab III: Metodologi
                </div>
                <div className="text-xs text-gray-600 font-semibold flex items-center gap-2 bg-indigo-50/20 px-2.5 py-1.5 rounded-lg border border-indigo-50/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                  Bab IV: Hasil & Pembahasan
                </div>
              </div>
            </div>
          </div>

          {/* End Session Button CTA */}
          <div className="space-y-2 mt-4 md:mt-0 pt-4 border-t border-gray-50">
            <button
              onClick={handleEndSession}
              disabled={!isEndEnabled}
              className={`w-full py-3.5 rounded-xl text-white font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
                isEndEnabled
                  ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/10 hover:shadow-lg hover:shadow-red-600/25 active:scale-[0.98]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Akhiri Sesi Sidang
              <span className="material-symbols-outlined text-sm font-bold">logout</span>
            </button>
            <p className="text-[9px] text-gray-400 text-center font-bold">
              {isEndEnabled
                ? "Tombol aktif. Anda sudah menjawab 3+ pertanyaan."
                : `Menjawab ${answeredCount}/3 pertanyaan untuk mengaktifkan.`}
            </p>
          </div>
        </aside>

        {/* Chat Console Area */}
        <section className="flex-1 flex flex-col bg-white border border-[#C7C4D8]/50 rounded-2xl shadow-sm overflow-hidden h-full animate-card-2">
          
          {/* Chat Bubble List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gray-50/30">
            {messages.map((msg) => {
              const isAi = msg.role === "AI";
              const isRebuttal = isAi && msg.subTurn > 0;
              
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 max-w-[85%] ${
                    isAi ? "mr-auto animate-slideRight" : "ml-auto flex-row-reverse animate-slideLeft"
                  }`}
                >
                  {/* Avatar Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
                      isRebuttal
                        ? "bg-amber-50 border-amber-200/50 text-amber-600"
                        : isAi
                        ? "bg-indigo-50 border-indigo-100/50 text-[#3525cd]"
                        : "bg-[#0B1C30] border-[#0B1C30] text-white"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base font-bold">
                      {isRebuttal ? "warning" : isAi ? "smart_toy" : "person"}
                    </span>
                  </div>

                  {/* Bubble Content Card */}
                  <div
                    className={`p-4 rounded-2xl border text-xs leading-relaxed shadow-sm ${
                      isRebuttal
                        ? "bg-amber-50/40 border-amber-200/50 text-amber-900 font-medium"
                        : isAi
                        ? "bg-white border-[#C7C4D8]/40 text-[#0B1C30]"
                        : "bg-[#3525cd] text-white border-[#3525cd] shadow-md shadow-indigo-600/10"
                    }`}
                  >
                    {isRebuttal && (
                      <span className="block text-[9px] font-heading font-extrabold uppercase tracking-wide mb-1 text-amber-700">
                        SANGGAHAN DOSEN PENGUJI AI (Sanggahan {msg.subTurn}/2)
                      </span>
                    )}
                    <p className="whitespace-pre-line font-medium leading-relaxed">{msg.content}</p>
                    <span
                      className={`block text-[9px] mt-2 text-right ${
                        isAi ? "text-gray-400" : "text-white/60"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3.5 max-w-[80%] mr-auto">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100/50 text-[#3525cd] shadow-sm">
                  <span className="material-symbols-outlined text-base font-bold">smart_toy</span>
                </div>
                <div className="bg-white border border-[#C7C4D8]/40 p-4 rounded-2xl flex gap-1 items-center shadow-sm">
                  <div className="w-1.5 h-1.5 bg-[#3525cd] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#3525cd] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-1.5 h-1.5 bg-[#3525cd] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar Footer */}
          <footer className="border-t border-[#C7C4D8]/40 p-4 bg-white">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative">
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value.slice(0, 1000))}
                  placeholder="Ketik argumen jawaban akademik Anda di sini secara lengkap..."
                  className="w-full rounded-2xl border border-[#C7C4D8]/60 bg-white p-4 pr-12 text-xs text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#3525cd] focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-sm"
                />
                
                {/* Character Counter */}
                <span className="absolute bottom-3.5 right-4 text-[9px] font-bold text-gray-400 font-mono">
                  {inputText.length} / 1000
                </span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span className="text-[10px] font-semibold leading-none">
                    {subTurn < 2
                      ? `Pertanyaan ini aktif. Penguji memiliki ${2 - subTurn} kesempatan sanggahan.`
                      : "Sanggahan maksimal tercapai. Jawaban berikutnya akan memicu pertanyaan baru."}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={!inputText.trim() || isTyping}
                  className={`px-6 py-2.5 rounded-xl text-white font-heading font-extrabold text-xs flex items-center gap-1.5 transition-all duration-300 ${
                    inputText.trim() && !isTyping
                      ? "bg-[#3525cd] hover:bg-[#281baf] shadow-md shadow-indigo-600/15 hover:shadow-lg hover:shadow-indigo-600/25 active:scale-[0.98]"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Kirim Jawaban
                  <span className="material-symbols-outlined text-sm font-bold">send</span>
                </button>
              </div>
            </form>
          </footer>
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideDownFadeIn {
          from { transform: translateY(-12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideUpFadeIn {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideRight {
          from { transform: translateX(-16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideLeft {
          from { transform: translateX(16px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-header {
          animation: slideDownFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-card-1 {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.05s forwards;
          opacity: 0;
        }
        .animate-card-2 {
          animation: slideUpFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
          opacity: 0;
        }
        .animate-slideRight {
          animation: slideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slideLeft {
          animation: slideLeft 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}} />
    </div>
  );
}
