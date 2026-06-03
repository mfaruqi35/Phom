# Phom — Backend Agent Context

## Overview

Backend API untuk Phom. Menangani semua business logic, auth, database access, dan komunikasi ke RAG service.

Untuk context global project (arsitektur, database schema, alur komunikasi antar service), baca `AGENTS.md` di root.

---

## Tech Stack

| Layer      | Teknologi                         |
| ---------- | --------------------------------- |
| Runtime    | Bun                               |
| Framework  | Hono                              |
| ORM        | Prisma                            |
| Validation | Zod + Hono Zod Validator          |
| Auth       | Better Auth + Google OAuth plugin |
| Database   | Supabase (PostgreSQL + pgvector)  |

---

## Struktur Folder

```
backend/
└── src/
    ├── routes/         # Hono route definitions, grouping per domain
    ├── controllers/    # Request handlers, memanggil service
    ├── services/       # Business logic, memanggil Prisma dan RAG service
    ├── middleware/     # Auth guard, error handler, request validation
    ├── lib/
    │   ├── prisma.ts   # Prisma client instance
    │   └── rag.ts      # HTTP client ke RAG service
    └── index.ts        # Entry point
```

---

## Konvensi

- Semua nama variabel, fungsi, dan komentar dalam kode menggunakan **English**
- File dan folder menggunakan **kebab-case**
- Variabel dan fungsi menggunakan **camelCase**
- Konstanta menggunakan **UPPER_SNAKE_CASE**
- Satu file route per domain (e.g. `documents.ts`, `sessions.ts`)
- Controller hanya menangani request/response, logic ada di service
- Service hanya menangani business logic, tidak ada logic di route

---

## API Response Format

Mengacu ke format yang sudah disepakati di root `AGENTS.md`.

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

---

## Error Handling

Gunakan centralized error handler di `middleware/error-handler.ts`. Semua error dilempar via `throw`, ditangkap di satu tempat.

```ts
// middleware/error-handler.ts
app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json(
      {
        success: false,
        error: {
          code: err.code,
          message: err.message,
        },
      },
      err.status,
    );
  }

  return c.json(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    },
    500,
  );
});
```

Buat class `AppError` di `lib/errors.ts` dengan field `code`, `message`, dan `status`.

---

## Validasi Request

Gunakan Zod + Hono Zod Validator untuk semua request. Schema Zod diletakkan di file yang sama dengan route atau di folder `lib/validations/` jika dipakai lebih dari satu tempat.

```ts
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  mode: z.enum(["quick", "standard", "deep"]),
});

app.post("/sessions", zValidator("json", schema), async (c) => {
  const body = c.req.valid("json");
  // ...
});
```

---

## Auth

Better Auth menangani semua auth logic. Session user tersedia via middleware.

- Protect semua route kecuali `/auth/*` dengan auth middleware
- User ID diambil dari session, bukan dari request body atau params
- Jangan percaya `user_id` yang dikirim dari frontend

---

## Komunikasi ke RAG Service

RAG service dipanggil dari `services/`, bukan dari `controllers/` atau `routes/`. Gunakan HTTP client di `lib/rag.ts`.

RAG service tidak exposed ke publik. Backend yang menjadi satu-satunya caller.

Endpoint RAG service yang dipanggil backend:

| Endpoint                   | Dipanggil saat                                        |
| -------------------------- | ----------------------------------------------------- |
| `POST /process`            | Setelah dokumen diupload, untuk parsing dan embedding |
| `POST /validate`           | Validasi apakah dokumen akademik                      |
| `POST /generate-questions` | Saat user klik Start Simulation                       |
| `POST /evaluate`           | Setelah user submit jawaban                           |

---

## Prisma

Prisma client di-instantiate sekali di `lib/prisma.ts`.

```ts
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

Jangan instantiate `PrismaClient` di luar file ini.

---

## Domain & Routes

| Domain        | Route Prefix     | Keterangan                        |
| ------------- | ---------------- | --------------------------------- |
| Auth          | `/auth`          | Ditangani Better Auth             |
| Documents     | `/documents`     | Upload, status, list dokumen user |
| Chapters      | `/chapters`      | CRUD chapter per dokumen          |
| Sessions      | `/sessions`      | Buat, ambil, selesaikan sesi      |
| Questions     | `/questions`     | Ambil pertanyaan per sesi         |
| Messages      | `/messages`      | Simpan dan ambil pesan per sesi   |
| Answer Scores | `/answer-scores` | Simpan dan ambil skor per jawaban |
| Evaluation    | `/evaluation`    | Agregasi skor untuk laporan akhir |
