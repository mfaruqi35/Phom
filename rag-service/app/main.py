from fastapi import FastAPI
from dotenv import load_dotenv
from app.routers import validate

load_dotenv()

app = FastAPI(title="Phom RAG Service")

app.include_router(validate.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}