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
| LLM           | Anthropic `claude-haiku-4-5`                          |
| Embedding     | OpenAI `text-embedding-3-small` (dimensi 1536)        |
| Vector Search | pgvector (query langsung, tanpa LangChain/LlamaIndex) |
| Database      | Supabase (PostgreSQL + pgvector)                      |

Dua SDK dipakai sekaligus: OpenAI SDK khusus untuk embedding, Anthropic SDK khusus untuk LLM.

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

Model: `text-embedding-3-small` dari OpenAI, dimensi **1536**.

Field `embedding` di tabel `document_chunks` didefinisikan sebagai `vector(1536)`.

```python
# core/embeddings.py
from openai import OpenAI

client = OpenAI()

def generate_embedding(text: str) -> list[float]:
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small"
    )
    return response.data[0].embedding
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

Model: `claude-haiku-4-5` dari Anthropic.

```python
# core/llm.py
import anthropic

client = anthropic.Anthropic()

def call_llm(system: str, user: str) -> str:
    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        messages=[{"role": "user", "content": user}],
        system=system,
    )
    return message.content[0].text
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
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=
```
