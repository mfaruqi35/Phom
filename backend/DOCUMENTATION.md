# Phom Backend — API Documentation

Base URL (local): `http://localhost:3001`

---


## Authentication

Semua endpoint di bawah `/api/*` **kecuali** `/api/auth/*` memerlukan autentikasi.
Sertakan session cookie yang diperoleh dari login Better Auth pada setiap request.

| Header | Value |
| ------ | ----- |
| `Cookie` | `better-auth.session_token=<token>` (dikirim otomatis oleh browser / ky) |
| `Origin` | `http://localhost:3001` (wajib saat testing via Postman) |

Jika tidak ada session yang valid, semua endpoint terproteksi akan mengembalikan `401 Unauthorized`.

---

## Auth Endpoints

Dikelola langsung oleh **Better Auth**. Base path: `/api/auth`

> **Catatan Testing (Postman):** Semua request ke `/api/auth/*` wajib menyertakan header `Origin: http://localhost:3001`. Browser mengirim header ini secara otomatis, tetapi Postman tidak.

### `POST /api/auth/sign-up/email`

Mendaftarkan akun baru dengan email dan password.

**Request Headers**

| Header | Value |
| ------ | ----- |
| `Content-Type` | `application/json` |
| `Origin` | `http://localhost:3001` |

**Request Body**

```json
{
  "name": "Budi Santoso",
  "email": "budi@example.com",
  "password": "password123"
}
```

**200 OK**

```json
{
  "redirect": false,
  "token": "3GKU3RHvvT8OWbDcBs5NdWobLbp1PbAu",
  "user": {
    "id": "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "emailVerified": false,
    "image": null,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z"
  }
}
```

**422 Unprocessable Entity** — email sudah terdaftar

```json
{
  "message": "User already exists"
}
```

---

### `POST /api/auth/sign-in/email`

Login dengan email dan password.

**Request Headers**

| Header | Value |
| ------ | ----- |
| `Content-Type` | `application/json` |
| `Origin` | `http://localhost:3001` |

**Request Body**

```json
{
  "email": "budi@example.com",
  "password": "password123"
}
```

**200 OK**

```json
{
  "redirect": false,
  "token": "3GKU3RHvvT8OWbDcBs5NdWobLbp1PbAu",
  "user": {
    "id": "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "emailVerified": false,
    "image": null,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "updatedAt": "2026-06-06T10:00:00.000Z"
  }
}
```

Session cookie `better-auth.session_token` di-set otomatis oleh server pada response ini.

**401 Unauthorized** — password salah atau email tidak ditemukan

```json
{
  "code": "INVALID_EMAIL_OR_PASSWORD",
  "message": "Invalid email or password",
  "status": 401
}
```

**403 Forbidden** — header `Origin` tidak ada atau tidak dikenal

```json
{
  "message": "Missing or null Origin",
  "code": "MISSING_OR_NULL_ORIGIN"
}
```

---

### `POST /api/auth/sign-out`

Logout dan menghapus session aktif.

**200 OK**

```json
{
  "success": true
}
```

---

### `GET /api/auth/get-session`

Mengambil data session yang sedang aktif. Digunakan oleh frontend untuk mengecek status login.

**200 OK** — ada session aktif

```json
{
  "session": {
    "id": "session_xxx",
    "createdAt": "2026-06-07T12:12:36.051Z",
    "updatedAt": "2026-06-07T12:12:36.051Z",
    "userId": "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW",
    "expiresAt": "2026-07-07T12:12:36.051Z",
    "token": "3GKU3RHvvT8OWbDcBs5NdWobLbp1PbAu",
    "ipAddress": "127.0.0.1",
    "userAgent": "PostmanRuntime/7.x"
  },
  "user": {
    "id": "0w10wb6s0n5QB6zR1nzdGXVeaVTkbsUW",
    "name": "Budi Santoso",
    "email": "budi@example.com",
    "emailVerified": false,
    "image": null,
    "createdAt": "2026-06-07T12:12:36.051Z",
    "updatedAt": "2026-06-07T12:12:36.051Z"
  }
}
```

**200 OK** — tidak ada session aktif

```json
null
```

---

## Documents

### `POST /api/documents`

Upload dokumen PDF skripsi baru. Menggunakan `multipart/form-data`.

**Request** — `Content-Type: multipart/form-data`

