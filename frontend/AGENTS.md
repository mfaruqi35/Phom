<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Phom — Frontend Agent Context

## Overview

Frontend untuk Phom, platform SaaS simulator sidang skripsi berbasis AI. Dibangun dengan Next.js App Router.

Untuk context global project (arsitektur, database schema, alur komunikasi antar service), baca `AGENTS.md` di root.

---

## Tech Stack

| Layer            | Teknologi                                    |
| ---------------- | -------------------------------------------- |
| Framework        | Next.js (App Router)                         |
| Styling          | Tailwind CSS + Shadcn UI                     |
| State Management | Zustand                                      |
| HTTP Client      | ky                                           |
| Form Handling    | React Hook Form + Zod                        |
| Auth (client)    | Better Auth client                           |
| Font             | Plus Jakarta Sans (heading), Inter (body/UI) |

---

## Rendering Pattern

- **Server Components** untuk halaman statis atau yang tidak butuh interaktivitas: `/` (landing), `/evaluation/:session_id`
- **Client Components** untuk halaman interaktif: `/dashboard`, `/workspace/:session_id`, `/login`, `/register`, `/history`
- Jangan jadikan komponen Client Component tanpa alasan jelas

---

## Struktur Folder

```
frontend/
└── app/
    ├── (auth)/
    │   ├── login/
    │   └── register/
    ├── dashboard/
    ├── workspace/
    │   └── [session_id]/
    ├── evaluation/
    │   └── [session_id]/
    ├── history/
    └── page.tsx           # landing page
```

---

## Halaman & Tanggung Jawabnya

| Route                     | Rendering        | Keterangan                                               |
| ------------------------- | ---------------- | -------------------------------------------------------- |
| `/`                       | Server Component | Landing page, hero section                               |
| `/login`                  | Client Component | Form login, email+password dan Google OAuth              |
| `/register`               | Client Component | Form register                                            |
| `/dashboard`              | Client Component | Upload dokumen, konfigurasi sesi, polling status dokumen |
| `/workspace/:session_id`  | Client Component | Simulasi sidang, chat interface, polling pertanyaan      |
| `/evaluation/:session_id` | Server Component | Laporan hasil simulasi                                   |
| `/history`                | Client Component | Riwayat semua sesi                                       |

---

## Konvensi

- Semua nama variabel, fungsi, dan komentar dalam kode menggunakan **English**
- File dan folder menggunakan **kebab-case**
- Komponen React menggunakan **PascalCase**
- Variabel dan fungsi menggunakan **camelCase**
- Konstanta menggunakan **UPPER_SNAKE_CASE**

---

## HTTP Client

Gunakan `ky` untuk semua request ke backend. Buat satu instance di `lib/api.ts` dengan base URL dari environment variable.

```ts
// lib/api.ts
import ky from "ky";

export const api = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,
  credentials: "include",
});
```

Semua request ke backend lewat instance ini. Jangan gunakan `fetch` langsung kecuali untuk kebutuhan Next.js spesifik (revalidation, dsb).

---

## State Management

Gunakan Zustand untuk state yang di-share antar komponen. Jangan gunakan Zustand untuk state lokal yang hanya dipakai satu komponen, cukup `useState`.

Store diletakkan di folder `stores/`, satu file per domain:

```
stores/
├── session-store.ts
├── document-store.ts
└── chat-store.ts
```

---

## Form Handling

Gunakan React Hook Form + Zod untuk semua form. Schema Zod diletakkan di `lib/validations/`.

---

## Design System

Warna, font, dan token desain mengacu ke `DESIGN.md` di root. Ringkasan:

- **Primary:** `#4F46E5`
- **Accent (sanggahan):** `#F97316`
- **Success:** `#22C55E`
- **Danger:** `#EF4444`
- **Warning:** `#F59E0B`
- **Background:** `#F9FAFB`
- **Surface:** `#FFFFFF`

---

## Polling

Dua tempat yang menggunakan polling:

- `/dashboard` — polling `GET /documents/:id/status` setiap 2-3 detik sampai status `ready` atau `failed`
- `/workspace/:session_id` — tidak ada polling aktif, state dikelola via Zustand setelah data awal di-fetch

Implementasi polling menggunakan `setInterval` di dalam `useEffect`, bersihkan interval saat komponen unmount.

---

## Navigasi

- Tidak ada navbar di dalam app, hanya di landing page
- Navigasi ke `/history` dan logout via dropdown avatar di pojok kanan atas dashboard
- Redirect setelah login ke `/dashboard`
- Redirect setelah logout ke `/`
