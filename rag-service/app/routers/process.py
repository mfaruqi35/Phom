from fastapi import APIRouter, HTTPException
from app.schemas.process import ProcessRequest, ProcessResponse
from app.services.process import process_document

router = APIRouter()

@router.post("/process", response_model = ProcessResponse)
def process(request: ProcessRequest):
    try:
        chunk_count = process_document(
            document_id=request.document_id,
            file_url=request.file_url,
            chapters=request.chapters
        )
        return ProcessResponse(success=True,chunk_count=chunk_count)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))