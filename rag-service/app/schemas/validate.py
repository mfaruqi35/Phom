from pydantic import BaseModel

class ValidateRequest(BaseModel):
    text: str

class ValidateResponse(BaseModel):
    is_academic: bool