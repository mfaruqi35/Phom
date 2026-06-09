// IMPORTANT: z must be imported from @hono/zod-openapi, NOT from zod
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";

import {
  documentSchema,
  documentStatusSchema,
  chapterSchema,
  chapterInputSchema,
  sessionSchema,
  sessionChapterSchema,
  questionSchema,
  messageSchema,
  evaluationResultSchema,
  answerScoreSchema,
  evaluationReportSchema,
  errorResponseSchema,
  cuidSchema,
} from "./schemas";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const success = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({ success: z.literal(true), data: dataSchema });

const err = (description: string) => ({
  description,
  content: { "application/json": { schema: errorResponseSchema } },
});

// ─── App ─────────────────────────────────────────────────────────────────────

export const swaggerApp = new OpenAPIHono({
  defaultHook: (result, c) => {
    if (!result.success) {
      return c.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data.",
          },
        },
        400,
      );
    }
  },
});

// Security scheme
swaggerApp.openAPIRegistry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "better-auth.session_token",
});

// ─── Spec endpoint ────────────────────────────────────────────────────────────

swaggerApp.doc("/openapi.json", {
  openapi: "3.0.0",
  info: {
    title: "Phom Backend API",
    version: "1.0.0",
    description:
      "REST API untuk platform simulator sidang skripsi berbasis AI — **Phom**.\n\n" +
      "**Autentikasi**: Semua endpoint di luar `/api/auth/*` memerlukan session cookie " +
      "dari Better Auth (`better-auth.session_token`). " +
      "Cookie dikirim otomatis oleh browser setelah login.",
  },
  servers: [{ url: "http://localhost:3001", description: "Local Development" }],
  tags: [
    {
      name: "Auth",
      description:
        "Autentikasi menggunakan Better Auth (email+password & Google OAuth)",
    },
    { name: "Documents", description: "Manajemen dokumen PDF skripsi" },
    { name: "Chapters", description: "Manajemen bab per dokumen" },
    { name: "Sessions", description: "Sesi simulasi sidang" },
    {
      name: "Questions",
      description: "Pertanyaan yang di-generate oleh RAG service",
    },
    {
      name: "Messages",
      description:
        "Percakapan dalam workspace simulasi (auto-trigger evaluasi)",
    },
    { name: "Answer Scores", description: "Skor penilaian per jawaban" },
    {
      name: "Evaluation",
      description: "Laporan evaluasi akhir sesi dengan formula weighted score",
    },
  ],
});

// ─── Swagger UI ───────────────────────────────────────────────────────────────

