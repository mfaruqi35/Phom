from fastapi import APIRouter, HTTPException
from app.schemas.evaluate import EvaluateRequest, EvaluateResponse, EvaluateScores
from app.services.evaluate import evaluate_answer

router = APIRouter()

@router.post("/evaluate", response_model=EvaluateResponse)
def evaluate(request: EvaluateRequest):
    try:
        result = evaluate_answer(
            question=request.question,
            answer=request.answer,
            document_id=request.document_id,
            chapter_ids=request.chapter_ids,
        )

        return EvaluateResponse(
            is_satisfied=result["is_satisfied"],
            scores=EvaluateScores(
                methodology=result["scores"]["methodology"],
                theory=result["scores"]["theory"],
                argument_strength=result["scores"]["argument_strength"],
            ),
            rebuttal=result.get("rebuttal"),
            feedback=result.get("feedback"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))