| Field | Type | Keterangan |
| ----- | ---- | ---------- |
| `file` | `File` | File PDF yang akan diupload |
| `title` | `string` | Judul dokumen |

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "cuid_doc",
    "userId": "cuid_user",
    "title": "Skripsi Analisis Sistem",
    "fileUrl": "https://supabase.co/storage/v1/object/public/documents/...",
    "totalPages": 0,
    "status": "PROCESSING",
    "createdAt": "2026-06-06T10:00:00.000Z"
  }
}
```

**400 Bad Request** — field tidak lengkap

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "File and title are required."
  }
}
```

**400 Bad Request** — file bukan PDF

```json
{
  "success": false,
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "Only PDF files are allowed."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `GET /api/documents`

Mengambil daftar semua dokumen milik user yang sedang login.

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_doc",
      "userId": "cuid_user",
      "title": "Skripsi Analisis Sistem",
      "fileUrl": "https://...",
      "totalPages": 120,
      "status": "READY",
      "createdAt": "2026-06-06T10:00:00.000Z"
    }
  ]
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `GET /api/documents/:id/status`

Mengambil status pemrosesan sebuah dokumen. Digunakan untuk polling setiap 2-3 detik.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `id` | `string` | ID dokumen |

**200 OK**

```json
{
  "success": true,
  "data": {
    "status": "READY"
  }
}
```

> Nilai `status`: `PROCESSING` | `READY` | `FAILED`

**400 Bad Request** — param `id` tidak ada

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Document ID is required."
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "DOCUMENT_NOT_FOUND",
    "message": "Document with the given ID does not exist."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## Chapters

### `GET /api/chapters/:documentId`

Mengambil daftar bab dari sebuah dokumen.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `documentId` | `string` | ID dokumen |

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_ch1",
      "documentId": "cuid_doc",
      "label": "I",
      "title": "Pendahuluan",
      "pageStart": 1,
      "pageEnd": 15,
      "orderIndex": 1
    },
    {
      "id": "cuid_ch2",
      "documentId": "cuid_doc",
      "label": "II",
      "title": "Tinjauan Pustaka",
      "pageStart": 16,
      "pageEnd": 40,
      "orderIndex": 2
    }
  ]
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Document ID is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `POST /api/chapters/:documentId`

Membuat bab-bab baru untuk sebuah dokumen secara bulk.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `documentId` | `string` | ID dokumen |

**Request** — `Content-Type: application/json`

```json
{
  "chapters": [
    {
      "label": "I",
      "title": "Pendahuluan",
      "pageStart": 1,
      "pageEnd": 15,
      "orderIndex": 1
    },
    {
      "label": "II",
      "title": "Tinjauan Pustaka",
      "pageStart": 16,
      "pageEnd": 40,
      "orderIndex": 2
    }
  ]
}
```

**201 Created**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_ch1",
      "documentId": "cuid_doc",
      "label": "I",
      "title": "Pendahuluan",
      "pageStart": 1,
      "pageEnd": 15,
      "orderIndex": 1
    }
  ]
}
```

**400 Bad Request** — `chapters` bukan array atau tidak ada

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "chapters array is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `PUT /api/chapters/:id`

Memperbarui data sebuah bab (label, title, pageStart, pageEnd).

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `id` | `string` | ID bab |

**Request** — `Content-Type: application/json`

```json
{
  "title": "Pendahuluan & Latar Belakang",
  "pageEnd": 18
}
```

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "cuid_ch1",
    "documentId": "cuid_doc",
    "label": "I",
    "title": "Pendahuluan & Latar Belakang",
    "pageStart": 1,
    "pageEnd": 18,
    "orderIndex": 1
  }
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Chapter ID is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `DELETE /api/chapters/:id`

Menghapus sebuah bab.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `id` | `string` | ID bab |

**200 OK**

```json
{
  "success": true,
  "data": null
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Chapter ID is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## Sessions

### `POST /api/sessions`

Membuat sesi simulasi baru.

**Request** — `Content-Type: application/json`

```json
{
  "documentId": "cuid_doc",
  "mode": "STANDARD",
  "chapterIds": ["cuid_ch1", "cuid_ch3"]
}
```

> Nilai `mode`: `QUICK` | `STANDARD` | `DEEP`

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "cuid_session",
    "userId": "cuid_user",
    "documentId": "cuid_doc",
    "mode": "STANDARD",
    "totalQuestions": 0,
    "currentStep": 0,
    "isCompleted": false,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "completedAt": null,
    "sessionChapters": [
      { "id": "cuid_sc1", "sessionId": "cuid_session", "chapterId": "cuid_ch1" },
      { "id": "cuid_sc2", "sessionId": "cuid_session", "chapterId": "cuid_ch3" }
    ]
  }
}
```

