import httpx
import io
import os
from PyPDF2 import PdfReader
from app.core.embeddings import generate_embedding
from app.core.database import get_connection
from typing import List
from app.schemas.process import ChapterInput

def extract_text_from_pdf_bytes(pdf_bytes: bytes, page_start: int, page_end: int) -> str:
    reader = PdfReader(io.BytesIO(pdf_bytes))
    total_pages = len(reader.pages)

    start = max(0, page_start - 1)
    end = min(total_pages, page_end)

    text = ""
    for i in range (start, end):
        text += reader.pages[i].extract_text() or ""

    return text.strip()

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    words = text.split()
    chunks = []
    i = 0
    
    while i < len(words):
        chunk = " ".join(words[i:i + chunk_size])
        chunks.append(chunk)
        i += chunk_size - overlap
    
    return [c for c in chunks if c.strip()]

def process_document(document_id: str, file_url: str, chapters: List[ChapterInput]) -> int:
    with httpx.Client() as client:
        response = client.get(file_url)
        response.raise_for_status()
        pdf_bytes = response.content

    chunk_count = 0
    conn = get_connection()
    cursor = conn.cursor()

    try:
        cursor.execute(
            'DELETE FROM document_chunks WHERE "documentId" = %s',
            (document_id,)
        )

        for chapter in chapters:
            text = extract_text_from_pdf_bytes(pdf_bytes, chapter.page_start, chapter.page_end)

            if not text:
                continue

            chunks = chunk_text(text)

            for chunk in chunks:
                embedding = generate_embedding(chunk)
                embedding_str = "[" + ",".join(str(x) for x in embedding) + "]"

                cursor.execute(
                """
                INSERT INTO document_chunks (id, "documentId", "chapterId", content, embedding, "createdAt")
                VALUES (gen_random_uuid(), %s, %s, %s, %s::vector, NOW())
                """,
                (document_id, chapter.id, chunk, embedding_str)
            )
                chunk_count += 1

        cursor.execute(
            'UPDATE documents SET status = \'READY\', "totalPages" = %s WHERE id = %s',
            (len(PdfReader(io.BytesIO(pdf_bytes)).pages), document_id)
        )

        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

    return chunk_count