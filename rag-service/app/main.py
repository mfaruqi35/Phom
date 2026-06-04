from fastapi import FastAPI
from dotenv import load_dotenv
from app.routers import validate, process, questions

load_dotenv()

app = FastAPI(title="Phom RAG Service")

app.include_router(validate.router)
app.include_router(process.router)
app.include_router(questions.router)

@app.get("/health")
def health_check():
    return {"status": "ok"}