swaggerApp.get("/docs", swaggerUI({ url: "/openapi.json", deepLinking: true }));

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/api/auth/sign-up/email",
    summary: "Daftar akun baru",
    description: "Mendaftarkan user baru dengan email dan password. Wajib menyertakan header Origin: http://localhost:3001 saat testing via Postman.",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              name: z.string().openapi({ example: "Budi Santoso" }),
              email: z
                .string()
                .email()
                .openapi({ example: "budi@example.com" }),
              password: z.string().min(8).openapi({ example: "password123" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Akun berhasil dibuat",
        content: {
          "application/json": {
            schema: z.object({
              redirect: z.boolean().openapi({ example: false }),
              token: z.string().openapi({ example: "3GKU3RHvvT8OWbDcBs5NdWobLbp1PbAu" }),
              user: z.object({
                id: cuidSchema.openapi({ example: "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW" }),
                name: z.string().openapi({ example: "Budi Santoso" }),
                email: z
                  .string()
                  .email()
                  .openapi({ example: "budi@example.com" }),
                emailVerified: z.boolean().openapi({ example: false }),
                image: z.string().nullable().openapi({ example: null }),
                createdAt: z
                  .string()
                  .datetime()
                  .openapi({ example: "2026-06-06T10:00:00.000Z" }),
                updatedAt: z
                  .string()
                  .datetime()
                  .openapi({ example: "2026-06-06T10:00:00.000Z" }),
              }),
            }),
          },
        },
      },
      422: {
        description: "Email sudah terdaftar",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "User already exists" }),
            }),
          },
        },
      },
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/api/auth/sign-in/email",
    summary: "Login",
    description:
      "Login dengan email dan password. Session cookie di-set otomatis oleh server. Wajib menyertakan header Origin: http://localhost:3001 saat testing via Postman.",
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              email: z
                .string()
                .email()
                .openapi({ example: "budi@example.com" }),
              password: z.string().openapi({ example: "password123" }),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login berhasil",
        content: {
          "application/json": {
            schema: z.object({
              redirect: z.boolean().openapi({ example: false }),
              token: z.string().openapi({ example: "3GKU3RHvvT8OWbDcBs5NdWobLbp1PbAu" }),
              user: z.object({
                id: cuidSchema.openapi({ example: "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW" }),
                name: z.string().openapi({ example: "Budi Santoso" }),
                email: z
                  .string()
                  .email()
                  .openapi({ example: "budi@example.com" }),
                emailVerified: z.boolean().openapi({ example: false }),
                image: z.string().nullable().openapi({ example: null }),
                createdAt: z
                  .string()
                  .datetime()
                  .openapi({ example: "2026-06-06T10:00:00.000Z" }),
                updatedAt: z
                  .string()
                  .datetime()
                  .openapi({ example: "2026-06-06T10:00:00.000Z" }),
              }),
            }),
          },
        },
      },
      401: {
        description: "Email atau password salah",
        content: {
          "application/json": {
            schema: z.object({
              code: z.string().openapi({ example: "INVALID_EMAIL_OR_PASSWORD" }),
              message: z.string().openapi({ example: "Invalid email or password" }),
              status: z.number().openapi({ example: 401 }),
            }),
          },
        },
      },
      403: {
        description: "Origin header tidak valid atau kosong",
        content: {
          "application/json": {
            schema: z.object({
              message: z.string().openapi({ example: "Missing or null Origin" }),
              code: z.string().openapi({ example: "MISSING_OR_NULL_ORIGIN" }),
            }),
          },
        },
      },
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Auth"],
    method: "post",
    path: "/api/auth/sign-out",
    summary: "Logout",
    description: "Menghapus session aktif.",
    responses: {
      200: {
        description: "Logout berhasil",
        content: {
          "application/json": {
            schema: z.object({ success: z.literal(true) }),
          },
        },
      },
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Auth"],
    method: "get",
    path: "/api/auth/get-session",
    summary: "Cek session aktif",
    description:
      "Digunakan frontend untuk verifikasi status login. Mengembalikan `null` jika belum login.",
    responses: {
      200: {
        description: "Data session atau null",
        content: {
          "application/json": {
            schema: z
              .object({
                session: z.object({
                  id: z.string().openapi({ example: "session_xxx" }),
                  createdAt: z
                    .string()
                    .datetime()
                    .openapi({ example: "2026-06-07T12:12:36.051Z" }),
                  updatedAt: z
                    .string()
                    .datetime()
                    .openapi({ example: "2026-06-07T12:12:36.051Z" }),
                  userId: cuidSchema.openapi({ example: "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW" }),
                  expiresAt: z
                    .string()
                    .datetime()
                    .openapi({ example: "2026-07-07T12:12:36.051Z" }),
                  token: z.string().openapi({ example: "3GKU3RHvvT8OWbDcBs5NdWobLbp1PbAu" }),
                  ipAddress: z.string().openapi({ example: "127.0.0.1" }),
                  userAgent: z.string().openapi({ example: "PostmanRuntime/7.x" }),
                }),
                user: z.object({
                  id: cuidSchema.openapi({ example: "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW" }),
                  name: z.string().openapi({ example: "Budi Santoso" }),
                  email: z
                    .string()
                    .email()
                    .openapi({ example: "budi@example.com" }),
                  emailVerified: z.boolean().openapi({ example: false }),
                  image: z.string().nullable().openapi({ example: null }),
                  createdAt: z
                    .string()
                    .datetime()
                    .openapi({ example: "2026-06-07T12:12:36.051Z" }),
                  updatedAt: z
                    .string()
                    .datetime()
                    .openapi({ example: "2026-06-07T12:12:36.051Z" }),
                }),
              })
              .nullable(),
          },
        },
      },
    },
  }),
  (c) => c.json({} as never, 200),
);

