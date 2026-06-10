# Phom RAG Service (FastAPI) — API Documentation

**Phom RAG Service** adalah service backend AI berbasis Python dan FastAPI yang bertugas menangani seluruh alur kerja RAG (*Retrieval-Augmented Generation*). Service ini memproses berkas PDF skripsi, mengekstrak struktur bab, melakukan *chunking* dan pembuatan *embedding* secara lokal, melakukan pencarian semantik pada database PostgreSQL (`pgvector`), serta berinteraksi dengan LLM untuk menghasilkan pertanyaan sidang skripsi dan mengevaluasi jawaban pengguna secara objektif.

---

## 🚀 Tautan Publik (Deployment)

Berikut adalah tautan endpoint RAG Service:
*   **Base URL (Local)**: `http://localhost:8000` atau `http://127.0.0.1:8000`
*   **Base URL (Production)**: `https://phom-rag.onrender.com`

---

## 💻 Tech Stack

*   **Framework**: FastAPI (Python 3.10+) — sangat cepat, asinkron, dan otomatis menghasilkan dokumentasi interaktif.
*   **Library NLP & Embeddings**: `sentence-transformers` dengan model lokal `all-MiniLM-L6-v2` (menghasilkan vektor 384 dimensi secara efisien tanpa API eksternal).
*   **LLM Provider**: Groq SDK menggunakan model **Llama-3.1-8b-instant** untuk kompilasi pertanyaan dan evaluasi respon user secara realtime.
*   **PDF Parser**: `PyPDF2` — mengekstrak teks mentah dari halaman dokumen PDF.
*   **Database Client**: `psycopg2` — mengeksekusi kueri langsung dan operasi pencarian kemiripan vektor (*cosine similarity search*) pada Supabase PostgreSQL.
*   **HTTP Client**: `httpx` — mengunduh dokumen secara asinkron dari URL penyimpanan Supabase Storage.

---

## 🛠️ Instalasi & Menjalankan Lokal

1.  **Masuk ke direktori RAG Service**:
    ```sh
    cd rag-service
    ```

2.  **Buat & aktifkan virtual environment (opsional)**:
    ```sh
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Instal dependensi**:
    ```sh
    pip install -r requirements.txt
    ```

4.  **Konfigurasi Environment**:
    Buat file `.env` di dalam root direktori `rag-service/` dan isi variabel berikut:
    ```env
    GROQ_API_KEY=gsk_your_groq_api_key
    DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/postgres
    ```

5.  **Jalankan server lokal**:
    ```sh
    uvicorn app.main:app --reload --port 8000
    ```

---

## 📌 Endpoint API Reference

Semua data dikirimkan dalam format JSON (kecuali dinyatakan lain).

### 1. Health Check
Mengecek status kesehatan server RAG.

*   **Method & Path**: `GET /health`
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "status": "ok"
        }
        ```

---

### 2. Validasi Dokumen Akademis
Memvalidasi teks mentah dari halaman awal dokumen skripsi untuk mengonfirmasi apakah dokumen tersebut bersifat akademis (skripsi/tesis).

*   **Method & Path**: `POST /validate`
*   **Request Body (`application/json`)**:
    ```json
    {
      "text": "ANALISIS SISTEM INFORMASI AKUNTANSI PADA PENGELOLAAN DANA DESA... (sampel teks halaman awal)"
    }
    ```
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "is_academic": true
        }
        ```
    *   **422 Unprocessable Entity** (Validation Error - data body tidak lengkap):
        ```json
        {
          "detail": [
            {
              "loc": ["body", "text"],
              "msg": "field required",
              "type": "value_error.missing"
            }
          ]
        }
        ```

---

### 3. Parsing Daftar Isi (TOC)
Mengunduh dokumen PDF dan mengekstrak struktur bab akademis (label bab, judul bab, halaman mulai, dan halaman selesai) secara otomatis menggunakan LLM.

*   **Method & Path**: `POST /parse-toc`
*   **Request Body (`application/json`)**:
    ```json
    {
      "document_id": "cuid_document_123",
      "file_url": "https://supabase.co/storage/v1/object/public/documents/document.pdf"
    }
    ```
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "chapters": [
            {
              "label": "BAB I",
              "title": "Pendahuluan",
              "page_start": 1,
              "page_end": 15,
              "order_index": 1
            },
            {
              "label": "BAB II",
              "title": "Tinjauan Pustaka",
              "page_start": 16,
              "page_end": 38,
              "order_index": 2
            }
          ]
        }
        ```
    *   **500 Internal Server Error** (Gagal mengunduh berkas atau terjadi kesalahan parser):
        ```json
        {
          "detail": "Failed to download PDF or parser failed."
        }
        ```

