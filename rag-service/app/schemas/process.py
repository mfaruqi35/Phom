from pydantic import BaseModel
from typing import List

class ChapterInput(BaseModel):
    id: str
    page_start: int
    page_end: int

class ProcessRequest(BaseModel):
    document_id: str
    file_url: str
    chapters: List[ChapterInput]

class ProcessResponse(BaseModel):
    success: bool
    chunk_count: int