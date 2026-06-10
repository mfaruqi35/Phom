# Phom — AI-Powered Thesis Defense Simulator

**Phom** adalah platform SaaS simulator sidang skripsi interaktif berbasis Artificial Intelligence (AI).

Platform ini dirancang khusus untuk mahasiswa tingkat akhir yang ingin melatih mental, menguji validitas metodologi penelitian, serta memperkuat argumen akademis mereka sebelum menghadapi komite dosen penguji pada sidang skripsi sesungguhnya.

---

## 🚀 Tautan Publik (Deployment)

Berikut adalah tautan layanan Phom yang telah dideploy secara publik:

- **Frontend (Next.js)**: [https://phom-thesis.vercel.app](https://phom-thesis.vercel.app)
- **Backend (Hono API)**: [https://phom-backend.onrender.com](https://phom-backend.onrender.com)
- **RAG Service (FastAPI)**: [https://phom-rag.onrender.com](https://phom-rag.onrender.com)

---

## 🛠️ Struktur Monorepo

Proyek Phom dibangun menggunakan struktur monorepo dengan pembagian sebagai berikut:

```
Phom/
├── frontend/       # Next.js — UI, Routing, & State Management
├── backend/        # Hono + Prisma + Bun — REST API, Autentikasi, & Logika Bisnis
└── rag-service/    # FastAPI + Python — RAG Pipeline, Question Gen, & Answer Evaluation
```

---

## ✨ Fitur Utama

1.  **Validasi Dokumen Akademis**: Sistem otomatis mendeteksi apakah berkas PDF yang diunggah berupa skripsi/karya ilmiah valid sebelum memproses lebih lanjut.
2.  **Deteksi Bab & Daftar Isi Otomatis**: Mengekstrak struktur bab dari dokumen skripsi secara instan untuk pemetaan ruang lingkup pengujian.
3.  **Simulasi Sidang AI Interaktif**: Mahasiswa dihadapkan dengan pertanyaan-pertanyaan kritis dari penguji AI yang disesuaikan dengan konten bab skripsi mereka.
4.  **Sistem Sanggahan (Sub-turn Rebuttal)**: AI akan membantah jawaban mahasiswa apabila argumennya dinilai kurang kuat (maksimal 2x sanggahan per pertanyaan).
5.  **Laporan Evaluasi Komprehensif**:
    - **Academic Dimension Grades**: Penilaian objektif berskala 0-100 pada 3 dimensi utama (Metodologi, Penguasaan Teori, Ketahanan Argumen).
    - **Defense Readiness Gauges**: Analisis kesiapan mental, ketahanan sanggahan (_resilience_), dan konsistensi pertahanan argumen.
    - **Speech Reconstruction**: Tinjauan detail per pertanyaan, jawaban defensif mahasiswa, dan tips perbaikan argumentasi ilmiah dari penguji.
6.  **Kriteria Penilaian Ketat**: AI penguji dilatih untuk mendeteksi jawaban asal-asalan dan secara otomatis memberikan nilai kelayakan rendah (kategori E / Revisi Mayor).

---

## 💻 Tech Stack

| Komponen            | Teknologi                                | Keterangan                                                        |
| :------------------ | :--------------------------------------- | :---------------------------------------------------------------- |
| **Frontend**        | Next.js, TailwindCSS, Shadcn UI          | Kerangka kerja UI interaktif, responsif, dan premium.             |
| **Backend API**     | Hono, Prisma ORM, Bun Runtime            | REST API berkinerja tinggi dengan Bun dan Prisma.                 |
| **RAG Service**     | FastAPI, Groq SDK, Sentence-Transformers | Pipeline AI berbasis retrieval-augmented generation.              |
| **LLM Model**       | Llama-3.1-8B-Instant (via Groq API)      | Digunakan untuk menghasilkan pertanyaan dan mengevaluasi jawaban. |
| **Embedding Model** | all-MiniLM-L6-v2 (sentence-transformers) | Pembuatan vektor teks skripsi secara lokal (384 dimensi).         |
| **Database**        | Supabase (PostgreSQL + pgvector)         | Database relasional dengan ekstensi pencarian vektor.             |
| **Autentikasi**     | Better Auth + Google OAuth Plugin        | Sistem keamanan login email/password & social login.              |
| **Penyimpanan**     | Supabase Storage                         | Tempat penyimpanan berkas PDF skripsi mahasiswa.                  |

---

## 👥 Tim Pengembang

Proyek ini dikembangkan oleh **Kelompok-5B**:

- **Muhammad Faruqi** (2308107010005)
- **Muhammad Nazlul Ramadhyan** (2308107010036)
- **Faris Zain As-Shadiq** (2308107010039)
