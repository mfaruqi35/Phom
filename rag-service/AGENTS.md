# Phom — RAG Service Agent Context

## Overview

AI/RAG service untuk Phom. Menangani document processing, embedding, question generation, dan answer evaluation.

Service ini tidak exposed ke publik. Hanya dipanggil oleh backend Hono.

Untuk context global project (arsitektur, database schema, alur komunikasi antar service), baca `AGENTS.md` di root.

---

## Tech Stack

| Layer         | Teknologi                                             |
| ------------- | ----------------------------------------------------- |
| Framework     | FastAPI                                               |
| LLM           | Groq `llama-3.1-8b-instant` (via Groq SDK)            |
| Embedding     | `sentence-transformers` `all-MiniLM-L6-v2` (lokal)   |
| Vector Search | pgvector (query langsung, tanpa LangChain/LlamaIndex) |
| Database      | Supabase (PostgreSQL + pgvector)                      |

Embedding berjalan secara lokal tanpa API eksternal menggunakan `sentence-transformers`. LLM dipanggil melalui Groq SDK yang mengarah ke model Llama 3.1.

---

## Struktur Folder

```

rag-service/
└── app/
├── routers/ # FastAPI route definitions per domain
├── services/ # Business logic, memanggil LLM dan pgvector
├── schemas/ # Pydantic models untuk request dan response
├── core/
│ ├── database.py # Koneksi PostgreSQL + pgvector
│ ├── embeddings.py # OpenAI embedding client
│ └── llm.py # Anthropic LLM client
└── main.py # Entry point

```

---

## Konvensi

- Semua nama variabel, fungsi, dan komentar dalam kode menggunakan **English**
- File dan folder menggunakan **snake_case** (konvensi Python)
- Variabel dan fungsi menggunakan **snake_case**
- Konstanta menggunakan **UPPER_SNAKE_CASE**
- Class menggunakan **PascalCase**
- Satu file router per domain (e.g. `documents.py`, `questions.py`)
- Router hanya menangani request/response, logic ada di service
- Service hanya menangani business logic

---

## Endpoints

Semua endpoint hanya bisa dipanggil dari backend Hono.

| Method | Endpoint              | Keterangan                               |
| ------ | --------------------- | ---------------------------------------- |
| `POST` | `/validate`           | Validasi apakah dokumen akademik         |
| `POST` | `/process`            | Parsing Daftar Isi dan embedding dokumen |
| `POST` | `/generate-questions` | Generate semua pertanyaan untuk sesi     |
| `POST` | `/evaluate`           | Evaluasi jawaban user per pertanyaan     |

---

## Alur Per Endpoint

**`POST /validate`**

1. Terima 1000-2000 karakter pertama dokumen
2. Kirim ke `claude-haiku-4-5` untuk klasifikasi
3. Return `{ "is_academic": true/false }`

**`POST /process`**

1. Terima `document_id`, `file_url`, dan list chapter (label, page_start, page_end)
2. Download PDF dari Supabase Storage via `file_url`
3. Extract teks per chapter berdasarkan page range
4. Chunk teks per chapter
5. Generate embedding tiap chunk via `text-embedding-3-small`
6. Simpan chunk + embedding ke tabel `document_chunks`
7. Return `{ "success": true, "chunk_count": N }`

**`POST /generate-questions`**

1. Terima `session_id`, `document_id`, list `chapter_id` yang dipilih, dan `mode`
2. Query `document_chunks` berdasarkan `chapter_id` yang dipilih
3. Susun context dari chunks
4. Kirim ke `claude-haiku-4-5` untuk generate pertanyaan sesuai jumlah target mode
5. Return list pertanyaan dalam JSON
6. Backend yang menyimpan pertanyaan ke tabel `questions`

**`POST /evaluate`**

1. Terima `question`, `answer`, dan `context` (chunks relevan)
2. Kirim ke `claude-haiku-4-5` untuk evaluasi
3. Return structured JSON:

```json
{
  "is_satisfied": false,
  "scores": {
    "methodology": 3,
    "theory": 2,
    "argument_strength": 2
  },
  "rebuttal": "Anda belum menjelaskan alasan pemilihan metode regresi logistik dibanding metode lain."
}
```

---

## Embedding

Model: `all-MiniLM-L6-v2` dari `sentence-transformers`, berjalan **secara lokal** tanpa API eksternal.

Dimensi output: **384**. Field `embedding` di tabel `document_chunks` harus didefinisikan sebagai `vector(384)`.

```python
# core/embeddings.py
from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")

def generate_embedding(text: str) -> list[float]:
    embedding = model.encode(text)
    return embedding.tolist()
```

---

## Vector Search

Similarity search menggunakan pgvector cosine distance, query langsung tanpa LangChain atau LlamaIndex.

```python
SELECT content, chapter_id
FROM document_chunks
WHERE document_id = :document_id
  AND chapter_id = ANY(:chapter_ids)
ORDER BY embedding <=> :query_embedding
LIMIT :top_k;
```

`top_k` default 5 per chapter yang dipilih.

---

## LLM

Model: `llama-3.1-8b-instant` diakses via **Groq SDK** (bukan Anthropic SDK).

```python
# core/llm.py
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def call_llm(system: str, user: str, max_tokens: int = 1024) -> str:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    return response.choices[0].message.content
```

Untuk endpoint yang butuh structured JSON output (evaluate, generate-questions), prompt LLM untuk return JSON saja tanpa preamble, lalu parse dengan `json.loads()`.

---

## Error Handling

Gunakan FastAPI exception handler di `main.py`. Semua error return format konsisten:

```json
{
  "success": false,
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Failed to extract text from PDF."
  }
}
```

---

## Environment Variables

```
GROQ_API_KEY=
DATABASE_URL=
```

Embedding tidak membutuhkan API key karena model `all-MiniLM-L6-v2` berjalan secara lokal.
