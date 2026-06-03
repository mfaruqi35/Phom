"use client";

import { useState, useRef } from "react";

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
  {
    id: "2",
    label: "II",
    title: "Tinjauan Pustaka",
    pageStart: "11",
    pageEnd: "25",
  },
  {
    id: "3",
    label: "III",
    title: "Metodologi",
    pageStart: "26",
    pageEnd: "45",
  },
  {
    id: "4",
    label: "IV",
    title: "Hasil & Pembahasan",
    pageStart: "",
    pageEnd: "",
  },
  { id: "5", label: "V", title: "Penutup", pageStart: "", pageEnd: "" },
];

const SIMULATION_MODES = [
  {
    id: "quick" as SimulationMode,
    icon: "⚡",
    title: "Quick Review",
    description: "Rapid 15-minute fire-round.",
  },
  {
    id: "standard" as SimulationMode,
    icon: "🎓",
    title: "Standard Exam",
    description: "Full 45-minute simulation.",
  },
  {
    id: "deep" as SimulationMode,
    icon: "🔬",
    title: "Deep Drill",
    description: "Intensive methodology scrutiny.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DashboardHeader() {
  return (
    <header className="w-full bg-white border-b border-[#E5E7EB] px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex flex-col leading-none">
        <span
          className="text-[#4F46E5] font-bold text-base tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Logo Phom
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Avatar + name */}
        <button
          id="dashboard-avatar-btn"
          className="flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 hover:bg-[#F3F4F6] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
            As
          </div>
          <span className="text-sm font-medium text-[#111827]">Nama User</span>
        </button>
      </div>
    </header>
  );
}