**400 Bad Request** — field tidak lengkap

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "documentId, mode, and chapterIds are required."
  }
}
```

**400 Bad Request** — nilai `mode` tidak valid

```json
{
  "success": false,
  "error": {
    "code": "INVALID_MODE",
    "message": "mode must be QUICK, STANDARD, or DEEP."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `GET /api/sessions/user`

Mengambil semua sesi milik user yang sedang login, diurutkan dari yang terbaru.

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_session",
      "userId": "cuid_user",
      "documentId": "cuid_doc",
      "mode": "STANDARD",
      "totalQuestions": 9,
      "currentStep": 9,
      "isCompleted": true,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "completedAt": "2026-06-06T11:00:00.000Z",
      "document": {
        "id": "cuid_doc",
        "title": "Skripsi Analisis Sistem",
        "fileUrl": "https://...",
        "status": "READY"
      },
      "sessionChapters": [
        {
          "id": "cuid_sc1",
          "sessionId": "cuid_session",
          "chapterId": "cuid_ch1",
          "chapter": { "id": "cuid_ch1", "label": "I", "title": "Pendahuluan" }
        }
      ]
    }
  ]
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `GET /api/sessions/:id`

Mengambil detail satu sesi berdasarkan ID.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `id` | `string` | ID sesi |

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "cuid_session",
    "userId": "cuid_user",
    "documentId": "cuid_doc",
    "mode": "STANDARD",
    "totalQuestions": 9,
    "currentStep": 3,
    "isCompleted": false,
    "createdAt": "2026-06-06T10:00:00.000Z",
    "completedAt": null,
    "document": { "id": "cuid_doc", "title": "Skripsi Analisis Sistem" },
    "sessionChapters": [
      {
        "id": "cuid_sc1",
        "chapterId": "cuid_ch1",
        "chapter": { "id": "cuid_ch1", "label": "I", "title": "Pendahuluan" }
      }
    ]
  }
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Session ID is required."
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session with the given ID does not exist."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `PATCH /api/sessions/:id/complete`

Menandai sesi sebagai selesai. Di-trigger saat user menekan tombol "End Session".

> Catatan: minimal 3 pertanyaan harus dijawab (`currentStep >= 3`) sebelum endpoint ini dipanggil — validasi ini dilakukan di sisi frontend.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `id` | `string` | ID sesi |

**200 OK**

```json
{
  "success": true,
  "data": {
    "id": "cuid_session",
    "isCompleted": true,
    "completedAt": "2026-06-06T11:30:00.000Z"
  }
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Session ID is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## Questions

### `POST /api/questions/generate`

Memanggil RAG service untuk men-generate pertanyaan sidang berdasarkan dokumen dan bab yang dipilih.
Setelah generate selesai, `totalQuestions` di sesi akan diperbarui sesuai jumlah pertanyaan yang benar-benar dibuat.

**Request** — `Content-Type: application/json`

```json
{
  "sessionId": "cuid_session",
  "documentId": "cuid_doc",
  "chapterIds": ["cuid_ch1", "cuid_ch3"],
  "mode": "STANDARD"
}
```

> Nilai `mode`: `QUICK` | `STANDARD` | `DEEP`

**201 Created**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_q1",
      "sessionId": "cuid_session",
      "chapterId": "cuid_ch1",
      "content": "Apa yang dimaksud dengan variabel independen dalam penelitian ini?",
      "orderIndex": 1
    },
    {
      "id": "cuid_q2",
      "sessionId": "cuid_session",
      "chapterId": "cuid_ch1",
      "content": "Mengapa metode kuantitatif dipilih dibanding kualitatif?",
      "orderIndex": 2
    }
  ]
}
```

