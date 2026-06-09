from pydantic import BaseModel
from typing import List

class GenerateQuestionsRequest(BaseModel):
    session_id: str
    document_id: str
    chapter_ids: List[str]
    mode: str

class GenerateQuestionsResponse(BaseModel):
    questions: List[str]