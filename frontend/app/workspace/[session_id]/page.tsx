"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient, getApiBaseUrl } from "@/lib/auth-client";

interface Message {
  id: string;
  role: "USER" | "AI";
  content: string;
  subTurn: number;
  questionId: string;
  timestamp: Date;
}

const getUserInitials = (name?: string) => {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const API_BASE_URL = getApiBaseUrl();

interface SessionChapter {
  id: string;
  chapterId: string;
  chapter: {
    title: string;
  };
}

interface SessionData {
  id: string;
  userId: string;
  documentId: string;
  mode: string;
  totalQuestions: number;
  currentStep: number;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
  document?: {
    title: string;
  };
  sessionChapters: SessionChapter[];
}

interface Question {
  id: string;
  sessionId: string;
  chapterId: string;
  content: string;
  orderIndex: number;
}

interface DbMessage {
  id: string;
  role: "USER" | "AI";
  content: string;
  subTurn: number;
  questionId: string;
  createdAt: string;
}

const activeGenerations = new Set<string>();

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Client-side route guard: redirect to "/" if not logged in
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/");
    }
  }, [session, isPending, router]);

  const [docTitle, setDocTitle] = useState<string>("Full_Thesis_Final_Draft.pdf");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(8);
  const [subTurn, setSubTurn] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessage, setTypingMessage] = useState("sedang mempersiapkan pertanyaan");
  const [isLoading, setIsLoading] = useState(true);
  
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
    if (!sessionId || sessionId === "mock-session") {
      Promise.resolve().then(() => setIsLoading(false));
      return;
    }

    const fetchWorkspaceData = async () => {
      try {
        setIsLoading(true);
        // 1. Fetch Session Details
        const sessionRes = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
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
        } else {
          setIsLoading(false);
          return;
        }

        // Hide full-screen loading spinner because we now have layout & sidebar info ready!
        setIsLoading(false);

        // 2. Fetch Questions
        const questionsRes = await fetch(`${API_BASE_URL}/api/questions/${sessionId}`, {
          credentials: "include",
        });
        const questionsJson = await questionsRes.json();
        
        let currentQuestions = [];
        if (questionsJson.success) {
          currentQuestions = questionsJson.data;
          setQuestions(currentQuestions);
        }

        // 3. If no questions generated yet, trigger LLM generation via API
        if (currentQuestions.length === 0) {
          if (activeGenerations.has(sessionId)) {
            console.log("Already generating questions for session:", sessionId);
            return;
          }
          activeGenerations.add(sessionId);

          setTypingMessage("sedang mempersiapkan pertanyaan");
          setIsTyping(true);
          
          try {
            const genRes = await fetch(`${API_BASE_URL}/api/questions/generate`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                sessionId,
                documentId: sessionJson.data.documentId,
                chapterIds: sessionJson.data.sessionChapters.map((sc: SessionChapter) => sc.chapterId),
                mode: sessionJson.data.mode,
              }),
              credentials: "include",
            });
            const genJson = await genRes.json();
            
            if (genJson.success && genJson.data && genJson.data.length > 0) {
              setQuestions(genJson.data);
              currentQuestions = genJson.data;
              setTotalQuestions(genJson.data.length);
              
              setSessionData((prev: SessionData | null) => prev ? ({
                ...prev,
                totalQuestions: genJson.data.length,
              }) : null);

              // Initialize the first pre-generated question in DB
              const firstQuestion = genJson.data[0];
              const initMsgRes = await fetch(`${API_BASE_URL}/api/messages`, {
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
                  questionId: firstQuestion.id,
                  timestamp: new Date(),
                }]);
              }
            } else {
              activeGenerations.delete(sessionId);
              const errorText = genJson.error?.message || "Gagal membuat pertanyaan sidang skripsi.";
              console.warn("Questions generation skipped/failed:", errorText);
              setMessages([{
                id: `err-init-${Date.now()}`,
                role: "AI",
                content: `⚠️ Gagal mempersiapkan pertanyaan. ${errorText} Silakan muat ulang halaman ini atau pastikan naskah skripsi Anda siap.`,
                subTurn: 0,
                questionId: "",
                timestamp: new Date(),
              }]);
            }
          } catch (genErr: unknown) {
            activeGenerations.delete(sessionId);
            const errMsg = genErr instanceof Error ? genErr.message : String(genErr);
            console.warn("Failed to generate questions:", errMsg);
            setMessages([{
              id: `err-init-${Date.now()}`,
              role: "AI",
              content: `⚠️ Gagal mempersiapkan pertanyaan. ${errMsg || "Koneksi terputus atau terjadi kesalahan server. Silakan muat ulang halaman ini."}`,
              subTurn: 0,
              questionId: "",
              timestamp: new Date(),
            }]);
          } finally {
            setIsTyping(false);
          }
        } else {
          // Questions exist, load existing messages
          const messagesRes = await fetch(`${API_BASE_URL}/api/messages/${sessionId}`, {
            credentials: "include",
          });
          const messagesJson = await messagesRes.json();
          if (messagesJson.success) {
            const fetchedMsgs = messagesJson.data;
            if (fetchedMsgs.length > 0) {
              setMessages(fetchedMsgs.map((m: DbMessage) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                subTurn: m.subTurn,
                questionId: m.questionId,
                timestamp: new Date(m.createdAt),
              })));
              
              const lastMsg = fetchedMsgs[fetchedMsgs.length - 1];
              setSubTurn(lastMsg.subTurn);
            } else {
              // Questions exist but no messages initialized yet
              setTypingMessage("sedang mempersiapkan pertanyaan");
              setIsTyping(true);
              const firstQuestion = currentQuestions[0];
              try {
                const initMsgRes = await fetch(`${API_BASE_URL}/api/messages`, {
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
                    questionId: firstQuestion.id,
                    timestamp: new Date(),
                  }]);
                }
              } catch (initErr) {
                console.error("Failed to initialize first question message:", initErr);
              } finally {
                setIsTyping(false);
              }
            }
          }
        }
      } catch (err) {
        console.error("Failed to load workspace data:", err);
        setIsLoading(false);
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
      
      setTypingMessage("sedang mempersiapkan pertanyaan");
      setIsTyping(true);
      
      try {
        const aiMsgRes = await fetch(`${API_BASE_URL}/api/messages`, {
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
          const refreshRes = await fetch(`${API_BASE_URL}/api/messages/${sessionId}`, {
            credentials: "include",
          });
          const refreshJson = await refreshRes.json();
          if (refreshJson.success) {
            setMessages(refreshJson.data.map((m: DbMessage) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              subTurn: m.subTurn,
              questionId: m.questionId,
              timestamp: new Date(m.createdAt),
            })));

            // Re-sync currentStep dynamically based on unique questionIds in messages
            const uniqueQuestions = new Set(refreshJson.data.map((m: DbMessage) => m.questionId));
            const activeQCount = uniqueQuestions.size;
            if (activeQCount > 0) {
              setCurrentStep(activeQCount);
            }
          }
        }
      } catch (err) {
        console.error("Failed to post next question:", err);
      } finally {
        setIsTyping(false);
      }
    } else {
      setTypingMessage("Sedang mengevaluasi");
      setIsTyping(true);
      
      try {
        await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
          method: "PATCH",
          credentials: "include",
        });
        
        // Wait 2.5 seconds to let the user see the "Sedang mengevaluasi" loading state
        await new Promise((resolve) => setTimeout(resolve, 2500));
        
        // Update sessionData locally to reflect completion
        setSessionData((prev: SessionData | null) => prev ? { ...prev, isCompleted: true } : null);
      } catch (e) {
        console.error("Failed to complete session:", e);
      } finally {
        setIsTyping(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isTyping || !questions.length) return;

    // Find currently active question based on messages history or currentStep
    const lastAskedQuestion = [...questions]
      .reverse()
      .find(q => messages.some(m => m.role === "AI" && m.subTurn === 0 && m.questionId === q.id));
    const currentQuestion = lastAskedQuestion || questions[currentStep - 1] || questions[0];
    if (!currentQuestion) return;

    const userText = inputText;
    setInputText("");
    setTypingMessage("Mempersiapkan sanggahan");
    setIsTyping(true);

    const userMsgLocal: Message = {
      id: `temp-user-${Date.now()}`,
      role: "USER",
      content: userText,
      subTurn: subTurn,
      questionId: currentQuestion.id,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsgLocal]);

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
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
        const messagesRes = await fetch(`${API_BASE_URL}/api/messages/${sessionId}`, {
          credentials: "include",
        });
        const messagesJson = await messagesRes.json();
        if (messagesJson.success) {
          setMessages(messagesJson.data.map((m: DbMessage) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            subTurn: m.subTurn,
            questionId: m.questionId,
            timestamp: new Date(m.createdAt),
          })));

          // Sync currentStep based on unique questionIds in messages
          const uniqueQuestions = new Set(messagesJson.data.map((m: DbMessage) => m.questionId));
          const activeQCount = uniqueQuestions.size;
          if (activeQCount > 0) {
            setCurrentStep(activeQCount);
          }
        }

        const evaluation = resJson.data.evaluation;
        if (evaluation) {
          const isSatisfied = evaluation.is_satisfied !== undefined ? evaluation.is_satisfied : evaluation.isSatisfied;
          if (!isSatisfied && subTurn < 2 && evaluation.rebuttal) {
            const nextSubTurn = subTurn + 1;
            setSubTurn(nextSubTurn);

            setTypingMessage("Mempersiapkan sanggahan");
            setIsTyping(true);

            const aiRebuttalRes = await fetch(`${API_BASE_URL}/api/messages`, {
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
              const refreshRes = await fetch(`${API_BASE_URL}/api/messages/${sessionId}`, {
                credentials: "include",
              });
              const refreshJson = await refreshRes.json();
              if (refreshJson.success) {
                setMessages(refreshJson.data.map((m: DbMessage) => ({
                  id: m.id,
                  role: m.role,
                  content: m.content,
                  subTurn: m.subTurn,
                  questionId: m.questionId,
                  timestamp: new Date(m.createdAt),
                })));

                // Sync currentStep based on unique questionIds in messages
                const uniqueQuestions = new Set(refreshJson.data.map((m: DbMessage) => m.questionId));
                const activeQCount = uniqueQuestions.size;
                if (activeQCount > 0) {
                  setCurrentStep(activeQCount);
                }
              }
            }
          } else {
            await moveToNextQuestion();
          }
        } else {
          await moveToNextQuestion();
        }
      } else {
        // Handle explicit rate limits or general server issues
        const errorMsg: Message = {
          id: `err-${Date.now()}`,
          role: "AI",
          content: `⚠️ Terjadi keterbatasan akses (Rate Limit) pada Dosen Penguji AI. Mohon tunggu 1-2 menit untuk memberikan kesempatan sistem memproses antrean. Anda dapat mencoba menekan tombol "Kirim Jawaban" kembali setelahnya.`,
          subTurn: subTurn,
          questionId: currentQuestion.id,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: "AI",
        content: "⚠️ Terjadi keterbatasan akses (Rate Limit) pada Dosen Penguji AI. Mohon tunggu 1-2 menit untuk memberikan kesempatan sistem memproses antrean. Anda dapat mencoba menekan tombol \"Kirim Jawaban\" kembali setelahnya.",
        subTurn: subTurn,
        questionId: currentQuestion.id,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleEndSession = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/complete`, {
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
  const canEndSession = sessionData?.isCompleted || answeredCount >= 3;

  const activeQuestions = questions.filter(q => messages.some(m => m.questionId === q.id));
  const unmatchedMsgs = messages.filter(m => !questions.some(q => q.id === m.questionId));

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col items-center justify-center font-body relative overflow-hidden">
        {/* Decorative Atmospheric Glows */}
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />
        
        <div className="z-10 flex flex-col items-center gap-4 bg-white/60 backdrop-blur-md border border-[#C7C4D8]/30 p-8 rounded-3xl shadow-xl animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white animate-spin">
            <span className="material-symbols-outlined text-2xl font-bold">
              autorenew
            </span>
          </div>
          <p className="text-sm font-heading font-extrabold text-[#3525cd] tracking-wide animate-pulse">
            Memuat Workspace Simulasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body relative overflow-hidden">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />

      {/* Top Workspace Header */}
      <header className="w-full max-w-[1280px] mx-auto px-4 md:px-6 pt-4 flex-shrink-0 z-50 animate-header">
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
      <div className="flex-1 flex flex-col md:flex-row max-w-[1280px] w-full mx-auto px-4 md:px-6 pb-6 md:pb-6 pt-6 md:pt-8 gap-6 overflow-hidden min-h-0 z-10">
        
        {/* Sidebar Panel */}
        <aside className="w-full md:w-68 flex-shrink-0 flex flex-col gap-6 bg-white border border-[#C7C4D8]/50 rounded-2xl p-6 shadow-sm justify-between md:h-full animate-card-1">
          <div className="space-y-6 animate-fadeIn">
            
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
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {sessionData ? (
                  sessionData.sessionChapters.map((sc: SessionChapter) => (
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
              disabled={!canEndSession}
              className={`w-full py-3.5 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all duration-300 ${
                canEndSession
                  ? "bg-gradient-to-r from-[#3525cd] to-[#6f3dd9] text-white hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-600/10 cursor-pointer"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              Akhiri Sesi Sidang
              <span className="material-symbols-outlined text-sm font-bold">logout</span>
            </button>
            <p className="text-[9px] text-gray-400 text-center font-bold font-heading">
              {canEndSession
                ? "Tekan untuk mengakhiri sesi dan melihat laporan evaluasi."
                : "Minimal jawab 3 pertanyaan untuk mengakhiri sesi."}
            </p>
          </div>
        </aside>

        {/* Chat Console Area */}
        <section className="flex-1 flex flex-col bg-white border border-[#C7C4D8]/50 rounded-2xl shadow-sm overflow-hidden min-h-0 md:h-full animate-card-2">
          
          {/* Chat Bubble List (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 bg-gray-50/30">
            
            {/* Group messages by question */}
            {activeQuestions.map((q, idx) => {
              const questionMsgs = messages.filter((m) => m.questionId === q.id);

              return (
                <div 
                  key={q.id} 
                  className={`w-full flex flex-col gap-5 pb-6 ${
                    idx < activeQuestions.length - 1 ? "border-b border-[#C7C4D8]/30" : ""
                  }`}
                >
                  {/* Pertanyaan Header */}
                  <div className="w-full flex items-center gap-4 py-2 print:hidden animate-fadeIn">
                    <div className="flex-grow h-[1px] bg-[#C7C4D8]/20" />
                    <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#3525cd] bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100/40 shadow-sm">
                      Pertanyaan Ke-{idx + 1}
                    </span>
                    <div className="flex-grow h-[1px] bg-[#C7C4D8]/20" />
                  </div>

                  {/* Question Messages */}
                  <div className="space-y-5">
                    {questionMsgs.map((msg) => {
                      const isAi = msg.role === "AI";
                      const isRebuttal = isAi && msg.subTurn > 0;
                      const isError = msg.content.startsWith("⚠️") || msg.content.includes("Rate Limit");

                      return (
                        <div key={msg.id} className="w-full flex flex-col gap-3">
                          <div
                            className={`flex gap-3.5 max-w-[85%] ${
                              isAi ? "mr-auto animate-slideRight" : "ml-auto flex-row-reverse animate-slideLeft"
                            }`}
                          >
                            {/* Avatar Icon */}
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
                                isError
                                  ? "bg-red-50 border-red-200/50 text-[#EF4444]"
                                  : isRebuttal
                                  ? "bg-[#FFF7ED] border-[#F97316]/20 text-[#F97316]"
                                  : isAi
                                  ? "bg-indigo-50 border-indigo-100/50 text-[#3525cd]"
                                  : "bg-white border-gray-200 text-gray-900"
                              }`}

                            >
                              <span className="material-symbols-outlined text-base font-bold">
                                {isError ? "error" : isRebuttal ? "gavel" : isAi ? "smart_toy" : "person"}
                              </span>
                            </div>

                            {/* Bubble Content Card */}
                            <div
                              className={`p-4 rounded-2xl border text-xs leading-relaxed shadow-sm ${
                                isError
                                  ? "bg-[#FEF2F2] border-[#EF4444]/30 text-[#EF4444] font-medium"
                                  : isRebuttal
                                  ? "bg-[#F97316] border-none text-white font-medium"
                                  : isAi
                                  ? "bg-white border-[#C7C4D8]/40 text-[#0B1C30]"
                                  : "bg-[#3525cd] text-white border-[#3525cd] shadow-md shadow-indigo-600/10"
                              }`}
                            >
                              {isRebuttal && (
                                <span className="block text-[9px] font-heading font-extrabold uppercase tracking-wide mb-1 text-orange-200">
                                  Sanggahan ke - {msg.subTurn}/2
                                </span>
                              )}
                              <p className="whitespace-pre-line font-medium leading-relaxed">{msg.content}</p>
                              <span
                                className={`block text-[9px] mt-2 text-right ${
                                  isAi && !isRebuttal ? "text-gray-400" : isRebuttal ? "text-orange-100" : "text-white/60"
                                }`}
                              >
                                {msg.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Unmatched / Orphaned messages */}
            {unmatchedMsgs.map((msg) => {
              const isAi = msg.role === "AI";
              const isRebuttal = isAi && msg.subTurn > 0;
              const isError = msg.content.startsWith("⚠️") || msg.content.includes("Rate Limit");

              return (
                <div key={msg.id} className="w-full flex flex-col gap-3">
                  <div
                    className={`flex gap-3.5 max-w-[85%] ${
                      isAi ? "mr-auto animate-slideRight" : "ml-auto flex-row-reverse animate-slideLeft"
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm ${
                        isError
                          ? "bg-red-50 border-red-200/50 text-[#EF4444]"
                          : isRebuttal
                          ? "bg-[#FFF7ED] border-[#F97316]/20 text-[#F97316]"
                          : isAi
                          ? "bg-indigo-50 border-indigo-100/50 text-[#3525cd]"
                          : "bg-white border-gray-200 text-gray-900"
                      }`}

                    >
                      <span className="material-symbols-outlined text-base font-bold">
                        {isError ? "error" : isRebuttal ? "gavel" : isAi ? "smart_toy" : "person"}
                      </span>
                    </div>

                    {/* Bubble Content Card */}
                    <div
                      className={`p-4 rounded-2xl border text-xs leading-relaxed shadow-sm ${
                        isError
                          ? "bg-[#FEF2F2] border-[#EF4444]/30 text-[#EF4444] font-medium"
                          : isRebuttal
                          ? "bg-[#F97316] border-none text-white font-medium"
                          : isAi
                          ? "bg-white border-[#C7C4D8]/40 text-[#0B1C30]"
                          : "bg-[#3525cd] text-white border-[#3525cd] shadow-md shadow-indigo-600/10"
                      }`}
                    >
                      {isRebuttal && (
                        <span className="block text-[9px] font-heading font-extrabold uppercase tracking-wide mb-1 text-orange-200">
                          Sanggahan ke - {msg.subTurn}/2
                        </span>
                      )}
                      <p className="whitespace-pre-line font-medium leading-relaxed">{msg.content}</p>
                      <span
                        className={`block text-[9px] mt-2 text-right ${
                          isAi && !isRebuttal ? "text-gray-400" : isRebuttal ? "text-orange-100" : "text-white/60"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Special completion card when session is completed */}
            {sessionData?.isCompleted && (
              <div className="w-full flex flex-col gap-5 pb-6 animate-fadeIn">
                <div className="w-full flex items-center gap-4 py-2 print:hidden">
                  <div className="flex-grow h-[1px] bg-emerald-100" />
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-widest text-[#059669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 shadow-sm">
                    Simulasi Selesai
                  </span>
                  <div className="flex-grow h-[1px] bg-emerald-100" />
                </div>
                
                <div className="w-full flex gap-3.5 max-w-[85%] mr-auto animate-slideRight">
                  {/* AI Avatar */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm bg-emerald-50 border-emerald-100/50 text-[#059669]">
                    <span className="material-symbols-outlined text-base font-bold">
                      check_circle
                    </span>
                  </div>
                  
                  {/* AI Bubble Card */}
                  <div className="p-5 rounded-2xl border border-emerald-100 bg-white text-xs leading-relaxed shadow-sm text-gray-800">
                    <p className="font-semibold text-gray-900 text-sm mb-1 font-heading">Sidang Skripsi Selesai!</p>
                    <p className="font-medium text-gray-600">
                      Seluruh pertanyaan dan sanggahan Anda telah berhasil direkam. Dosen Penguji AI telah menyelesaikan evaluasi terhadap naskah, metodologi, teori, dan argumen akademik Anda. Silakan lihat laporan lengkap Anda di panel bawah atau tombol di pojok kiri bawah.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Typing Indicator */}
            {isTyping && (
              <div className="flex gap-3.5 max-w-[80%] mr-auto animate-fadeIn">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 border border-indigo-100/50 text-[#3525cd] shadow-sm">
                  <span className="material-symbols-outlined text-base font-bold">smart_toy</span>
                </div>
                <div className="bg-[#F3F4F6] p-4 rounded-2xl flex flex-col gap-2 shadow-sm border border-gray-200/50">
                  <div className="flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-[#3525cd] rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-[#3525cd] rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-1.5 h-1.5 bg-[#3525cd] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 animate-pulse">
                    {typingMessage}
                  </span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input Bar Footer */}
          <footer className="border-t border-[#C7C4D8]/40 p-4 bg-white">
            {sessionData?.isCompleted ? (
              <div className="flex flex-col items-center justify-center py-4 px-6 bg-emerald-50/40 rounded-2xl border border-emerald-100/60 text-center gap-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-[#059669]">
                  <span className="material-symbols-outlined text-lg font-bold animate-spin" style={{ animationDuration: '3s' }}>sync</span>
                  <span className="text-xs font-bold uppercase tracking-wider font-heading">Hasil Ujian Dievaluasi</span>
                </div>
                <p className="text-[11px] text-gray-500 font-semibold max-w-md leading-relaxed">
                  Terima kasih telah menyelesaikan seluruh rangkaian simulasi sidang skripsi. Laporan evaluasi telah selesai dianalisis dan siap untuk dilihat.
                </p>
                <a
                  href={`/evaluation/${sessionId}`}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-heading font-extrabold text-xs flex items-center gap-2 shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all shadow-emerald-600/10"
                >
                  Buka Laporan Evaluasi
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value.slice(0, 1000))}
                    placeholder="Ketik argumen jawaban akademik Anda di sini secara lengkap..."
                    disabled={isTyping}
                    className="w-full rounded-2xl border border-[#C7C4D8]/60 bg-white p-4 pr-12 text-xs text-gray-700 placeholder:text-gray-300 focus:outline-none focus:border-[#3525cd] focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none shadow-sm disabled:bg-gray-50 disabled:text-gray-400"
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
            )}
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
