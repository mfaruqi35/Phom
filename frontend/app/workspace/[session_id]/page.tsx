"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

interface Message {
  id: string;
  role: "USER" | "AI";
  content: string;
  subTurn: number;
  timestamp: Date;
}

const getUserInitials = (name?: string) => {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [docTitle, setDocTitle] = useState<string>("Full_Thesis_Final_Draft.pdf");
  const [sessionData, setSessionData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);

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

  // Set document title
  useEffect(() => {
    document.title = `${docTitle} - Workspace Simulator | Phom`;
  }, [docTitle]);

  // Fetch session, questions, and messages on load
  useEffect(() => {
    if (!sessionId || sessionId === "mock-session") return;

    const fetchWorkspaceData = async () => {
      try {
        // 1. Fetch Session Details
        const sessionRes = await fetch(`http://localhost:3001/api/sessions/${sessionId}`, {
          credentials: "include",
        });
        const sessionJson = await sessionRes.json();
        if (sessionJson.success) {
          setSessionData(sessionJson.data);
          if (sessionJson.data.document?.title) {
            setDocTitle(sessionJson.data.document.title);
          }
          if (sessionJson.data.totalQuestions) {
            setTotalQuestions(sessionJson.data.totalQuestions);
          }
          if (sessionJson.data.currentStep) {
            setCurrentStep(sessionJson.data.currentStep);
          }
        }

        // 2. Fetch Questions
        const questionsRes = await fetch(`http://localhost:3001/api/questions/${sessionId}`, {
          credentials: "include",
        });
        const questionsJson = await questionsRes.json();
        if (questionsJson.success) {
          setQuestions(questionsJson.data);

          // 3. Fetch Messages
          const messagesRes = await fetch(`http://localhost:3001/api/messages/${sessionId}`, {
            credentials: "include",
          });
          const messagesJson = await messagesRes.json();
          if (messagesJson.success) {
            const fetchedMsgs = messagesJson.data;
            if (fetchedMsgs.length > 0) {
              setMessages(fetchedMsgs.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                subTurn: m.subTurn,
                timestamp: new Date(m.createdAt),
              })));
              
              // Set subTurn to the last message's subTurn
              const lastMsg = fetchedMsgs[fetchedMsgs.length - 1];
              setSubTurn(lastMsg.subTurn);
            } else if (questionsJson.data.length > 0) {
              // Initialize chat with the first pre-generated question
              const firstQuestion = questionsJson.data[0];
              const initMsgRes = await fetch("http://localhost:3001/api/messages", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  sessionId,
                  questionId: firstQuestion.id,
                  role: "AI",
                  content: firstQuestion.content,
                  subTurn: 0,
                }),
                credentials: "include",
              });
              const initMsgJson = await initMsgRes.json();
              if (initMsgJson.success) {
                setMessages([{
                  id: initMsgJson.data.message.id,
                  role: "AI",
                  content: firstQuestion.content,
                  subTurn: 0,
                  timestamp: new Date(),
                }]);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load workspace data:", err);
      }
    };

    fetchWorkspaceData();
  }, [sessionId]);

  const moveToNextQuestion = async () => {
    const nextStep = currentStep + 1;
    if (nextStep <= questions.length) {
      setCurrentStep(nextStep);
      setSubTurn(0);
      const nextQuestion = questions[nextStep - 1];
      
      try {
        const aiMsgRes = await fetch("http://localhost:3001/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            questionId: nextQuestion.id,
            role: "AI",
            content: nextQuestion.content,
            subTurn: 0,
          }),
          credentials: "include",
        });
        const aiMsgJson = await aiMsgRes.json();
        if (aiMsgJson.success) {
          const refreshRes = await fetch(`http://localhost:3001/api/messages/${sessionId}`, {
            credentials: "include",
          });
          const refreshJson = await refreshRes.json();
          if (refreshJson.success) {
            setMessages(refreshJson.data.map((m: any) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              subTurn: m.subTurn,
              timestamp: new Date(m.createdAt),
            })));
          }
        }
      } catch (err) {
        console.error("Failed to post next question:", err);
      }
    } else {
      try {
        await fetch(`http://localhost:3001/api/sessions/${sessionId}/complete`, {
          method: "PATCH",
          credentials: "include",
        });
      } catch (e) {
        console.error("Failed to complete session:", e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping || !questions.length) return;

    const currentQuestion = questions[currentStep - 1];
    if (!currentQuestion) return;

    const userText = inputText;
    setInputText("");
    setIsTyping(true);

    const userMsgLocal: Message = {
      id: `temp-user-${Date.now()}`,
      role: "USER",
      content: userText,
      subTurn: subTurn,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsgLocal]);

    try {
      const response = await fetch("http://localhost:3001/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.id,
          role: "USER",
          content: userText,
          subTurn: subTurn,
        }),
        credentials: "include",
      });
      const resJson = await response.json();

      if (resJson.success) {
        const messagesRes = await fetch(`http://localhost:3001/api/messages/${sessionId}`, {
          credentials: "include",
        });
        const messagesJson = await messagesRes.json();
        if (messagesJson.success) {
          setMessages(messagesJson.data.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            subTurn: m.subTurn,
            timestamp: new Date(m.createdAt),
          })));
        }

        const evaluation = resJson.data.evaluation;
        if (evaluation) {
          const isSatisfied = evaluation.is_satisfied !== undefined ? evaluation.is_satisfied : evaluation.isSatisfied;
          if (!isSatisfied && subTurn < 2 && evaluation.rebuttal) {
            const nextSubTurn = subTurn + 1;
            setSubTurn(nextSubTurn);

            const aiRebuttalRes = await fetch("http://localhost:3001/api/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId,
                questionId: currentQuestion.id,
                role: "AI",
                content: evaluation.rebuttal,
                subTurn: nextSubTurn,
              }),
              credentials: "include",
            });
            const aiRebuttalJson = await aiRebuttalRes.json();
            if (aiRebuttalJson.success) {
              const refreshRes = await fetch(`http://localhost:3001/api/messages/${sessionId}`, {
                credentials: "include",
              });
              const refreshJson = await refreshRes.json();
              if (refreshJson.success) {
                setMessages(refreshJson.data.map((m: any) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                  subTurn: m.subTurn,
                  timestamp: new Date(m.createdAt),
                })));
              }
            }
          } else {
            await moveToNextQuestion();
          }
        } else {
          await moveToNextQuestion();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await fetch(`http://localhost:3001/api/sessions/${sessionId}/complete`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch (e) {
      console.error(e);
    }
    router.push(`/evaluation/${sessionId || "mock-session"}`);
  };

  // Condition from AGENTS.md: Minimum 3 questions answered to allow ending session
  const answeredCount = messages.filter((m) => m.role === "USER").length;
  const isEndEnabled = answeredCount >= 3;

  return (
    <div className="h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body relative overflow-hidden">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />

      {/* Top Workspace Header */}
      <header className="w-full max-w-[1240px] mx-auto px-4 pt-4 flex-shrink-0 z-50 animate-header">
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
              <div className="flex items-center gap-2 max-w-[200px] sm:max-w-[300px]">
                <span className="w-2 h-2 rounded-full bg-[#3525cd] animate-pulse flex-shrink-0"></span>
                <span className="text-xs font-extrabold text-[#3525cd] truncate" title={docTitle}>
                  {docTitle}
                </span>
              </div>
            </div>
          </div>

          {/* Profile center/right */}
          <div className="flex items-center gap-4 relative" ref={dropdownRef}>
            {/* User profile dropdown button */}
            <button 
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 rounded-full pl-1.5 pr-3.5 py-1.5 hover:bg-indigo-50/40 border border-[#C7C4D8]/50 bg-white transition-all shadow-sm active:scale-[0.98]"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shadow-inner">
                {getUserInitials(user?.name)}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:inline-block">
                {user?.name || "Dr. Aris Setiawan"}
              </span>
              <span className="material-symbols-outlined text-base text-gray-400">
                keyboard_arrow_down
              </span>
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 top-full mt-2.5 w-52 bg-white border border-indigo-50 rounded-2xl shadow-xl p-2 z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-gray-50 mb-1">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {session ? "Akun Pengguna" : "Akun Demo"}
                  </p>
                  <p className="text-xs font-bold text-gray-800 truncate">
                    {user?.email || "aris.setiawan@univ.ac.id"}
                  </p>
                </div>
                <a 
                  href="/history" 
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50/50 hover:text-[#3525cd] rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-base">history</span>
                  Riwayat Sesi
                </a>
                <button 
                  onClick={async () => {
                    await authClient.signOut();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all text-left"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-[1280px] w-full mx-auto p-4 md:p-6 gap-6 overflow-hidden h-[calc(100vh-120px)] min-h-0 z-10">
        
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
                  <span className="text-xs font-bold text-gray-800 block leading-tight">
                    {sessionData?.mode === "QUICK"
                      ? "Quick Review"
                      : sessionData?.mode === "DEEP"
                      ? "Deep Drill"
                      : "Standard Exam"}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold">
                    {sessionData?.mode === "QUICK"
                      ? "3-5 Questions"
                      : sessionData?.mode === "DEEP"
                      ? "12-15 Questions"
                      : "8-10 Questions"}
                  </span>
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
                {sessionData ? (
                  sessionData.sessionChapters.map((sc: any) => (
                    <div key={sc.id} className="text-xs text-gray-600 font-semibold flex items-center gap-2 bg-indigo-50/20 px-2.5 py-1.5 rounded-lg border border-indigo-50/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd] flex-shrink-0"></span>
                      <span className="truncate" title={sc.chapter.title}>{sc.chapter.title}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="text-xs text-gray-600 font-semibold flex items-center gap-2 bg-indigo-50/20 px-2.5 py-1.5 rounded-lg border border-indigo-50/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                      Pendahuluan
                    </div>
                    <div className="text-xs text-gray-600 font-semibold flex items-center gap-2 bg-indigo-50/20 px-2.5 py-1.5 rounded-lg border border-indigo-50/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                      Metodologi
                    </div>
                    <div className="text-xs text-gray-600 font-semibold flex items-center gap-2 bg-indigo-50/20 px-2.5 py-1.5 rounded-lg border border-indigo-50/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3525cd]"></span>
                      Hasil & Pembahasan
                    </div>
                  </>
                )}
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
