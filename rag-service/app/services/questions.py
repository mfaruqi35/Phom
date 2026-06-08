from app.core.llm import call_llm
from app.core.embeddings import generate_embedding
from app.core.database import get_connection
from typing import List
import json

MODE_QUESTION_COUNT = {
    "QUICK": 4,
    "STANDARD": 9,
    "DEEP": 13,
}

def get_relevant_chunks(document_id: str, chapter_ids: List[str], query: str, top_k: int = 5) -> List[str]:
    embedding = generate_embedding(query)
    embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

    conn = get_connection()
    cursor = conn.cursor()

    try:
        placeholders = ",".join(["%s"] * len(chapter_ids))
        cursor.execute(
            f"""
            SELECT content
            FROM document_chunks
            WHERE "documentId" = %s
              AND "chapterId" = ANY(ARRAY[{placeholders}]::text[])
            ORDER BY embedding <=> %s::vector
            LIMIT %s
            """,
            [document_id] + chapter_ids + [embedding_str, top_k]
        )
        rows = cursor.fetchall()
        return [row["content"] for row in rows]
    finally:
        cursor.close()
        conn.close()

def generate_questions(document_id: str, chapter_ids: List[str], mode: str) -> List[str]:
    target_count = MODE_QUESTION_COUNT.get(mode, 9)

    chunks = get_relevant_chunks(
        document_id=document_id,
        chapter_ids=chapter_ids,
        query="metodologi penelitian teori analisis data kesimpulan",
        top_k=3
    )

    print(f"Chunks found: {len(chunks)}")

    if not chunks:
        return []

    context = "\n\n".join(chunks)
    print(f"Context length: {len(context)}")

    system = f"""Kamu adalah penguji sidang skripsi yang berpengalaman. 
Tugasmu adalah membuat {target_count} pertanyaan sidang skripsi berdasarkan isi dokumen yang diberikan.
Pertanyaan harus bervariasi dari yang sederhana hingga kompleks.
Pertanyaan harus spesifik terhadap isi dokumen, bukan pertanyaan umum.

Respond ONLY with a JSON object in this exact format, nothing else:
{{"questions": ["pertanyaan 1", "pertanyaan 2", ...]}}"""

    user = f"Berdasarkan isi skripsi berikut, buat {target_count} pertanyaan sidang:\n\n{context}"

    response = call_llm(system, user, max_tokens=2048)

    try:
        clean = response.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()
        result = json.loads(clean)
        return result.get("questions", [])
    except json.JSONDecodeError:
        lines = [l.strip() for l in response.split("\n") if l.strip() and l.strip()[0].isdigit()]
        return lines[:target_count]