// ─────────────────────────────────────────────────────────────────────────────
// DOCUMENTS
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Documents"],
    method: "post",
    path: "/api/documents",
    summary: "Upload PDF skripsi",
    description:
      "Upload dokumen PDF. Setelah upload berhasil, status dokumen akan `PROCESSING` " +
      "hingga RAG service selesai memproses dan menghasilkan chunk embedding. " +
      "Polling status via `GET /api/documents/{id}/status`.",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: z.object({
              file: z.string().openapi({
                type: "string",
                format: "binary",
                description:
                  "File PDF skripsi (max sesuai konfigurasi Supabase Storage)",
              }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Dokumen berhasil diupload",
        content: { "application/json": { schema: success(documentSchema) } },
      },
      400: err("Field tidak lengkap atau file bukan PDF"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 201),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Documents"],
    method: "get",
    path: "/api/documents",
    summary: "Daftar dokumen milik user",
    description:
      "Mengembalikan semua dokumen milik user yang sedang login, diurutkan dari yang terbaru.",
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(z.array(documentSchema)) },
        },
      },
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Documents"],
    method: "get",
    path: "/api/documents/{id}/status",
    summary: "Status pemrosesan dokumen",
    description:
      "Digunakan untuk polling setiap 2–3 detik hingga status menjadi `READY` atau `FAILED`.",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: cuidSchema.openapi({
          param: { name: "id", in: "path" },
          description: "ID dokumen",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(documentStatusSchema) },
        },
      },
      400: err("ID dokumen tidak ada di path"),
      401: err("Tidak ada session aktif"),
      404: err("Dokumen tidak ditemukan"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

// ─────────────────────────────────────────────────────────────────────────────
// CHAPTERS
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Chapters"],
    method: "get",
    path: "/api/chapters/{documentId}",
    summary: "Daftar bab sebuah dokumen",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        documentId: cuidSchema.openapi({
          param: { name: "documentId", in: "path" },
          description: "ID dokumen",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(z.array(chapterSchema)) },
        },
      },
      400: err("ID dokumen tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Chapters"],
    method: "post",
    path: "/api/chapters/{documentId}",
    summary: "Buat bab secara bulk",
    description: "Membuat beberapa bab sekaligus untuk sebuah dokumen.",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        documentId: cuidSchema.openapi({
          param: { name: "documentId", in: "path" },
          description: "ID dokumen",
        }),
      }),
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({ chapters: z.array(chapterInputSchema) }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Bab berhasil dibuat",
        content: {
          "application/json": { schema: success(z.array(chapterSchema)) },
        },
      },
      400: err("Field tidak lengkap atau chapters bukan array"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 201),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Chapters"],
    method: "put",
    path: "/api/chapters/{id}",
    summary: "Update data bab",
    description:
      "Semua field bersifat opsional — hanya field yang dikirim yang akan diperbarui.",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: cuidSchema.openapi({
          param: { name: "id", in: "path" },
          description: "ID bab",
        }),
      }),
      body: {
        required: true,
        content: {
          "application/json": { schema: chapterInputSchema.partial() },
        },
      },
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: success(chapterSchema) } },
      },
      400: err("ID bab tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Chapters"],
    method: "delete",
    path: "/api/chapters/{id}",
    summary: "Hapus bab",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: cuidSchema.openapi({
          param: { name: "id", in: "path" },
          description: "ID bab",
        }),
      }),
    },
    responses: {
      200: {
        description: "Berhasil dihapus",
        content: { "application/json": { schema: success(z.null()) } },
      },
      400: err("ID bab tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

// ─────────────────────────────────────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Sessions"],
    method: "post",
    path: "/api/sessions",
    summary: "Buat sesi simulasi baru",
    description:
      "Membuat sesi baru dengan mode dan daftar bab yang dipilih. " +
      "Setelah sesi dibuat, panggil `POST /api/questions/generate` untuk men-generate pertanyaan.",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              documentId: cuidSchema,
              mode: z.enum(["QUICK", "STANDARD", "DEEP"]).openapi({
                example: "STANDARD",
                description:
                  "QUICK: 3–5 pertanyaan | STANDARD: 8–10 | DEEP: 12–15",
              }),
              chapterIds: z
                .array(cuidSchema)
                .openapi({ example: ["cmc1234", "cmc5678"] }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Sesi berhasil dibuat",
        content: {
          "application/json": {
            schema: success(
              sessionSchema.extend({
                sessionChapters: z.array(sessionChapterSchema),
              }),
            ),
          },
        },
      },
      400: err("Field tidak lengkap atau mode tidak valid"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 201),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Sessions"],
    method: "get",
    path: "/api/sessions/user",
    summary: "Daftar sesi milik user",
    description:
      "Diurutkan dari yang terbaru. Digunakan di halaman `/history`.",
    security: [{ cookieAuth: [] }],
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(z.array(sessionSchema)) },
        },
      },
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Sessions"],
    method: "get",
    path: "/api/sessions/{id}",
    summary: "Detail satu sesi",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: cuidSchema.openapi({
          param: { name: "id", in: "path" },
          description: "ID sesi",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: success(sessionSchema) } },
      },
      400: err("ID sesi tidak ada di path"),
      401: err("Tidak ada session aktif"),
      404: err("Sesi tidak ditemukan"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Sessions"],
    method: "patch",
    path: "/api/sessions/{id}/complete",
    summary: "Tandai sesi selesai",
    description:
      "Di-trigger saat user menekan tombol **End Session**. " +
      "Validasi minimal 3 pertanyaan sudah dijawab (`currentStep >= 3`) dilakukan di sisi frontend.",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: cuidSchema.openapi({
          param: { name: "id", in: "path" },
          description: "ID sesi",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: { "application/json": { schema: success(sessionSchema) } },
      },
      400: err("ID sesi tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Sessions"],
    method: "delete",
    path: "/api/sessions/{id}",
    summary: "Hapus sesi simulasi",
    description:
      "Menghapus sesi simulasi beserta semua pertanyaan, pesan, dan skor yang berkaitan.",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        id: cuidSchema.openapi({
          param: { name: "id", in: "path" },
          description: "ID sesi",
        }),
      }),
    },
    responses: {
      200: {
        description: "Sesi berhasil dihapus",
        content: {
          "application/json": {
            schema: z.object({ success: z.literal(true), data: z.null() }),
          },
        },
      },
      400: err("ID sesi tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONS
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Questions"],
    method: "post",
    path: "/api/questions/generate",
    summary: "Generate pertanyaan via RAG service",
    description:
      "Memanggil RAG service untuk men-generate pertanyaan sidang berdasarkan konten bab. " +
      "Jumlah pertanyaan aktual ditentukan oleh RAG service, bukan hardcoded dari mode. " +
      "Setelah selesai, `totalQuestions` pada sesi diperbarui secara otomatis.",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              sessionId: cuidSchema,
              documentId: cuidSchema,
              chapterIds: z
                .array(cuidSchema)
                .openapi({ example: ["cmc1234", "cmc5678"] }),
              mode: z
                .enum(["QUICK", "STANDARD", "DEEP"])
                .openapi({ example: "STANDARD" }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Pertanyaan berhasil di-generate",
        content: {
          "application/json": { schema: success(z.array(questionSchema)) },
        },
      },
      400: err("Field tidak lengkap"),
      401: err("Tidak ada session aktif"),
      500: err(
        "Internal Server Error atau RAG service tidak menghasilkan pertanyaan",
      ),
    },
  }),
  (c) => c.json({} as never, 201),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Questions"],
    method: "get",
    path: "/api/questions/{sessionId}",
    summary: "Daftar pertanyaan dalam sesi",
    description: "Diurutkan berdasarkan `orderIndex`.",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        sessionId: cuidSchema.openapi({
          param: { name: "sessionId", in: "path" },
          description: "ID sesi",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(z.array(questionSchema)) },
        },
      },
      400: err("ID sesi tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGES
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Messages"],
    method: "get",
    path: "/api/messages/{sessionId}",
    summary: "Semua pesan dalam sesi",
    description: "Diurutkan dari yang paling lama (`createdAt asc`).",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        sessionId: cuidSchema.openapi({
          param: { name: "sessionId", in: "path" },
          description: "ID sesi",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(z.array(messageSchema)) },
        },
      },
      400: err("ID sesi tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Messages"],
    method: "post",
    path: "/api/messages",
    summary: "Kirim pesan baru",
    description:
      "Membuat pesan baru dalam sesi. " +
      "Jika `role = USER` dan `subTurn = 0`, backend otomatis memanggil RAG service untuk evaluasi jawaban, " +
      "menyimpan skor ke `answer_scores`, dan menginkrementasi `currentStep` pada sesi.",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              sessionId: cuidSchema,
              questionId: cuidSchema,
              subTurn: z.number().int().min(0).max(2).default(0).openapi({
                example: 0,
                description:
                  "0 = jawaban utama | 1 = sanggahan pertama | 2 = sanggahan kedua",
              }),
              role: z.enum(["USER", "AI"]).openapi({ example: "USER" }),
              content: z.string().openapi({
                example:
                  "Variabel independen dalam penelitian ini adalah intensitas penggunaan media sosial.",
              }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Pesan berhasil dibuat",
        content: {
          "application/json": {
            schema: success(
              z.object({
                message: messageSchema,
                evaluation: evaluationResultSchema.nullable(),
              }),
            ),
          },
        },
      },
      400: err("Field tidak lengkap atau role tidak valid"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 201),
);

