from fastapi import APIRouter
from app.schemas.validate import ValidateRequest, ValidateResponse
from app.services.validate import validate_document

router = APIRouter()

@router.post("/validate", response_model=ValidateResponse)
def validate(request: ValidateRequest):
    is_academic = validate_document(request.text)
    return ValidateResponse(is_academic=is_academic)