**400 Bad Request** — field tidak lengkap

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "sessionId, documentId, chapterIds, and mode are required."
  }
}
```

**500 Internal Server Error** — termasuk jika RAG service tidak mengembalikan pertanyaan

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `GET /api/questions/:sessionId`

Mengambil daftar pertanyaan dari sebuah sesi, diurutkan berdasarkan `orderIndex`.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `sessionId` | `string` | ID sesi |

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_q1",
      "sessionId": "cuid_session",
      "chapterId": "cuid_ch1",
      "content": "Apa yang dimaksud dengan variabel independen dalam penelitian ini?",
      "orderIndex": 1
    },
    {
      "id": "cuid_q2",
      "sessionId": "cuid_session",
      "chapterId": "cuid_ch1",
      "content": "Mengapa metode kuantitatif dipilih dibanding kualitatif?",
      "orderIndex": 2
    }
  ]
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Session Id is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## Messages

### `GET /api/messages/:sessionId`

Mengambil seluruh pesan dalam sebuah sesi, diurutkan dari yang paling lama (`createdAt asc`).

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `sessionId` | `string` | ID sesi |

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_msg1",
      "sessionId": "cuid_session",
      "questionId": "cuid_q1",
      "subTurn": 0,
      "role": "AI",
      "content": "Apa yang dimaksud dengan variabel independen dalam penelitian ini?",
      "createdAt": "2026-06-06T10:05:00.000Z"
    },
    {
      "id": "cuid_msg2",
      "sessionId": "cuid_session",
      "questionId": "cuid_q1",
      "subTurn": 0,
      "role": "USER",
      "content": "Variabel independen dalam penelitian ini adalah...",
      "createdAt": "2026-06-06T10:06:00.000Z"
    }
  ]
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Session ID is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `POST /api/messages`

Membuat pesan baru dalam sebuah sesi. Jika pesan adalah jawaban user (`role: USER`, `subTurn: 0`),
backend secara otomatis memanggil RAG service untuk mengevaluasi jawaban dan menyimpan skor ke `answer_scores`.
`currentStep` di sesi juga akan diinkrementasi secara otomatis.

**Request** — `Content-Type: application/json`

```json
{
  "sessionId": "cuid_session",
  "questionId": "cuid_q1",
  "subTurn": 0,
  "role": "USER",
  "content": "Variabel independen dalam penelitian ini adalah intensitas penggunaan media sosial."
}
```

> Nilai `role`: `USER` | `AI`
> Nilai `subTurn`: `0` (jawaban utama), `1` (sanggahan pertama), `2` (sanggahan kedua)

**201 Created** — jawaban USER (skor otomatis terbuat)

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "cuid_msg",
      "sessionId": "cuid_session",
      "questionId": "cuid_q1",
      "subTurn": 0,
      "role": "USER",
      "content": "Variabel independen dalam penelitian ini adalah...",
      "createdAt": "2026-06-06T10:06:00.000Z"
    },
    "evaluation": {
      "is_satisfied": true,
      "scores": {
        "methodology": 4,
        "theory": 3,
        "argument_strength": 4
      },
      "rebuttal": null
    }
  }
}
```

**201 Created** — pesan AI (tidak ada evaluasi)

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "cuid_msg",
      "sessionId": "cuid_session",
      "questionId": "cuid_q1",
      "subTurn": 0,
      "role": "AI",
      "content": "Apa yang dimaksud dengan variabel independen?",
      "createdAt": "2026-06-06T10:05:00.000Z"
    },
    "evaluation": null
  }
}
```

**400 Bad Request** — field tidak lengkap

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "sessionId, questionId, role, and content are required."
  }
}
```

**400 Bad Request** — nilai `role` tidak valid