// ─────────────────────────────────────────────────────────────────────────────
// ANSWER SCORES
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Answer Scores"],
    method: "get",
    path: "/api/answer-scores/{sessionId}",
    summary: "Semua skor jawaban dalam sesi",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        sessionId: cuidSchema.openapi({
          param: { name: "sessionId", in: "path" },
          description: "ID sesi",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(z.array(answerScoreSchema)) },
        },
      },
      400: err("ID sesi tidak ada di path"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);

swaggerApp.openapi(
  createRoute({
    tags: ["Answer Scores"],
    method: "post",
    path: "/api/answer-scores",
    summary: "Buat skor jawaban manual",
    description:
      "Pada alur normal, skor dibuat otomatis saat `POST /api/messages` dipanggil dengan `role: USER`. " +
      "Endpoint ini tersedia untuk keperluan override atau pengujian.",
    security: [{ cookieAuth: [] }],
    request: {
      body: {
        required: true,
        content: {
          "application/json": {
            schema: z.object({
              sessionId: cuidSchema,
              questionId: cuidSchema,
              methodologyScore: z
                .number()
                .int()
                .min(1)
                .max(5)
                .openapi({ example: 4 }),
              theoryScore: z
                .number()
                .int()
                .min(1)
                .max(5)
                .openapi({ example: 3 }),
              argumentScore: z
                .number()
                .int()
                .min(1)
                .max(5)
                .openapi({ example: 4 }),
              isSatisfied: z.boolean().openapi({ example: true }),
              rebuttal: z
                .string()
                .nullable()
                .optional()
                .openapi({ example: null }),
            }),
          },
        },
      },
    },
    responses: {
      201: {
        description: "Skor berhasil dibuat",
        content: { "application/json": { schema: success(answerScoreSchema) } },
      },
      400: err("Field tidak lengkap"),
      401: err("Tidak ada session aktif"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 201),
);

// ─────────────────────────────────────────────────────────────────────────────
// EVALUATION
// ─────────────────────────────────────────────────────────────────────────────

swaggerApp.openapi(
  createRoute({
    tags: ["Evaluation"],
    method: "get",
    path: "/api/evaluation/{sessionId}",
    summary: "Laporan evaluasi akhir sesi",
    description:
      "Menghitung dan mengembalikan laporan evaluasi lengkap setelah sesi selesai.\n\n" +
      "**Formula skor akhir:**\n\n" +
      "```\nskor_akhir = ((avg_methodology × 0.4) + (avg_theory × 0.3) + (avg_argument × 0.3)) / 5 × 100\n```\n\n" +
      "Hasil dalam skala **0–100**.",
    security: [{ cookieAuth: [] }],
    request: {
      params: z.object({
        sessionId: cuidSchema.openapi({
          param: { name: "sessionId", in: "path" },
          description: "ID sesi",
        }),
      }),
    },
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": { schema: success(evaluationReportSchema) },
        },
      },
      400: err("ID sesi tidak ada di path"),
      401: err("Tidak ada session aktif"),
      404: err("Sesi tidak ditemukan"),
      500: err("Internal Server Error"),
    },
  }),
  (c) => c.json({} as never, 200),
);
