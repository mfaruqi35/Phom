from pydantic import BaseModel
from typing import List

class ParseTocRequest(BaseModel):
    document_id: str
    file_url: str

class ChapterResult(BaseModel):
    label: str
    title: str
    page_start: int
    page_end: int
    order_index: int

class ParseTocResponse(BaseModel):
    chapters: List[ChapterResult]