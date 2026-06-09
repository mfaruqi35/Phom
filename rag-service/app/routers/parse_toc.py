from fastapi import APIRouter, HTTPException
from app.schemas.parse_toc import ParseTocRequest, ParseTocResponse
from app.services.parse_toc import parse_toc

router = APIRouter()

@router.post("/parse-toc", response_model=ParseTocResponse)
def parse_toc_endpoint(request: ParseTocRequest):
    try:
        chapters = parse_toc(file_url=request.file_url)
        return ParseTocResponse(chapters=chapters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))