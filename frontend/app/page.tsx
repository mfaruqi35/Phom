"use client";

import { useState, useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import SlidingAuthCard from "@/components/auth-card";

// Main Landing Page Component
export default function Home() {
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("methodology");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Modal Popup states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Intercept anchor link clicks for smooth scrolling with Lenis and tab selection
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="#"]');
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      let id = href.slice(1);
      if (!id) return;

      if (id.startsWith("solutions-")) {
        const tab = id.replace("solutions-", "");
        if (["methodology", "theory", "argument"].includes(tab)) {
          setActiveTab(tab);
          id = "solutions";
        }
      }

      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        lenis?.scrollTo(el);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [lenis]);

  // Monitor scroll to update navbar background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const openAuthModal = (mode: "signin" | "signup") => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setIsClosing(false);
  };

  const closeAuthModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setAuthModalOpen(false);
      setIsClosing(false);
    }, 200);
  };

  return (
    <ReactLenis root>
      {/* Main Page Container (Gets blurred when modal is open) */}
      <div
        className={`relative min-h-screen bg-bg text-text-primary antialiased font-body transition-all duration-300 ${
          authModalOpen ? "filter blur-md pointer-events-none" : ""
        }`}
      >
        {/* TopNavBar */}
        <Navbar scrolled={scrolled} openAuthModal={openAuthModal} />

        {/* Main Content */}
        <main className="pt-28 pb-20">
          {/* Hero Section */}
          <section id="hero" className="max-w-[1280px] mx-auto px-6 md:px-12 pt-12 md:pt-20 pb-20 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Hero Content */}
              <div className="flex flex-col gap-6 z-10">
                <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-extrabold text-text-primary leading-tight">
                  Kuasai Skripsimu dengan{" "}
                  <span className="bg-gradient-to-r from-[#3525cd] to-[#6f3dd9] bg-clip-text text-transparent">
                    Phom,
                  </span>{" "}
                  <span className="bg-gradient-to-r from-[#ff7e40] to-[#ff512f] bg-clip-text text-transparent">
                    Tanpa Panik
                  </span>
                </h1>
                <p className="font-body text-lg text-text-secondary max-w-xl leading-relaxed">
                  Latih ketenangan mental dan asah argumentasi akademismu
                  melalui simulasi sidang berbasis AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="bg-primary text-white px-8 py-3.5 rounded-lg font-heading text-sm font-bold button-hover glow-effect flex items-center justify-center gap-2 focus:outline-none"
                  >
                    Mulai Simulasi Gratis
                    <span className="material-symbols-outlined text-sm">
                      arrow_forward
                    </span>
                  </button>
                  <a
                    href="#how-it-works"
                    className="bg-transparent border border-border hover:bg-surface-raised text-text-primary px-8 py-3.5 rounded-lg font-heading text-sm font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      play_circle
                    </span>
                    Lihat Cara Kerja
                  </a>
                </div>
              </div>

              {/* Hero Mockup (Interactive Browser Visual) */}
              <div className="relative z-0 h-[450px] w-full hidden lg:block">
                {/* Glowing Decorative Background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/10 rounded-full blur-[80px] -z-10"></div>

                <div className="absolute right-0 top-6 w-[110%] h-full rounded-2xl border border-border/80 shadow-2xl overflow-hidden glass-panel transform -rotate-1 hover:rotate-0 transition-transform duration-700 ease-out origin-bottom-right">
                  {/* Browser Header */}
                  <div className="h-11 bg-surface-raised border-b border-border/60 flex items-center px-4 gap-2">
                    <div className="w-3 h-3 rounded-full bg-danger/20 border border-danger/30"></div>
                    <div className="w-3 h-3 rounded-full bg-warning/20 border border-warning/30"></div>
                    <div className="w-3 h-3 rounded-full bg-success/20 border border-success/30"></div>
                    <div className="mx-auto w-1/2 h-6 bg-surface rounded text-center text-[10px] text-text-secondary leading-6 flex items-center justify-center gap-1.5 border border-border/40">
                      <span className="material-symbols-outlined text-[12px] text-text-secondary">
                        lock
                      </span>
                      app.phom.ai/workspace/active
                    </div>
                  </div>

                  {/* Mockup Inside */}
                  <div className="p-5 bg-surface h-full flex gap-5">
                    {/* Left Mockup Sidebar */}
                    <div className="w-44 bg-surface-raised rounded-lg border border-border/60 p-3 flex flex-col gap-3">
                      <div className="h-4 w-3/4 bg-slate-300/40 rounded"></div>
                      <div className="space-y-2 mt-2">
                        <div className="h-2 w-full bg-slate-200 rounded"></div>
                        <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                        <div className="h-2 w-full bg-primary-subtle rounded border border-primary/10"></div>
                        <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                      </div>

                      <div className="mt-auto h-20 w-full rounded-md bg-accent-subtle border border-accent/20 p-2.5 flex flex-col justify-end">
                        <div className="h-3 w-3/4 bg-accent/70 rounded mb-2"></div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-accent"></div>
                        </div>
                      </div>
                    </div>

                    {/* Right Mockup Chat Area */}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex justify-between items-center bg-surface-raised p-3 rounded-lg border border-border/60">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="material-symbols-outlined text-sm">
                              smart_toy
                            </span>
                          </div>
                          <div>
                            <div className="text-[11px] font-bold text-text-primary">
                              Komite Penguji AI
                            </div>
                            <div className="text-[9px] text-success flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>{" "}
                              Sedang Menguji Metodologi
                            </div>
                          </div>
                        </div>
                        <div className="text-[9px] font-bold text-accent bg-accent-subtle px-2 py-0.5 rounded border border-accent/20">
                          Sanggahan 1/2
                        </div>
                      </div>

                      {/* Chat Bubble List */}
                      <div className="flex-1 bg-surface-raised rounded-lg border border-border/60 p-3 space-y-3 relative overflow-hidden text-[11px]">
                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary/20 flex-shrink-0 mt-0.5"></div>
                          <div className="bg-surface p-2.5 rounded-r-lg rounded-bl-lg text-text-primary border border-border/60 max-w-[85%] leading-relaxed shadow-sm">
                            Anda menggunakan regresi linier dalam Bab 3.
                            Bagaimana Anda memitigasi isu multikolinearitas yang
                            terdeteksi pada variabel bebas?
                          </div>
                        </div>

                        <div className="flex gap-2 flex-row-reverse">
                          <div className="w-5 h-5 bg-indigo-500 rounded-full flex-shrink-0 mt-0.5"></div>
                          <div className="bg-primary text-white p-2.5 rounded-l-lg rounded-br-lg max-w-[85%] leading-relaxed shadow-sm">
                            Kami telah menguji VIF (Variance Inflation Factor)
                            dan memastikan seluruh nilainya di bawah 5, sehingga
                            tidak ada indikasi multikolinearitas serius.
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="w-5 h-5 rounded-full bg-accent/20 flex-shrink-0 mt-0.5"></div>
                          <div className="bg-accent-subtle text-accent-hover p-2.5 rounded-r-lg rounded-bl-lg border border-accent/20 max-w-[85%] leading-relaxed shadow-sm font-medium">
                            Namun nilai toleransi pada variabel X2 sangat
                            mendekati batas kritis. Apakah Anda sudah mencoba
                            alternatif seperti Ridge Regression?
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Tentang Phom */}
          <section
            id="about"
            className="bg-surface border-y border-border/60 py-20"
          >
            <div className="max-w-[1280px] mx-auto px-6 md:px-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="flex flex-col gap-6">
                  <h2 className="font-heading text-3xl font-extrabold text-text-primary leading-tight">
                    Kalahkan Kecemasan, Amankan Kelulusanmu dengan Percaya Diri
                  </h2>
                  <p className="font-body text-md text-base text-text-secondary leading-relaxed">
                    Ubah rasa takut menjadi kesiapan penuh. Phom membantu kamu
                    menguji ketahanan argumen, memetakan kelemahan skripsi
                    secara personal, dan menguasai teknik penyampaian jawaban
                    akademis yang terstruktur sebelum menghadapi sidang yang
                    sesungguhnya.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-primary">
                      01
                    </span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Kesiapan Mental Maksimal
                    </h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      Latih ketenangan dan fokus kamu melalui simulasi
                      interaktif yang dirancang untuk menguji kesiapan
                      psikologis dalam menghadapi tekanan sidang sesungguhnya.
                    </p>
                  </div>
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-accent">
                      02
                    </span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Validasi Metodologi Tanpa Celah
                    </h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      Deteksi dini setiap inkonsistensi data atau kelemahan
                      argumen penelitian secara mandiri sebelum komite dosen
                      penguji menemukannya.
                    </p>
                  </div>
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-success">
                      03
                    </span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Struktur Pertahanan Argumen
                    </h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      Kuasai pola sanggahan terbaik lewat rekonstruksi kalimat
                      akademis agar kamu mampu mempertahankan bobot temuan riset
                      secara objektif.
                    </p>
                  </div>
                  <div className="bg-surface-raised border border-border/60 p-6 rounded-xl flex flex-col gap-3">
                    <span className="text-3xl font-heading font-extrabold text-text-secondary">
                      04
                    </span>
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Evaluasi Komprehensif Per Bab
                    </h3>
                    <p className="font-body text-xs text-text-secondary leading-relaxed">
                      Dapatkan ulasan mendalam yang dipetakan langsung dari
                      struktur bab skripsi kamu, sehingga kamu tahu pasti bagian
                      mana yang memerlukan perbaikan.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Comprehensive Defense Preparation */}
          <section
            className="max-w-[1280px] mx-auto px-6 md:px-12 py-20"
            id="features"
          >
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mb-4">
                Simulasi Sidang Komprehensif
              </h2>
              <p className="font-body text-base text-text-secondary leading-relaxed">
                Phom memproyeksikan simulasi ujian sidang yang nyata berdasarkan
                naskah asli skripsi Anda untuk melatih mental dan pemahaman
                riset Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-surface rounded-xl p-8 border border-border card-hover group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-12 h-12 rounded-lg bg-primary-subtle flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    groups
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                  Komite Penguji AI Kritis
                </h3>
                <p className="font-body text-sm text-text-secondary mb-0 leading-relaxed">
                  Hadapi simulasi dengan AI penguji yang bertindak kritis,
                  objektif, dan ketat layaknya dosen penguji asli untuk menguji
                  argumen naskah akademik Anda.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-surface rounded-xl p-8 border border-border card-hover group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-12 h-12 rounded-lg bg-accent-subtle flex items-center justify-center text-accent mb-6 group-hover:bg-accent group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    troubleshoot
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                  Fokus Pengujian Per Bab
                </h3>
                <p className="font-body text-sm text-text-secondary mb-0 leading-relaxed">
                  Tentukan sendiri bab-bab spesifik yang ingin diujikan terlebih
                  dahulu guna melatih pemahaman Anda secara bertahap dan
                  terfokus.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-surface rounded-xl p-8 border border-border card-hover group relative overflow-hidden shadow-sm">
                <div className="absolute top-0 left-0 w-full h-1 bg-success transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                <div className="w-12 h-12 rounded-lg bg-success-subtle flex items-center justify-center text-success mb-6 group-hover:bg-success group-hover:text-white transition-colors duration-300 shadow-sm">
                  <span
                    className="material-symbols-outlined text-2xl"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    donut_large
                  </span>
                </div>
                <h3 className="font-heading text-lg font-bold text-text-primary mb-3">
                  Skor &amp; Laporan Evaluasi
                </h3>
                <p className="font-body text-sm text-text-secondary mb-0 leading-relaxed">
                  Dapatkan umpan balik instan, skor kelayakan sidang 0-100, dan
                  saran rekonstruksi kalimat akademis setelah sesi simulasi
                  selesai.
                </p>
              </div>
            </div>
          </section>

          {/* Section: Fitur Unggulan Lebih Mendalam */}
          <section id="core-features" className="bg-surface-raised border-y border-border/60 py-20">
            <div className="max-w-[1280px] mx-auto px-6 md:px-12">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <span className="text-primary font-bold tracking-wider uppercase text-xs">
                  Teknologi Inti
                </span>
                <h2 className="font-heading text-3xl font-extrabold text-text-primary mt-2">
                  Mengapa Memilih Simulator AI Phom?
                </h2>
              </div>

              <div className="space-y-20">
                {/* Deep Feature 1: Semantik RAG */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-5 lg:order-2">
                    <div className="inline-flex items-center gap-2 bg-primary-subtle text-primary border border-primary/20 px-3.5 py-1 rounded-full text-xs font-semibold">
                      Analisis Konteks
                    </div>
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Pencarian Konteks Presisi (RAG)
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      AI kami tidak menebak-nebak jawaban Anda. Dengan teknologi
                      **Retrieval-Augmented Generation (RAG)** lokal, Phom
                      secara semantik mencocokkan argumen Anda langsung dengan
                      data primer, teori, dan metodologi yang tertulis di dalam
                      draf PDF skripsi Anda secara presisi.
                    </p>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Hal ini memastikan setiap pertanyaan penguji AI relevan
                      dengan isi bab yang Anda pilih untuk disimulasikan.
                    </p>
                  </div>
                  <div className="bg-surface border border-border p-6 rounded-xl shadow-sm space-y-4 lg:order-1 transform -rotate-1 hover:rotate-0 hover:shadow-xl transition-all duration-700 ease-out origin-bottom-left">
                    <div className="flex justify-between items-center text-xs font-bold text-text-secondary border-b border-border/60 pb-3">
                      <span>PENCARIAN KONTEKS RAG</span>
                      <span className="text-primary bg-primary-subtle px-2 py-0.5 rounded border border-primary/10">
                        Presisi Tinggi
                      </span>
                    </div>
                    <div className="space-y-3">
                      {/* Document Chunk Visual */}
                      <div className="bg-slate-50 border border-dashed border-slate-200 p-3 rounded-lg text-[11px] text-text-secondary leading-relaxed font-mono">
                        <div className="text-[10px] text-primary font-bold uppercase mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            description
                          </span>
                          PDF Chunk: Bab 3 (Halaman 42)
                        </div>
                        &ldquo;...Penelitian ini mengadopsi model regresi linier
                        berganda dengan variabel kontrol ukuran perusahaan
                        (Size) dan leverage (DER) untuk memitigasi
                        bias...&rdquo;
                      </div>

                      <div className="flex justify-center my-1 text-slate-400">
                        <span className="material-symbols-outlined text-lg animate-bounce">
                          arrow_downward
                        </span>
                      </div>

                      {/* Generated Question */}
                      <div className="bg-surface-raised p-3 rounded-lg border border-border/60 text-xs text-text-primary leading-relaxed">
                        <div className="text-[10px] text-accent font-bold uppercase mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">
                            smart_toy
                          </span>
                          Pertanyaan AI yang Dihasilkan
                        </div>
                        &ldquo;Mengapa Anda memilih variabel kontrol ukuran
                        perusahaan (Size) dan leverage (DER) dalam regresi
                        linier berganda Anda? Bagaimana kontribusinya terhadap
                        mitigasi bias?&rdquo;
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deep Feature 2: Sanggahan Interaktif */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 bg-accent-subtle text-accent border border-accent/20 px-3.5 py-1 rounded-full text-xs font-semibold">
                      Sanggahan Interaktif
                    </div>
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Maksimal 2 Kali Sanggahan Per Pertanyaan (Sub-Turns)
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Di ruang sidang sesungguhnya, dosen tidak selalu puas
                      dengan jawaban pertamamu. Phom didesain dengan mekanisme
                      <strong> sub-turn</strong>. Jika argumen pertamamu lemah,
                      AI penguji akan membantah jawaban Anda dengan sanggahan
                      kritis (maksimal 2 kali sanggahan).
                    </p>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Mekanisme ini melatih stamina mental Anda untuk
                      mempertahankan validitas skripsi secara konsisten tanpa
                      panik.
                    </p>
                  </div>
                  <div className="bg-surface border border-border p-6 rounded-xl shadow-sm space-y-4 transform rotate-1 hover:rotate-0 hover:shadow-xl transition-all duration-700 ease-out origin-bottom-right">
                    <div className="flex justify-between items-center text-xs font-bold text-text-secondary border-b border-border/60 pb-3">
                      <span>SIMULASI OBROLAN SIDANG</span>
                      <span className="text-accent bg-accent-subtle px-2 py-0.5 rounded border border-accent/10">
                        Sanggahan 1/2
                      </span>
                    </div>
                    {/* AI Question */}
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-primary">
                        AI
                      </div>
                      <div className="bg-surface-raised p-3 rounded-r-lg rounded-bl-lg text-xs text-text-primary leading-relaxed max-w-[85%] border border-border/60">
                        Definisi &ldquo;theoretical saturation&rdquo; Anda pada
                        Bab 3 belum jelas. Anda menyebutkan wawancara selesai
                        pada informan ke-15, tapi apa indikator saturasi
                        datanya?
                      </div>
                    </div>
                    {/* User Answer */}
                    <div className="flex gap-2 justify-end">
                      <div className="bg-primary text-white p-3 rounded-l-lg rounded-br-lg text-xs leading-relaxed max-w-[85%] text-left">
                        Kami menentukan saturasi data saat 3 wawancara terakhir
                        tidak lagi menghasilkan tema atau kode konseptual baru
                        yang berbeda dari informan sebelumnya.
                      </div>
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-700">
                        U
                      </div>
                    </div>
                    {/* AI Rebuttal (Orange Bubble) */}
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-orange-600 border border-orange-200">
                        AI
                      </div>
                      <div className="bg-[#F97316] text-white p-3 rounded-r-lg rounded-bl-lg text-xs leading-relaxed max-w-[85%] shadow-sm">
                        Namun, bagaimana Anda membuktikan bahwa 3 wawancara
                        terakhir benar-benar tidak membawa variasi baru? Apakah
                        Anda menggunakan instrumen kodifikasi tertentu?
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deep Feature 3: Penilaian Komprehensif */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
                  <div className="space-y-5 lg:order-2">
                    <div className="inline-flex items-center gap-2 bg-success-subtle text-success border border-success/20 px-3.5 py-1 rounded-full text-xs font-semibold">
                      Penilaian Komprehensif
                    </div>
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Penilaian Multi-Dimensi Berbobot
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Tidak ada nilai tebak-tebakan. Evaluasi akhir sidang Anda
                      dihitung menggunakan formula berbobot profesional
                      berdasarkan standar penilaian akademik universitas:
                    </p>
                    <div className="bg-surface border border-border p-4 rounded-lg space-y-2 text-xs font-semibold text-text-secondary font-mono">
                      <div>🗂️ Metodologi & Validitas (Bobot 40%)</div>
                      <div>📘 Penguasaan Teori & Tinjauan (Bobot 30%)</div>
                      <div>🗣️ Ketahanan Argumentasi (Bobot 30%)</div>
                    </div>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Nilai akhir berkisar dari skala{" "}
                      <strong>0 hingga 100</strong>, dilengkapi dengan
                      visualisasi kelemahan per bab untuk perbaikan cepat
                      sebelum hari-H.
                    </p>
                  </div>
                  <div className="bg-surface border border-border p-8 rounded-xl shadow-sm flex flex-col items-center justify-center gap-6 lg:order-1 transform -rotate-1 hover:rotate-0 hover:shadow-xl transition-all duration-700 ease-out origin-bottom-left">
                    <div className="relative w-36 h-36 flex items-center justify-center rounded-full border-8 border-primary-subtle border-t-primary animate-pulse">
                      <div className="text-center">
                        <div className="text-3xl font-heading font-extrabold text-text-primary">
                          78
                          <span className="text-sm text-text-secondary">
                            /100
                          </span>
                        </div>
                        <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-1">
                          Ready for Defense
                        </div>
                      </div>
                    </div>
                    {/* Progress Bars for all 3 dimensions */}
                    <div className="w-full space-y-4">
                      {/* Metodologi */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-text-secondary">
                          <span>Metodologi &amp; Validitas</span>
                          <span>90/100</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: "90%" }}
                          ></div>
                        </div>
                      </div>

                      {/* Teori */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-text-secondary">
                          <span>Penguasaan Teori</span>
                          <span>80/100</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: "80%" }}
                          ></div>
                        </div>
                      </div>

                      {/* Argumentasi */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-text-secondary">
                          <span>Ketahanan Argumentasi</span>
                          <span>60/100</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full"
                            style={{ width: "60%" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Solutions */}
          <section
            className="max-w-[1280px] mx-auto px-6 md:px-12 py-20"
            id="solutions"
          >
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mb-4">
                Evaluasi Terarah untuk Setiap Aspek Skripsi
              </h2>
              <p className="font-body text-base text-text-secondary leading-relaxed">
                Phom menguji draf naskah Anda secara mendalam pada tiga pilar
                utama penilaian sidang skripsi standar akademik.
              </p>
            </div>

            <div className="flex justify-center border-b border-border mb-12">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab("methodology")}
                  className={`pb-4 text-sm font-bold tracking-wide transition-all ${
                    activeTab === "methodology"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Stress-Test Metodologi
                </button>
                <button
                  onClick={() => setActiveTab("theory")}
                  className={`pb-4 text-sm font-bold tracking-wide transition-all ${
                    activeTab === "theory"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Pengujian Teori
                </button>
                <button
                  onClick={() => setActiveTab("argument")}
                  className={`pb-4 text-sm font-bold tracking-wide transition-all ${
                    activeTab === "argument"
                      ? "border-b-2 border-primary text-primary"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  Analisis Argumentasi
                </button>
              </div>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-8 md:p-12 shadow-sm">
              {activeTab === "methodology" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Stress-Test Metodologi &amp; Validitas (Bobot 40%)
                    </h3>
                    <p className="font-body text-base text-text-secondary leading-relaxed">
                      Identifikasi celah dalam desain penelitian, metode
                      sampling, batasan penelitian, dan konsistensi pengolahan
                      data Anda. AI akan menguji apakah metode yang Anda gunakan
                      valid untuk menjawab rumusan masalah.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Mendeteksi bias sampling dan batasan penelitian yang
                        kurang logis.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Memvalidasi robustness data hasil analisis kuantitatif
                        maupun kualitatif.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Mendeteksi jawaban asal-asalan untuk melatih ketepatan
                        penjelasan akademis.
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface-raised border border-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-primary-subtle text-primary text-xs font-bold px-2 py-1 rounded flex items-center justify-center">
                      METODOLOGI
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-300 rounded"></div>
                      <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                      <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 text-xs font-bold text-danger flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        warning
                      </span>
                      Inkonsistensi terdeteksi pada penentuan variabel kontrol
                      di Bab 3.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "theory" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Pengujian Teori &amp; Tinjauan Pustaka (Bobot 30%)
                    </h3>
                    <p className="font-body text-base text-text-secondary leading-relaxed">
                      Uji keselarasan kerangka teoretis yang Anda gunakan dengan
                      temuan hasil penelitian di Bab 4. AI memastikan pemahaman
                      konsep dan landasan teori Anda kokoh serta relevan.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Validasi keselarasan paradigma teori dengan rumusan
                        masalah.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Deteksi ketimpangan sitasi dan rujukan teori pendukung.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Menghubungkan temuan lapangan dengan teori secara
                        koheren.
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface-raised border border-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-1 rounded flex items-center justify-center">
                      TEORI
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-300 rounded"></div>
                      <div className="h-2 w-full bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 text-xs font-bold text-success flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        check_circle
                      </span>
                      Korelasi antara paradigma Habitus Bourdieu dan hasil Bab 4
                      sudah koheren.
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "argument" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="flex flex-col gap-6">
                    <h3 className="font-heading text-2xl font-extrabold text-text-primary">
                      Ketahanan &amp; Kelogisan Argumentasi (Bobot 30%)
                    </h3>
                    <p className="font-body text-base text-text-secondary leading-relaxed">
                      Simulasikan ketahanan mental dan argumen Anda saat
                      menghadapi sanggahan kritis berulang (maksimal 2 kali
                      sanggahan per pertanyaan) dari komite penguji AI.
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Melatih respons taktis dan akademis terhadap sanggahan
                        kritis.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Menghindari jawaban defensif atau subjektif yang
                        melemahkan argumen.
                      </li>
                      <li className="flex items-center gap-3 text-sm font-semibold text-text-secondary">
                        <span className="material-symbols-outlined text-primary text-lg">
                          check_circle
                        </span>
                        Evaluasi mendalam per jawaban untuk perbaikan gaya
                        penyampaian.
                      </li>
                    </ul>
                  </div>
                  <div className="bg-surface-raised border border-border p-6 rounded-xl flex flex-col gap-4">
                    <div className="h-6 w-1/3 bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded flex items-center justify-center">
                      ARGUMENTASI
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-slate-300 rounded"></div>
                      <div className="h-2 w-4/5 bg-slate-200 rounded"></div>
                    </div>
                    <div className="mt-4 border-t border-border pt-4 text-xs font-bold text-warning flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">
                        info
                      </span>
                      Saran perbaikan: Hindari kata &ldquo;mungkin&rdquo; saat
                      mempertahankan data primer.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Cara Pakai */}
          <section
            className="max-w-[1280px] mx-auto px-6 md:px-12 py-20"
            id="how-it-works"
          >
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <span className="text-primary font-bold tracking-wider uppercase text-xs">
                Cara Pakai
              </span>
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mt-2">
                Langkah Menuju Kelulusan dengan Phom
              </h2>
              <p className="font-body text-base text-text-secondary mt-2">
                Simulator kami dirancang sangat ramah pengguna dengan alur
                sidang terintegrasi penuh.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="flex flex-col gap-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    1
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Upload PDF Skripsi
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Unggah draf skripsi naskah akademik Anda (format PDF)
                      dengan aman. Data naskah Anda dienkripsi penuh dan dijaga
                      kerahasiaannya.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    2
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Verifikasi Bab & Halaman
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      AI Phom otomatis mendeteksi Daftar Isi untuk memetakan
                      rentang halaman per bab (misal: Bab I hal 1-10, Bab III
                      hal 26-45). Anda dapat mengonfirmasi atau mengedit manual
                      rentang halaman ini.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    3
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Atur Fokus & Intensitas Sesi
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Pilih bab mana saja yang ingin diuji saat ini, lalu pilih
                      mode intensitas sesi: <strong>Quick Review</strong> (3-5
                      pertanyaan), <strong>Standard Exam</strong> (8-10
                      pertanyaan), atau <strong>Deep Drill</strong> (12-15
                      pertanyaan) untuk ulasan super mendalam.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    4
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Mulai Simulasi & Hadapi Sanggahan
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Masuk ke ruang sidang virtual. Jawab pertanyaan tertulis
                      dosen penguji AI, dan pertahankan argumen Anda saat AI
                      memunculkan sanggahan kritis secara beruntun.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-heading font-extrabold text-sm flex-shrink-0">
                    5
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-heading text-lg font-bold text-text-primary">
                      Lihat Laporan Evaluasi & Revisi
                    </h3>
                    <p className="font-body text-sm text-text-secondary leading-relaxed">
                      Setelah sesi berakhir (minimal telah menjawab 3
                      pertanyaan), naskah penilaian berbobot dihitung secara
                      instan. Pelajari peta kelemahan per bab serta &ldquo;Saran
                      Perbaikan Kalimat&rdquo; dari AI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border p-8 rounded-2xl shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 rounded-full bg-primary-subtle flex items-center justify-center text-primary mb-6 animate-pulse">
                  <span
                    className="material-symbols-outlined text-4xl"
                    style={{ fontVariationSettings: "'FILL' 0" }}
                  >
                    cloud_upload
                  </span>
                </div>
                <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                  Drop your manuscript here
                </h3>
                <p className="font-body text-xs text-text-secondary mb-6 max-w-xs leading-relaxed">
                  PDF atau DOCX dengan ukuran berkas maksimal 25MB. Naskah Anda
                  100% aman dan terenkripsi.
                </p>
                <button
                  onClick={() => openAuthModal("signup")}
                  className="bg-primary text-white px-8 py-3 rounded-lg font-heading text-sm font-bold button-hover shadow-sm focus:outline-none"
                >
                  Pilih Berkas Skripsi
                </button>
              </div>
            </div>
          </section>

          {/* Section: FAQ */}
          <section
            className="max-w-[1280px] mx-auto px-6 md:px-12 py-20 border-t border-border/60"
            id="faq"
          >
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="font-heading text-3xl font-extrabold text-text-primary mb-4">
                Frequently Asked Questions
              </h2>
              <p className="font-body text-base text-text-secondary">
                Pertanyaan umum seputar penggunaan{" "}
                <span className="font-bold">Phom</span>.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <div
                className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 0 ? "border-primary/40 shadow-sm" : ""}`}
              >
                <button
                  onClick={() => toggleFaq(0)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Apakah berkas skripsi saya aman di Phom?
                  </span>
                  <span
                    className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 0 ? "rotate-45 text-primary" : ""}`}
                  >
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 0
                      ? "max-h-40 pb-5 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Ya, keamanan data adalah prioritas utama kami. Semua berkas
                    yang Kamu unggah dienkripsi secara penuh di penyimpanan
                    Supabase Storage pribadi. Naskahmu tidak akan dipublikasikan
                    secara umum dan tidak digunakan untuk melatih model publik.
                  </p>
                </div>
              </div>

              <div
                className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 1 ? "border-primary/40 shadow-sm" : ""}`}
              >
                <button
                  onClick={() => toggleFaq(1)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Format dokumen dan ukuran berkas apa saja yang didukung?
                  </span>
                  <span
                    className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 1 ? "rotate-45 text-primary" : ""}`}
                  >
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 1
                      ? "max-h-40 pb-5 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Saat ini Phom mendukung berkas dengan format PDF dan naskah
                    dokumen dengan ukuran maksimal sebesar 25 MB per dokumen.
                    Kami merekomendasikan dokumen PDF yang sudah diparse secara
                    teks (bukan hasil scan gambar kasar) untuk hasil pemetaan
                    terbaik.
                  </p>
                </div>
              </div>

              <div
                className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 2 ? "border-primary/40 shadow-sm" : ""}`}
              >
                <button
                  onClick={() => toggleFaq(2)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Apakah saya bisa memilih bab tertentu saja untuk
                    disimulasikan?
                  </span>
                  <span
                    className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 2 ? "rotate-45 text-primary" : ""}`}
                  >
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 2
                      ? "max-h-40 pb-5 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Tentu! Pada bagian dashboard simulator, Kamu dapat memilih
                    fokus bab secara spesifik menggunakan pill selector. Kamu
                    bisa memilih Bab 3 saja untuk fokus mematangkan metodologi,
                    atau memilih beberapa bab sekaligus sesuai kebutuhan.
                  </p>
                </div>
              </div>

              <div
                className={`border border-border rounded-xl bg-surface transition-all ${activeFaq === 3 ? "border-primary/40 shadow-sm" : ""}`}
              >
                <button
                  onClick={() => toggleFaq(3)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-heading text-sm md:text-base font-bold text-text-primary">
                    Bagaimana pembagian mode simulasi sidang di Phom?
                  </span>
                  <span
                    className={`material-symbols-outlined text-text-secondary transition-transform duration-300 ${activeFaq === 3 ? "rotate-45 text-primary" : ""}`}
                  >
                    add
                  </span>
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === 3
                      ? "max-h-40 pb-5 opacity-100"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="font-body text-sm text-text-secondary leading-relaxed">
                    Kami menyediakan 3 tingkatan intensitas simulasi: **Quick
                    Review** (sidang cepat 3-5 pertanyaan untuk evaluasi kasar),
                    **Standard Exam** (sidang normal 8-10 pertanyaan), dan
                    **Deep Drill** (sidang komprehensif 12-15 pertanyaan untuk
                    membongkar detail riset terkecil).
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Banner */}
          <section className="max-w-[1280px] mx-auto px-6 md:px-12 py-12">
            <div className="bg-primary rounded-2xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-xl shadow-primary/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-subtle/20 rounded-full blur-2xl transform -translate-x-1/2 translate-y-1/2"></div>

              <div className="relative z-10 max-w-xl text-center md:text-left">
                <h2 className="font-heading text-3xl font-extrabold text-white mb-4">
                  Tingkatkan Peluang Sukses Sidangmu
                </h2>
                <p className="font-body text-sm md:text-base text-primary-subtle mb-0 leading-relaxed">
                  Latih mental, uji pemahaman penelitian, dan hadapi penguji
                  dengan lebih percaya diri menggunakan simulasi AI.
                </p>
              </div>

              <div className="relative z-10 flex flex-col items-center md:items-end gap-3 flex-shrink-0">
                <button
                  onClick={() => openAuthModal("signup")}
                  className="bg-white text-primary px-8 py-4 rounded-xl font-heading text-sm font-bold button-hover shadow-lg focus:outline-none"
                >
                  Daftar Akun Sekarang
                </button>
                <span className="font-body text-xs text-primary-subtle">
                  Tanpa kartu kredit • Gratis uji coba
                </span>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* 5. SLIDING AUTH MODAL POPUP (NOT BLURRED) */}
      {authModalOpen && (
        <div
          onClick={closeAuthModal}
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 ${
            isClosing ? "modal-backdrop-closing" : "modal-backdrop-animated"
          }`}
        >
          <style jsx global>{`
            @keyframes modalFadeIn {
              from {
                opacity: 0;
                backdrop-filter: blur(0px);
                background-color: rgba(0, 0, 0, 0);
              }
              to {
                opacity: 1;
                backdrop-filter: blur(8px);
                background-color: rgba(0, 0, 0, 0.4);
              }
            }
            @keyframes modalFadeOut {
              from {
                opacity: 1;
                backdrop-filter: blur(8px);
                background-color: rgba(0, 0, 0, 0.4);
              }
              to {
                opacity: 0;
                backdrop-filter: blur(0px);
                background-color: rgba(0, 0, 0, 0);
              }
            }
            @keyframes cardScaleIn {
              from {
                transform: scale(0.92) translateY(20px);
                opacity: 0;
              }
              to {
                transform: scale(1) translateY(0);
                opacity: 1;
              }
            }
            @keyframes cardScaleOut {
              from {
                transform: scale(1) translateY(0);
                opacity: 1;
              }
              to {
                transform: scale(0.92) translateY(20px);
                opacity: 0;
              }
            }
            .modal-backdrop-animated {
              animation: modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            .modal-backdrop-closing {
              animation: modalFadeOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
            }
            .modal-card-animated {
              animation: cardScaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)
                forwards;
            }
            .modal-card-closing {
              animation: cardScaleOut 0.2s cubic-bezier(0.4, 0, 1, 1) forwards;
            }
          `}</style>
          {/* Modal Container Card with Close Button */}
          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative ${
              isClosing ? "modal-card-closing" : "modal-card-animated"
            }`}
          >
            {/* Circular Close Button at Top-Right */}
            <button
              onClick={closeAuthModal}
              className="absolute -top-3 -right-3 z-[110] w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-md hover:scale-105 transition-all focus:outline-none"
              aria-label="Tutup"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                close
              </span>
            </button>

            {/* Sliding Auth Card Component */}
            <SlidingAuthCard initialMode={authMode} onClose={closeAuthModal} />
          </div>
        </div>
      )}
    </ReactLenis>
  );
}
