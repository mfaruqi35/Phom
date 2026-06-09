import httpx
import io
import json
from PyPDF2 import PdfReader
from app.core.llm import call_llm
from app.services.validate import validate_document

def parse_toc(file_url: str) -> list:
    with httpx.Client() as client:
        response = client.get(file_url)
        response.raise_for_status()
        pdf_bytes = response.content

    reader = PdfReader(io.BytesIO(pdf_bytes))
    total_pages = len(reader.pages)

    # Extract teks dari 10 halaman pertama untuk cari Daftar Isi
    sample_text = ""
    for i in range(min(10, total_pages)):
        sample_text += reader.pages[i].extract_text() or ""

    # Validasi konten apakah akademis (skripsi/tesis)
    if not validate_document(sample_text):
        print(f"Validation failed: Document from {file_url} is not academic.")
        return []

    system = """Kamu adalah parser dokumen akademik. Tugasmu adalah mengekstrak struktur bab dari dokumen skripsi.

Cari "Daftar Isi" atau "Table of Contents" dalam teks yang diberikan dan ekstrak informasi bab.

Respond ONLY with a JSON object in this exact format, nothing else:
{
  "chapters": [
    {
      "label": "BAB I",
      "title": "Pendahuluan",
      "page_start": 1,
      "page_end": 15,
      "order_index": 1
    }
  ]
}

Jika tidak ada Daftar Isi yang terdeteksi, return chapters kosong:
{"chapters": []}

Catatan:
- label adalah "BAB I", "BAB II", dst
- title adalah judul bab
- page_start dan page_end adalah nomor halaman (integer)
- order_index dimulai dari 1
- Perkirakan page_end berdasarkan page_start bab berikutnya minus 1
- page_end bab terakhir adalah total halaman dokumen"""

    user = f"Total halaman dokumen: {total_pages}\n\nTeks dokumen:\n{sample_text[:3000]}"

    response = call_llm(system, user, max_tokens=1024)

    try:
        clean = response.strip()
        if "```json" in clean:
            clean = clean.split("```json")[1].split("```")[0].strip()
        elif "```" in clean:
            clean = clean.split("```")[1].split("```")[0].strip()
        result = json.loads(clean)
        chapters = result.get("chapters", [])

        # Pastikan page_end tidak melebihi total halaman
        for ch in chapters:
            ch["page_end"] = min(ch["page_end"], total_pages)

        return chapters
    except json.JSONDecodeError:
        return []