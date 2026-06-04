from app.core.llm import call_llm
from app.services.questions import get_relevant_chunks
from typing import List
import json

def evaluate_answer(question: str, answer: str, document_id: str, chapter_ids: List[str]) -> dict:
    chunks = get_relevant_chunks(
        document_id=document_id,
        chapter_ids=chapter_ids,
        query=question,
        top_k=3
    )

    context = "\n\n".join(chunks)

    system = """Kamu adalah penguji sidang skripsi yang mengevaluasi jawaban mahasiswa.
Berikan evaluasi berdasarkan konteks dokumen skripsi yang diberikan.

Skor menggunakan skala 1-5:
- 1: Sangat kurang
- 2: Kurang
- 3: Cukup
- 4: Baik
- 5: Sangat baik

Respond ONLY with a JSON object in this exact format, nothing else:
{
  "is_satisfied": true/false,
  "scores": {
    "methodology": 1-5,
    "theory": 1-5,
    "argument_strength": 1-5
  },
  "rebuttal": "sanggahan jika is_satisfied false, null jika true"
}

is_satisfied adalah true jika rata-rata skor >= 3."""

    user = f"""Konteks dari skripsi:
{context}

Pertanyaan: {question}

Jawaban mahasiswa: {answer}

Evaluasi jawaban tersebut."""

    response = call_llm(system, user, max_tokens=1024)

    try:
        clean = response.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()
        return json.loads(clean)
    except json.JSONDecodeError:
        return {
            "is_satisfied": False,
            "scores": {
                "methodology": 1,
                "theory": 1,
                "argument_strength": 1
            },
            "rebuttal": "Gagal mengevaluasi jawaban, coba lagi."
        }