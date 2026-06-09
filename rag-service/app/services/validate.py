from app.core.llm import call_llm
import json

def validate_document(text: str) -> bool:
    system = """You are a document classifier. Your job is to determine whether a given text is from an academic thesis or research paper (skripsi, tesis, disertasi, or similar academic work).

Respond ONLY with a JSON object in this exact format, nothing else:
{"is_academic": true}
or
{"is_academic": false}

A document is academic if it contains elements like: abstract, research methodology, literature review, data analysis, conclusions, citations, or formal academic structure."""

    user = f"Classify this document excerpt:\n\n{text[:2000]}"

    response = call_llm(system, user)

    try:
        result = json.loads(response.strip())
        return result.get("is_academic", False)
    except json.JSONDecodeError:
        if "true" in response.lower():
            return True
        return False