---

### 4. Pemrosesan Chunks & Embeddings Dokumen
Mengunduh berkas PDF, memotong (*chunking*) teks mentah per bab dengan ukuran kata tertentu, menghasilkan vektor *embedding* 384 dimensi menggunakan model lokal, dan menyimpannya secara massal ke database PostgreSQL (`document_chunks`).

*   **Method & Path**: `POST /process`
*   **Request Body (`application/json`)**:
    ```json
    {
      "document_id": "cuid_document_123",
      "file_url": "https://supabase.co/storage/v1/object/public/documents/document.pdf",
      "chapters": [
        {
          "id": "cuid_chapter_1",
          "page_start": 1,
          "page_end": 15
        },
        {
          "id": "cuid_chapter_2",
          "page_start": 16,
          "page_end": 38
        }
      ]
    }
    ```
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "success": true,
          "chunk_count": 42
        }
        ```
    *   **500 Internal Server Error** (Error koneksi database atau komputasi vektor):
        ```json
        {
          "detail": "Database connection refused."
        }
        ```

---

### 5. Pembangkitan Pertanyaan Sidang
Menghasilkan daftar pertanyaan sidang kritis secara otomatis berdasarkan pencarian semantik potongan bab skripsi yang terpilih.

*   **Method & Path**: `POST /generate-questions`
*   **Request Body (`application/json`)**:
    ```json
    {
      "session_id": "cuid_session_123",
      "document_id": "cuid_document_123",
      "chapter_ids": ["cuid_chapter_1", "cuid_chapter_2"],
      "mode": "STANDARD"
    }
    ```
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "questions": [
            "Apa kontribusi teoritis utama dari penelitian Anda dibanding literatur sebelumnya?",
            "Bagaimana Anda meminimalkan bias sampel pada metodologi yang Anda gunakan?",
            "Jelaskan justifikasi akademis pemilihan variabel independen X!"
          ]
        }
        ```
    *   **500 Internal Server Error** (Groq API rate limit atau kueri database gagal):
        ```json
        {
          "detail": "Groq API error: Rate limit exceeded."
        }
        ```

---

### 6. Evaluasi Jawaban Sidang
Mengevaluasi jawaban mahasiswa terhadap pertanyaan penguji AI secara ketat berdasarkan pencarian semantik dari dokumen bab terkait.

*   **Method & Path**: `POST /evaluate`
*   **Request Body (`application/json`)**:
    ```json
    {
      "question": "Mengapa metode kuantitatif dipilih dibanding kualitatif?",
      "answer": "Karena kuantitatif menggunakan data angka dan statistik.",
      "document_id": "cuid_document_123",
      "chapter_ids": ["cuid_chapter_1", "cuid_chapter_3"]
    }
    ```
*   **Responses**:
    *   **200 OK**:
        ```json
        {
          "is_satisfied": false,
          "scores": {
            "methodology": 2,
            "theory": 2,
            "argument_strength": 1
          },
          "rebuttal": "Jawaban Anda terlalu umum. Mohon jelaskan secara terperinci apa landasan filosofis epistemologis Anda memilih kuantitatif untuk menjawab hipotesis rumusan masalah pertama!",
          "feedback": "Jawaban mahasiswa masih sangat dangkal dan tidak menyentuh argumentasi akademis. Mahasiswa perlu menjelaskan alasan spesifik seperti replikabilitas data dan pengujian kausalitas hipotesis."
        }
        ```
    *   **500 Internal Server Error**:
        ```json
        {
          "detail": "LLM failed to generate structured evaluation response."
        }
        ```
