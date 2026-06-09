"use client";

import { useRef, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { authClient, getApiBaseUrl } from "@/lib/auth-client";

interface QuestionReview {
  question: string;
  userAnswer: string | null;
  chapterLabel: string | null;
  isSatisfied: boolean;
  rebuttal: string | null;
  feedback: string | null;
  scores: {
    methodology: number;
    theory: number;
    argument: number;
  };
}

interface ChapterBreakdown {
  chapterId: string;
  label: string;
  title: string;
  score: number | null;
  verdict: "LULUS" | "REVISI" | "BELUM DIUJI";
}

interface EvaluationData {
  session: {
    id: string;
    userId: string;
    documentId: string;
    mode: string;
    isCompleted: boolean;
    createdAt: string;
    completedAt: string | null;
    document?: {
      title: string;
    };
  };
  finalScore: number;
  breakdown: {
    methodology: number;
    theory: number;
    argument: number;
  };
  averageRebuttal: number;
  chapterBreakdown: ChapterBreakdown[];
  questionReviews: QuestionReview[];
}

const API_BASE_URL = getApiBaseUrl();

const getUserInitials = (name?: string) => {
  if (!name) return "US";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getChapterImprovisedFeedback = (label: string, verdict: string) => {
  const cleanLabel = label.toUpperCase().trim();
  if (verdict === "BELUM DIUJI") {
    return "Bab ini belum sempat diuji karena simulasi diakhiri lebih awal sebelum pertanyaan bab ini muncul.";
  }
  const isPass = verdict === "LULUS";

  if (isPass) {
    if (cleanLabel.includes("BAB I") || cleanLabel.includes("BAB 1"))
      return "Rumusan masalah and tujuan penelitian dirumuskan secara padat dan logis. Latar belakang memiliki alur deduktif yang kuat.";
    if (cleanLabel.includes("BAB II") || cleanLabel.includes("BAB 2"))
      return "Sintesis teori dan penyusunan kerangka pemikiran runtut serta relevan dengan variabel yang diteliti.";
    if (cleanLabel.includes("BAB III") || cleanLabel.includes("BAB 3"))
      return "Metodologi, instrumen penelitian, dan teknik analisis data didefinisikan secara valid serta dapat dipertanggungjawabkan.";
    if (cleanLabel.includes("BAB IV") || cleanLabel.includes("BAB 4"))
      return "Penyajian data tabel analisis sudah memadai, namun korelasi negatif yang tidak signifikan perlu didukung literatur tandingan.";
    if (cleanLabel.includes("BAB V") || cleanLabel.includes("BAB 5"))
      return "Penarikan kesimpulan telah menjawab rumusan masalah secara objektif dengan saran penelitian praktis yang realistis.";
    return "Pertahanan argumentasi akademik Anda untuk bab ini dinilai sudah matang dan siap untuk dipresentasikan.";
  } else {
    if (cleanLabel.includes("BAB I") || cleanLabel.includes("BAB 1"))
      return "Latar belakang masalah kurang tajam dalam memaparkan urgensi penelitian. Perumusan masalah perlu diperjelas fokusnya.";
    if (cleanLabel.includes("BAB II") || cleanLabel.includes("BAB 2"))
      return "Kaitan konsep antar variabel perlu diperkuat kembali untuk menyusun hipotesis dan landasan pustaka yang kokoh.";
    if (cleanLabel.includes("BAB III") || cleanLabel.includes("BAB 3"))
      return "Justifikasi teknik sampling kualitatif dan parameter durasi informan perlu diperjelas secara akademis agar tidak dituduh bias subjektif.";
    if (cleanLabel.includes("BAB IV") || cleanLabel.includes("BAB 4"))
      return "Penafsiran hasil pengujian data kurang komprehensif. Pembahasan temuan belum dikaitkan secara mendalam dengan teori pendukung.";
    if (cleanLabel.includes("BAB V") || cleanLabel.includes("BAB 5"))
      return "Kesimpulan belum menjawab seluruh rumusan masalah. Saran yang diajukan terlalu normatif dan kurang operasional.";
    return "Catatan kritis Dosen Penguji AI menunjukkan perlunya penguatan pemaparan argumen akademis pada bagian ini.";
  }
};

export default function EvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.session_id as string;

  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Profile Dropdown state
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(() => {
    return sessionId !== "mock-session" && !!sessionId;
  });
  const [isStartingNewSession, setIsStartingNewSession] = useState(false);

  const handleRepeatSimulation = async () => {
    if (!evaluationData) return;

    setIsStartingNewSession(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/sessions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId: evaluationData.session.documentId,
          mode: evaluationData.session.mode,
          chapterIds: evaluationData.chapterBreakdown.map((ch) => ch.chapterId),
        }),
        credentials: "include",
      });
      const resJson = await response.json();

      if (resJson.success) {
        router.push(`/workspace/${resJson.data.id}`);
      } else {
        alert(resJson.error?.message || "Gagal mengulangi simulasi sidang.");
        setIsStartingNewSession(false);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi saat mengulangi simulasi.");
      console.error(err);
      setIsStartingNewSession(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set document title
  useEffect(() => {
    if (evaluationData?.session?.document?.title) {
      document.title = `${evaluationData.session.document.title} - Laporan Evaluasi | Phom`;
    } else {
      document.title = "Laporan Evaluasi - Phom";
    }
  }, [evaluationData]);

  // Fetch evaluation data
  useEffect(() => {
    if (!sessionId || sessionId === "mock-session") {
      return;
    }

    const fetchEvaluation = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/evaluation/${sessionId}`, {
          credentials: "include",
        });
        const json = await res.json();
        if (json.success) {
          setEvaluationData(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch evaluation:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvaluation();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col items-center justify-center font-body relative overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />

        <div className="z-10 flex flex-col items-center gap-4 bg-white/60 backdrop-blur-md border border-[#C7C4D8]/30 p-8 rounded-3xl shadow-xl animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white animate-spin">
            <span className="material-symbols-outlined text-2xl font-bold">
              autorenew
            </span>
          </div>
          <p className="text-sm font-heading font-extrabold text-[#3525cd] tracking-wide animate-pulse">
            Memuat Laporan Evaluasi...
          </p>
        </div>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <div className="h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col items-center justify-center font-body relative overflow-hidden">
        <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0" />

        <div className="z-10 flex flex-col items-center gap-4 bg-white/60 backdrop-blur-md border border-[#C7C4D8]/30 p-8 rounded-3xl shadow-xl text-center max-w-md">
          <span className="material-symbols-outlined text-4xl text-red-500">
            error
          </span>
          <h2 className="text-lg font-heading font-extrabold text-gray-800">
            Laporan Tidak Ditemukan
          </h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Data evaluasi untuk sesi ini tidak dapat dimuat. Silakan kembali ke
            dashboard atau muat ulang halaman.
          </p>
          <a
            href="/dashboard"
            className="px-6 py-2.5 rounded-xl bg-[#3525cd] text-white font-heading font-extrabold text-xs shadow-md hover:scale-[1.02] transition-all mt-2"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  const overallScore = evaluationData.finalScore;
  const totalQuestions = evaluationData.questionReviews.length;
  const avgRebuttals = evaluationData.averageRebuttal;

  const methodologyScore = Math.round(
    evaluationData.breakdown.methodology * 20,
  );
  const theoryScore = Math.round(evaluationData.breakdown.theory * 20);
  const argumentScore = Math.round(evaluationData.breakdown.argument * 20);

  // Dynamic eligibility mapping
  let eligibilityText = "BELUM LAYAK";
  let eligibilityGrade = "E";
  let pillBgColor = "bg-red-50 text-red-700 border-red-200/50";
  let pillDotColor = "bg-red-500";

  if (overallScore >= 85) {
    eligibilityText = "LAYAK MAJU SIDANG";
    eligibilityGrade = "A";
    pillBgColor = "bg-emerald-50 text-emerald-700 border-emerald-200/50";
    pillDotColor = "bg-emerald-500";
  } else if (overallScore >= 70) {
    eligibilityText = "CUKUP LAYAK";
    eligibilityGrade = "B+";
    pillBgColor = "bg-indigo-50 text-indigo-700 border-indigo-200/50";
    pillDotColor = "bg-indigo-500";
  } else if (overallScore >= 50) {
    eligibilityText = "REVISI MINOR";
    eligibilityGrade = "C+";
    pillBgColor = "bg-amber-50 text-amber-700 border-amber-200/50";
    pillDotColor = "bg-amber-500";
  } else {
    eligibilityText = "REVISI MAYOR";
    eligibilityGrade = "E";
    pillBgColor = "bg-red-50 text-red-700 border-red-200/50";
    pillDotColor = "bg-red-500";
  }

  // Dynamic Readiness mapping
  const mentalScore = Math.max(30, Math.min(100, Math.round(overallScore + (5 - avgRebuttals * 5))));
  const getMentalLabel = (score: number) => {
    if (score >= 85) return "Sangat Siap";
    if (score >= 70) return "Siap";
    if (score >= 50) return "Cukup";
    return "Perlu Latihan";
  };

  const resilienceScore = Math.max(30, Math.min(100, Math.round(100 - (avgRebuttals * 25))));
  const getResilienceLabel = (score: number) => {
    if (score >= 85) return "Sangat Tangguh";
    if (score >= 70) return "Tangguh";
    if (score >= 50) return "Cukup";
    return "Mudah Goyah";
  };

  const consistencyScore = Math.max(30, Math.min(100, Math.round(overallScore - (Math.abs(methodologyScore - theoryScore) * 0.5))));
  const getConsistencyLabel = (score: number) => {
    if (score >= 85) return "Sangat Konsisten";
    if (score >= 70) return "Konsisten";
    if (score >= 50) return "Cukup";
    return "Fluktuatif";
  };

  const getReadinessNote = (score: number) => {
    if (score >= 85)
      return "Pertahankan ketenangan dan kredibilitas akademis Anda. Naskah Anda dinilai sangat matang dan siap dipertahankan di depan dewan penguji.";
    if (score >= 70)
      return "Pertahankan intonasi tenang saat menjawab sanggahan kritis, dan pastikan Anda menguasai batasan sampel secara mendalam untuk menutupi kelemahan metodologi.";
    return "Perkuat pemahaman dasar mengenai metodologi penelitian Anda dan tinjauan literatur sebelum sidang sesungguhnya. Latih ketenangan agar tidak menjawab defensif.";
  };

  // SVG concentric radial settings
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-[#F8F9FF] text-[#0B1C30] flex flex-col font-body relative overflow-hidden print:bg-white print:text-black">
      {/* Decorative Atmospheric Glows */}
      <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] rounded-full bg-indigo-200/30 blur-[120px] pointer-events-none z-0 print:hidden" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-purple-200/20 blur-[100px] pointer-events-none z-0 print:hidden" />

      {/* Top Header */}
      <header className="w-full max-w-[1240px] mx-auto px-4 pt-4 sticky top-0 z-50 print:hidden animate-header">
        <div className="w-full bg-white/80 backdrop-blur-md border border-[#C7C4D8]/40 px-6 py-3 rounded-full flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <a href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3525cd] to-[#6f3dd9] flex items-center justify-center text-white group-hover:scale-105 transition-transform shadow-md shadow-indigo-600/20">
              <span
                className="material-symbols-outlined text-xl font-bold"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                neurology
              </span>
            </div>
            <span className="text-xl font-heading font-extrabold text-[#3525cd] tracking-tight">
              Phom
            </span>
          </a>

          <div className="flex items-center gap-3 relative" ref={dropdownRef}>
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
                {getUserInitials(user?.name || "Mahasiswa Phom")}
              </div>
              <span className="text-xs font-bold text-gray-700 hidden sm:inline-block">
                {user?.name || "Mahasiswa Phom"}
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
                    {user?.email || "mahasiswa@phom.id"}
                  </p>
                </div>
                <a
                  href="/history"
                  className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50/50 hover:text-[#3525cd] rounded-xl transition-all"
                >
                  <span className="material-symbols-outlined text-base">
                    history
                  </span>
                  Riwayat Sesi
                </a>
                <button
                  onClick={async () => {
                    await authClient.signOut();
                    router.push("/");
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all text-left"
                >
                  <span className="material-symbols-outlined text-base">
                    logout
                  </span>
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 md:px-6 py-10 flex flex-col gap-8 z-10 print:py-0 print:px-0">
        {/* Title */}
        <div className="text-center animate-title print:text-left print:border-b print:pb-4 print:mb-4">
          <h1 className="text-3xl font-heading font-extrabold text-[#0B1C30] tracking-tight mb-2">
            Laporan Evaluasi Simulasi
          </h1>
          <p className="text-sm text-gray-500">
            Hasil penilaian komprehensif untuk naskah:{" "}
            <span className="font-bold text-[#3525cd] block sm:inline mt-1 sm:mt-0">
              {evaluationData.session?.document?.title || "Dokumen Skripsi"}
            </span>
          </p>
        </div>

        {/* 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Core Score, Chapters, and Readiness (Span 5) */}
          <div className="lg:col-span-5 space-y-8 flex flex-col">
            {/* 1. Score Overview Dial Banner */}
            <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-7 shadow-sm flex flex-col sm:flex-row items-center gap-6 animate-card-1 print:border-gray-200">
              {/* Concentric Radial Meter */}
              <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-indigo-50/50 print:stroke-gray-100"
                    strokeWidth="11"
                    fill="transparent"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r={radius}
                    className="stroke-[#3525cd] transition-all duration-1000 print:stroke-black"
                    strokeWidth="11"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-4xl font-heading font-extrabold text-[#3525cd] print:text-black">
                    {overallScore}
                  </span>
                  <span className="text-[9px] text-gray-400 block font-bold font-mono tracking-wider mt-0.5">
                    SKOR AKHIR
                  </span>
                </div>
              </div>

              {/* Quick Metrics Info */}
              <div className="flex flex-col gap-2.5 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-0.5 rounded-full text-[9px] font-bold border flex items-center gap-1 print:border-black print:text-black print:bg-white ${pillBgColor}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full print:bg-black ${pillDotColor}`}
                    ></span>
                    {eligibilityText}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                  Komite penguji AI menilai tingkat argumentasi dan penguasaan
                  naskah Anda berada di kategori kelayakan{" "}
                  <strong className="font-bold text-[#0B1C30]">
                    {eligibilityGrade}
                  </strong>
                  .
                </p>

                <div className="grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 mt-1">
                  <div>
                    <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider block">
                      Total Pertanyaan
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] print:text-black">
                      {totalQuestions} Soal Diuji
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wider block">
                      Rata-rata Sanggahan
                    </span>
                    <span className="text-xs font-bold text-[#0B1C30] print:text-black">
                      {avgRebuttals}x Sanggahan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Chapter Breakdown Status */}
            <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 shadow-sm space-y-4 animate-card-3 print:border-gray-200">
              <p className="text-[9px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
                CHAPTER EVALUATION BREAKDOWN
              </p>

              <div className="space-y-3">
                {evaluationData.chapterBreakdown &&
                evaluationData.chapterBreakdown.length > 0 ? (
                  evaluationData.chapterBreakdown.map((ch) => {
                    const isPass = ch.verdict === "LULUS";
                    const isNotTested = ch.verdict === "BELUM DIUJI";
                    const summary = getChapterImprovisedFeedback(
                      ch.label,
                      ch.verdict,
                    );
                    return (
                      <div
                        key={ch.chapterId}
                        className="flex items-start gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-[#F8F9FF]/20"
                      >
                        <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-1 flex-shrink-0 w-full md:w-28">
                          <span className="text-xs font-extrabold text-[#0B1C30]">
                            {ch.label}
                          </span>
                          <span
                            className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full border ${
                              isNotTested
                                ? "bg-gray-50 text-gray-500 border-gray-200"
                                : isPass
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/50"
                                  : "bg-amber-50 text-amber-700 border-amber-200/50"
                            }`}
                          >
                            {ch.verdict}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 leading-relaxed flex-1">
                          {summary}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Tidak ada data bab yang dinilai.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Defense Readiness Gauges */}
            <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 shadow-sm space-y-4 animate-card-3">
              <p className="text-[9px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
                DEFENSE READINESS GAUGES
              </p>

              <div className="space-y-3.5">
                {/* Mental Readiness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-600">
                    <span>Kesiapan Mental & Ketenangan</span>
                    <span className="text-emerald-600">
                      {mentalScore}% ({getMentalLabel(mentalScore)})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${mentalScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Rebuttal Resilience */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-600">
                    <span>Ketahanan Sanggahan (Resilience)</span>
                    <span className="text-[#3525cd]">
                      {resilienceScore}% ({getResilienceLabel(resilienceScore)})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#3525cd] rounded-full"
                      style={{ width: `${resilienceScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Defense Consistency */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-gray-600">
                    <span>Konsistensi Pertahanan Argumen</span>
                    <span className="text-indigo-400">
                      {consistencyScore}% ({getConsistencyLabel(consistencyScore)})
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-400 rounded-full"
                      style={{ width: `${consistencyScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50 text-[10px] text-gray-500 leading-relaxed font-semibold">
                <strong>Catatan Utama:</strong> {getReadinessNote(overallScore)}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Detailed Grades & Recommendations (Span 7) */}
          <div className="lg:col-span-7 space-y-8 flex flex-col">
            {/* 4. Three Dimension Metrics Bar Graph */}
            <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-7 shadow-sm space-y-5 animate-card-2 print:border-gray-200">
              <p className="text-center text-[9px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
                ACADEMIC DIMENSION GRADES
              </p>

              <div className="space-y-5">
                {/* Methodology */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[#3525cd] text-base print:hidden">
                        settings_suggest
                      </span>
                      Metodologi & Validitas Penelitian (Bobot 40%)
                    </span>
                    <span className="text-[#3525cd] font-mono font-bold">
                      {methodologyScore} / 100
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#3525cd] to-indigo-500 rounded-full print:bg-black"
                      style={{ width: `${methodologyScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Theory */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-purple-600 text-base print:hidden">
                        menu_book
                      </span>
                      Penguasaan Teori & Tinjauan Pustaka (Bobot 30%)
                    </span>
                    <span className="text-purple-600 font-mono font-bold">
                      {theoryScore} / 100
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-400 rounded-full print:bg-black"
                      style={{ width: `${theoryScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Argument */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-amber-600 text-base print:hidden">
                        forum
                      </span>
                      Ketahanan Argumentasi & Retorika (Bobot 30%)
                    </span>
                    <span className="text-amber-600 font-mono font-bold">
                      {argumentScore} / 100
                    </span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full print:bg-black"
                      style={{ width: `${argumentScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Speech Reconstruction & Feedback Reviews */}
            <div className="bg-white rounded-2xl border border-[#C7C4D8]/50 p-6 md:p-7 shadow-sm space-y-5 animate-card-4 print:border-gray-200">
              <p className="text-center text-[9px] font-heading font-extrabold tracking-widest text-gray-400 uppercase">
                SPEECH RECONSTRUCTION & RECOMMENDATIONS
              </p>

              <div className="space-y-6">
                {evaluationData.questionReviews &&
                evaluationData.questionReviews.length > 0 ? (
                  evaluationData.questionReviews.map((rec, i) => (
                    <div
                      key={i}
                      className="border-b border-gray-100 pb-6 last:border-0 last:pb-0 space-y-3.5 animate-fadeIn"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-[#3525cd] print:text-black">
                          Rekomendasi #{i + 1}
                        </span>
                        {rec.chapterLabel && (
                          <span className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-full text-[8px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                            {rec.chapterLabel}
                          </span>
                        )}
                      </div>

                      {/* Pertanyaan */}
                      <div className="text-xs text-[#0B1C30] leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100 font-semibold">
                        <strong>Tanya:</strong> &ldquo;{rec.question}&rdquo;
                      </div>

                      {/* Jawaban User */}
                      <div className="bg-red-50/20 border border-red-100/40 p-3.5 rounded-xl text-xs text-gray-600">
                        <span className="block text-[8px] font-extrabold text-red-600 mb-1.5 uppercase tracking-wider">
                          JAWABAN DEFENSIF ANDA
                        </span>
                        <p className="italic leading-relaxed text-gray-600">
                          &ldquo;{rec.userAnswer || "Tidak ada jawaban."}&rdquo;
                        </p>
                      </div>

                      {/* Feedback AI / Tips Penguji */}
                      <div className="p-3.5 bg-indigo-50/30 border border-indigo-100/40 rounded-xl text-xs text-gray-600 flex items-start gap-2.5 shadow-sm">
                        <span className="material-symbols-outlined text-base text-[#3525cd] font-bold mt-0.5 print:hidden">
                          lightbulb
                        </span>
                        <div className="leading-relaxed">
                          <strong className="text-[#3525cd] block mb-1">
                            Tips Penguji:
                          </strong>
                          <p className="text-gray-600 whitespace-pre-line font-medium leading-relaxed">
                            {rec.feedback ||
                              "Jawaban Anda sudah baik dan mempertahankan metodologi secara ilmiah."}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">
                    Tidak ada review pertanyaan untuk simulasi ini.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-12 pt-4 print:hidden">
          <a
            href="/dashboard"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl border border-[#C7C4D8]/60 text-center font-heading font-extrabold text-xs text-gray-700 hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98]"
          >
            Kembali ke Dashboard
          </a>
          <button
            onClick={handleRepeatSimulation}
            disabled={isStartingNewSession}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#3525cd] text-white text-center font-heading font-extrabold text-xs hover:bg-[#281baf] transition-all shadow-md shadow-indigo-600/10 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isStartingNewSession ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm font-bold">
                  autorenew
                </span>
                Memulai...
              </>
            ) : (
              "Ulangi Simulasi Sidang"
            )}
          </button>
        </div>
      </main>

      {/* Style blocks */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
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
      `,
        }}
      />
    </div>
  );
}
