from fastapi import APIRouter, HTTPException
from app.schemas.questions import GenerateQuestionsRequest, GenerateQuestionsResponse
from app.services.questions import generate_questions

router = APIRouter()

@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
def generate(request: GenerateQuestionsRequest):
    try:
        questions = generate_questions(
            document_id=request.document_id,
            chapter_ids=request.chapter_ids,
            mode=request.mode,
        )
        return GenerateQuestionsResponse(questions=questions)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))