function FileUploadZone({
  uploadedFile,
  onFileSelect,
  onFileRemove,
}: {
  uploadedFile: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      onFileSelect(file);
    }
  };

  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div
      id="dashboard-upload-zone"
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`relative w-full rounded-2xl border-2 border-dashed transition-all duration-200 ${
        isDragging
          ? "border-[#4F46E5] bg-[#EEF2FF]"
          : "border-[#D1D5DB] bg-white"
      }`}
    >
      <input
        ref={inputRef}
        id="dashboard-file-input"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelect(file);
        }}
      />

      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        {uploadedFile ? (
          <>
            {/* Remove button */}
            <button
              id="dashboard-remove-file-btn"
              onClick={onFileRemove}
              className="absolute top-4 right-4 text-[#9CA3AF] hover:text-[#EF4444] transition-colors"
              title="Remove file"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
              </svg>
            </button>

            {/* PDF icon */}
            <div className="w-14 h-14 rounded-xl bg-[#EEF2FF] flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect
                  x="4"
                  y="2"
                  width="16"
                  height="20"
                  rx="2"
                  fill="#4F46E5"
                  fillOpacity="0.15"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                />
                <path
                  d="M9 7h6M9 11h6M9 15h4"
                  stroke="#4F46E5"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <text
                  x="4"
                  y="22"
                  fontSize="5"
                  fill="#4F46E5"
                  fontWeight="bold"
                >
                  PDF
                </text>
              </svg>
            </div>

            <p className="text-[#111827] font-semibold text-base mb-1">
              {uploadedFile.name}
            </p>
            <p className="text-[#6B7280] text-sm mb-6">
              {formatSize(uploadedFile.size)}{" "}
              <span className="text-[#22C55E] font-medium">
                • Ready for analysis
              </span>
            </p>

            <button
              id="dashboard-change-file-btn"
              onClick={() => inputRef.current?.click()}
              className="px-5 py-2 rounded-lg border border-[#E5E7EB] text-[#374151] text-sm font-medium hover:bg-[#F3F4F6] transition-colors"
            >
              Change File
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-4">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
            </div>
            <p className="text-[#111827] font-semibold text-base mb-1">
              Jatuhkan PDF skripsimu disini
            </p>
            <p className="text-[#6B7280] text-sm mb-6">
              atau klik untuk mencari langsung dari komputermu
            </p>
            <button
              id="dashboard-browse-btn"
              onClick={() => inputRef.current?.click()}
              className="px-5 py-2 rounded-lg bg-[#4F46E5] text-white text-sm font-medium hover:bg-[#4338CA] transition-colors"
            >
              Cari PDF
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ChapterPageRanges({
  chapters,
  onChange,
}: {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
}) {
  const handleChange = (
    id: string,
    field: "pageStart" | "pageEnd",
    value: string,
  ) => {
    onChange(
      chapters.map((ch) => (ch.id === id ? { ...ch, [field]: value } : ch)),
    );
  };

  return (
    <div className="w-full">
      <p className="text-center text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-5">
        Rentang Halaman Bab
      </p>

      <div className="space-y-3 max-w-lg mx-auto">
        {chapters.map((chapter) => (
          <div key={chapter.id} className="flex items-center">
            <span className="flex-1 text-[#374151] text-sm font-medium">
              {chapter.label}. {chapter.title}
            </span>
            <div className="flex items-center gap-2">
              <input
                id={`dashboard-chapter-${chapter.id}-start`}
                type="number"
                min="1"
                placeholder="Awal"
                value={chapter.pageStart}
                onChange={(e) =>
                  handleChange(chapter.id, "pageStart", e.target.value)
                }
                className="w-16 h-9 rounded-lg border border-[#E5E7EB] bg-white text-center text-sm text-[#374151] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#4F46E5] transition-colors"
              />
              <span className="text-[#D1D5DB]">—</span>
              <input
                id={`dashboard-chapter-${chapter.id}-end`}
                type="number"
                min="1"
                placeholder="Akhir"
                value={chapter.pageEnd}
                onChange={(e) =>
                  handleChange(chapter.id, "pageEnd", e.target.value)
                }
                className="w-16 h-9 rounded-lg border border-[#E5E7EB] bg-white text-center text-sm text-[#374151] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#4F46E5] transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FocusArea({
  chapters,
  selectedIds,
  onToggle,
}: {
  chapters: Chapter[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const availableChapters = chapters.filter((ch) => ch.pageStart && ch.pageEnd);

  return (
    <div className="w-full">
      <p className="text-center text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-5">
        Area Fokus
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {availableChapters.map((chapter) => {
          const isSelected = selectedIds.includes(chapter.id);
          return (
            <button
              id={`dashboard-focus-${chapter.id}`}
              key={chapter.id}
              onClick={() => onToggle(chapter.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-150 ${
                isSelected
                  ? "bg-[#4F46E5] border-[#4F46E5] text-white"
                  : "bg-white border-[#E5E7EB] text-[#374151] hover:border-[#4F46E5] hover:text-[#4F46E5]"
              }`}
            >
              Bab {chapter.label}: {chapter.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SimulationModeSelector({
  selected,
  onSelect,
}: {
  selected: SimulationMode;
  onSelect: (mode: SimulationMode) => void;
}) {
  return (
    <div className="w-full">
      <p className="text-center text-[10px] font-semibold tracking-widest text-[#9CA3AF] uppercase mb-5">
        Mode Simulasi
      </p>

      <div className="grid grid-cols-3 gap-3">
        {SIMULATION_MODES.map((mode) => {
          const isSelected = selected === mode.id;
          return (
            <button
              id={`dashboard-mode-${mode.id}`}
              key={mode.id}
              onClick={() => onSelect(mode.id)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? "border-[#4F46E5] bg-[#EEF2FF]"
                  : "border-[#E5E7EB] bg-white hover:border-[#4F46E5]/50"
              }`}
            >
              <span className="text-xl flex-shrink-0">{mode.icon}</span>
              <div>
                <p
                  className={`text-sm font-semibold leading-tight ${
                    isSelected ? "text-[#4F46E5]" : "text-[#111827]"
                  }`}
                >
                  {mode.title}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5 leading-snug">
                  {mode.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [selectedChapterIds, setSelectedChapterIds] = useState<string[]>(["3"]);
  const [simulationMode, setSimulationMode] =
    useState<SimulationMode>("standard");

  const toggleChapter = (id: string) => {
    setSelectedChapterIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const readyChapters = chapters.filter((ch) => ch.pageStart && ch.pageEnd);
  const selectedFocusChapters = chapters.filter((ch) =>
    selectedChapterIds.includes(ch.id),
  );

  const canStartSimulation =
    uploadedFile !== null &&
    readyChapters.length > 0 &&
    selectedChapterIds.length > 0;

  const getStatusText = () => {
    if (!uploadedFile) return "Unggah skripsimu untuk mulai";
    if (readyChapters.length === 0)
      return "Define chapter page ranges to continue";
    if (selectedChapterIds.length === 0)
      return "Select at least one focus area";
    const chapterNames = selectedFocusChapters.map((ch) => ch.title).join(", ");
    const modeLabel = SIMULATION_MODES.find(
      (m) => m.id === simulationMode,
    )?.title;
    return `System ready for ${chapterNames} · ${modeLabel}`;
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <DashboardHeader />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-10 flex flex-col gap-8">
        {/* Page title */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold text-[#111827] mb-2"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Ruang Kerja
          </h1>
          <p className="text-sm text-[#6B7280]">
            Unggah draft skripsimu untuk memulai simulasi sidang.
          </p>
        </div>

        {/* File upload */}
        <FileUploadZone
          uploadedFile={uploadedFile}
          onFileSelect={setUploadedFile}
          onFileRemove={() => setUploadedFile(null)}
        />

        {/* Chapter page ranges */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <ChapterPageRanges chapters={chapters} onChange={setChapters} />
        </div>

        {/* Focus area */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <FocusArea
            chapters={chapters}
            selectedIds={selectedChapterIds}
            onToggle={toggleChapter}
          />
        </div>

        {/* Simulation mode */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6">
          <SimulationModeSelector
            selected={simulationMode}
            onSelect={setSimulationMode}
          />
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 pb-6">
          <button
            id="dashboard-start-simulation-btn"
            disabled={!canStartSimulation}
            className={`w-full py-4 rounded-2xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all duration-200 ${
              canStartSimulation
                ? "bg-[#4F46E5] hover:bg-[#4338CA] shadow-[0_4px_14px_rgba(79,70,229,0.35)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)] hover:-translate-y-0.5"
                : "bg-[#D1D5DB] cursor-not-allowed"
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Mulai Simulasi
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </button>

          <p className="text-xs text-[#9CA3AF] text-center">
            {getStatusText()}
          </p>
        </div>
      </main>
    </div>
  );
}
