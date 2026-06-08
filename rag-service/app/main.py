from fastapi import FastAPI
from dotenv import load_dotenv
from app.routers import validate, process, questions, evaluate, parse_toc

load_dotenv()

app = FastAPI(title="Phom RAG Service")

app.include_router(validate.router)
app.include_router(process.router)
app.include_router(questions.router)
app.include_router(evaluate.router)
app.include_router(parse_toc.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}