```json
{
  "success": false,
  "error": {
    "code": "INVALID_ROLE",
    "message": "role must be USER or AI."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## Answer Scores

### `GET /api/answer-scores/:sessionId`

Mengambil semua skor jawaban dalam sebuah sesi.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `sessionId` | `string` | ID sesi |

**200 OK**

```json
{
  "success": true,
  "data": [
    {
      "id": "cuid_score1",
      "sessionId": "cuid_session",
      "questionId": "cuid_q1",
      "methodologyScore": 4,
      "theoryScore": 3,
      "argumentScore": 4,
      "isSatisfied": true,
      "rebuttal": null,
      "createdAt": "2026-06-06T10:06:30.000Z"
    },
    {
      "id": "cuid_score2",
      "sessionId": "cuid_session",
      "questionId": "cuid_q2",
      "methodologyScore": 2,
      "theoryScore": 2,
      "argumentScore": 3,
      "isSatisfied": false,
      "rebuttal": "Jawaban Anda belum membahas aspek validitas internal penelitian.",
      "createdAt": "2026-06-06T10:10:00.000Z"
    }
  ]
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Session ID is required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

### `POST /api/answer-scores`

Membuat skor jawaban baru secara manual. Pada alur normal, skor dibuat otomatis saat `POST /api/messages` dipanggil dengan `role: USER`. Endpoint ini tersedia untuk keperluan override atau pengujian.

**Request** — `Content-Type: application/json`

```json
{
  "sessionId": "cuid_session",
  "questionId": "cuid_q1",
  "methodologyScore": 4,
  "theoryScore": 3,
  "argumentScore": 4,
  "isSatisfied": true,
  "rebuttal": null
}
```

> Nilai skor: integer `1`–`5`

**201 Created**

```json
{
  "success": true,
  "data": {
    "id": "cuid_score",
    "sessionId": "cuid_session",
    "questionId": "cuid_q1",
    "methodologyScore": 4,
    "theoryScore": 3,
    "argumentScore": 4,
    "isSatisfied": true,
    "rebuttal": null,
    "createdAt": "2026-06-06T10:06:30.000Z"
  }
}
```

**400 Bad Request** — field tidak lengkap

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "sessionId, questionId, methodologyScore, theoryScore, argumentScore, and isSatisfied are required."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## Evaluation

### `GET /api/evaluation/:sessionId`

Mengambil laporan evaluasi lengkap sebuah sesi setelah selesai. Menghitung skor akhir berdasarkan formula weighted score.

**Formula skor akhir:**
```
skor_akhir = ((avg_methodology × 0.4) + (avg_theory × 0.3) + (avg_argument × 0.3)) / 5 × 100
```
Hasil dalam skala **0–100**.

**Path Parameter**

| Param | Type | Keterangan |
| ----- | ---- | ---------- |
| `sessionId` | `string` | ID sesi |

**200 OK**

```json
{
  "success": true,
  "data": {
    "session": {
      "id": "cuid_session",
      "mode": "STANDARD",
      "totalQuestions": 9,
      "currentStep": 9,
      "isCompleted": true,
      "createdAt": "2026-06-06T10:00:00.000Z",
      "completedAt": "2026-06-06T11:00:00.000Z",
      "document": {
        "id": "cuid_doc",
        "title": "Skripsi Analisis Sistem"
      }
    },
    "finalScore": 72.5,
    "breakdown": {
      "methodology": 3.8,
      "theory": 3.2,
      "argument": 3.5
    },
    "questionReviews": [
      {
        "question": "Apa yang dimaksud dengan variabel independen dalam penelitian ini?",
        "userAnswer": "Variabel independen dalam penelitian ini adalah...",
        "isSatisfied": true,
        "rebuttal": null,
        "scores": {
          "methodology": 4,
          "theory": 3,
          "argument": 4
        }
      },
      {
        "question": "Mengapa metode kuantitatif dipilih dibanding kualitatif?",
        "userAnswer": "Metode kuantitatif dipilih karena...",
        "isSatisfied": false,
        "rebuttal": "Jawaban Anda belum membahas aspek validitas internal penelitian.",
        "scores": {
          "methodology": 3,
          "theory": 2,
          "argument": 3
        }
      }
    ]
  }
}
```

**200 OK** — sesi belum memiliki jawaban (`answerScores` kosong)

```json
{
  "success": true,
  "data": {
    "session": { "..." : "..." },
    "finalScore": 0,
    "breakdown": {
      "methodology": 0,
      "theory": 0,
      "argument": 0
    },
    "questionReviews": []
  }
}
```

**400 Bad Request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_PARAM",
    "message": "Session ID is required."
  }
}
```

**404 Not Found**

```json
{
  "success": false,
  "error": {
    "code": "SESSION_NOT_FOUND",
    "message": "Session with the given ID does not exist."
  }
}
```

**500 Internal Server Error**

```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "An unexpected error occurred."
  }
}
```

---

## Error Codes Reference

| Code | HTTP Status | Keterangan |
| ---- | ----------- | ---------- |
| `MISSING_FIELDS` | 400 | Field wajib tidak ada di request body |
| `MISSING_PARAM` | 400 | Path parameter tidak ada |
| `INVALID_FILE_TYPE` | 400 | File bukan PDF |
| `INVALID_MODE` | 400 | Nilai `mode` tidak valid |
| `INVALID_ROLE` | 400 | Nilai `role` tidak valid |
| `DOCUMENT_NOT_FOUND` | 404 | Dokumen tidak ditemukan |
| `SESSION_NOT_FOUND` | 404 | Sesi tidak ditemukan |
| `INTERNAL_SERVER_ERROR` | 500 | Error tidak terduga di server |
