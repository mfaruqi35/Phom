# Phom — Global Agent Context

## Overview

Phom adalah platform SaaS simulator sidang skripsi berbasis AI. Nama diambil dari bahasa Aceh yang berarti "paham".

Target user: mahasiswa tingkat akhir yang ingin melatih mental, menguji validitas metodologi, dan memperkuat argumen akademis sebelum sidang sesungguhnya.

---

## Struktur Monorepo

```
Phom/
├── frontend/       # Next.js — UI dan routing
├── backend/        # Hono + Prisma + Bun — REST API, auth, business logic
└── rag-service/    # FastAPI — RAG pipeline, question generation, answer evaluation
```

---

## Alur Komunikasi Antar Service

```
Frontend → Backend (Hono) → RAG Service (FastAPI)
```

- Frontend tidak pernah memanggil RAG service secara langsung
- Semua request dari frontend melewati backend terlebih dahulu
- Backend memvalidasi request sebelum diteruskan ke RAG service
- RAG service tidak exposed ke publik

---

## Database Schema

9 tabel di Supabase (PostgreSQL + pgvector).

```
users
├── id (PK)
├── email (unique)
├── name
├── password_hash (nullable, kosong jika pakai Google OAuth)
└── created_at

documents
├── id (PK)
├── user_id (FK → users.id)
├── title
├── file_url
├── total_pages
├── status (processing/ready/failed)
└── created_at

chapters
├── id (PK)
├── document_id (FK → documents.id)
├── label (e.g. "BAB I")
├── title (e.g. "Pendahuluan")
├── page_start
├── page_end
└── order_index

sessions
├── id (PK)
├── user_id (FK → users.id)
├── document_id (FK → documents.id)
├── mode (quick/standard/deep)
├── total_questions (di-set setelah generate selesai berdasarkan COUNT aktual)
├── current_step
├── is_completed
├── created_at
└── completed_at (nullable)

session_chapters
├── id (PK)
├── session_id (FK → sessions.id)
└── chapter_id (FK → chapters.id)

questions
├── id (PK)
├── session_id (FK → sessions.id)
├── chapter_id (FK → chapters.id)
├── content
└── order_index

messages
├── id (PK)
├── session_id (FK → sessions.id)
├── question_id (FK → questions.id)
├── sub_turn (0/1/2)
├── role (user/ai)
├── content
└── created_at

answer_scores
├── id (PK)
├── session_id (FK → sessions.id)
├── question_id (FK → questions.id)
├── methodology_score (1-5)
├── theory_score (1-5)
├── argument_score (1-5)
├── is_satisfied
├── rebuttal
└── created_at

document_chunks
├── id (PK)
├── document_id (FK → documents.id)
├── chapter_id (FK → chapters.id)
├── content
├── embedding (vector)
└── created_at
```

Relasi:

```
users ──< documents ──< chapters
                   ──< sessions ──< session_chapters >── chapters
                                ──< questions ──< messages
                                             ──< answer_scores
documents ──< document_chunks
chapters  ──< document_chunks
```

`document_chunks` menyimpan `document_id` dan `chapter_id` secara redundant untuk efisiensi query RAG tanpa perlu join ke `chapters`.

---

## Keputusan Arsitektur yang Sudah Final

**Auth**

- Better Auth di backend Hono, bukan Supabase Auth
- Support email+password dan Google OAuth
- Supabase hanya dipakai sebagai database dan storage

**Polling, bukan WebSocket**

- Document processing status di-cek via polling `GET /documents/:id/status` setiap 2-3 detik
- WebSocket tidak dipakai untuk MVP

**Question generation**

- Semua pertanyaan di-generate sekaligus sebelum workspace terbuka
- `total_questions` di-set setelah generate selesai berdasarkan COUNT aktual dari tabel `questions`, bukan dari target mode
- Jika generate gagal, session di-set status `failed`, user redirect ke dashboard

**Sub-turn sanggahan**

- Maksimal 2 sanggahan per pertanyaan
- Nilai `sub_turn` dikunci di database, tidak bisa diubah setelah di-set

**End Session**

- Minimal 3 pertanyaan harus dijawab sebelum End Session diizinkan
- Tombol End Session di-disable sampai `current_step` mencapai 3

**RAG storage**

- Vector chunks disimpan selamanya untuk MVP
- Tidak ada cron job pembersihan

**Skor**

- Skala 1-5 per dimensi (methodology, theory, argument)
- Formula weighted score:
  ```
  skor_akhir = ((avg_methodology * 0.4) + (avg_theory * 0.3) + (avg_argument * 0.3)) / 5 * 100
  ```
- Hasil skala 0-100

---

## Halaman & Routing

```
/                       landing page
/login                  login
/register               register
/dashboard              upload dokumen dan konfigurasi sesi
/workspace/:session_id  simulasi berlangsung
/evaluation/:session_id laporan hasil simulasi
/history                riwayat semua sesi
```

- Tidak ada navbar di dalam app, hanya di landing page
- Navigasi ke history dan logout via dropdown avatar di pojok kanan atas dashboard

---

## Mode Simulasi

| Mode          | Jumlah Pertanyaan |
| ------------- | ----------------- |
| Quick Review  | 3-5               |
| Standard Exam | 8-10              |
| Deep Drill    | 12-15             |

Jumlah aktual ditentukan oleh RAG service berdasarkan konten bab yang dipilih, bukan hardcoded dari mode.

---

## Naming Conventions

- All variable names, function names, and code comments use English
- File names use kebab-case (e.g. `document-service.ts`, `answer-scores.ts`)
- Database column names use snake_case
- TypeScript/JavaScript variables and functions use camelCase
- Constants use UPPER_SNAKE_CASE
- React components use PascalCase

---

## API Response Format

All backend endpoints return a consistent JSON structure.

**Success:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document with the given ID does not exist."
  }
}
```

**Paginated:**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

Error `code` is a constant string used by the frontend for programmatic error handling. HTTP status codes are still used alongside this format (200, 201, 400, 401, 403, 404, 500).

---

## Tech Stack

| Layer             | Teknologi                                                      |
| ----------------- | -------------------------------------------------------------- |
| Frontend          | Next.js + Tailwind + Shadcn UI                                 |
| Backend API       | Hono + Prisma + Bun                                            |
| AI/RAG Service    | FastAPI + Groq SDK + sentence-transformers + pgvector          |
| Embedding Model   | `all-MiniLM-L6-v2` (sentence-transformers, lokal, dimensi 384) |
| LLM               | `llama-3.1-8b-instant` (Groq)                                  |
| Database          | Supabase (PostgreSQL + pgvector)                               |
| Auth              | Better Auth + Google OAuth plugin                              |
| Storage PDF       | Supabase Storage                                               |
| Frontend Deploy   | Vercel                                                         |
| Backend Deploy    | Railway atau Render                                            |
| AI Service Deploy | Railway atau Render                                            |

RAG service menggunakan Groq SDK untuk LLM dan `sentence-transformers` untuk embedding yang berjalan secara lokal tanpa API key eksternal. Frontend tidak pernah memanggil service AI ini secara langsung.

---

## Monetisasi

Ditunda sampai setelah validasi produk. Semua fitur dibuka gratis untuk MVP.

Rencana setelah MVP:

- Free: 1 dokumen, 10 pertanyaan
- Pro: Rp49.000/bulan, unlimited dokumen
