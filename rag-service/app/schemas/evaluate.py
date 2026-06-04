from pydantic import BaseModel

class EvaluateRequest(BaseModel):
    question: str
    answer: str
    document_id: str
    chapter_ids: list[str]

class EvaluateScores(BaseModel):
    methodology: int
    theory: int
    argument_strength: int

class EvaluateResponse(BaseModel):
    is_satisfied: bool
    scores: EvaluateScores
    rebuttal: str | None