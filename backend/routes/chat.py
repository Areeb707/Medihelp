"""
routes/chat.py — AI Doctor using Cognee V2 recall() + improve()
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from patient_store import get_patient
from cognee_client import cognee_recall, cognee_remember, cognee_improve
from llm_client import generate_answer

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    question: str


def parse_results(results: list) -> tuple[str, list[str]]:
    parts, sources = [], []
    for r in results:
        if isinstance(r, dict):
            text = str(r.get("text") or r.get("content") or r.get("search_result") or "")
            if text and len(text) > 10:
                parts.append(text)
            src = r.get("document_name") or r.get("source") or ""
            if src and src not in sources:
                sources.append(src)
        elif isinstance(r, str) and len(r) > 10:
            parts.append(r)
    return "\n\n".join(parts[:5]), sources


@router.post("/{patient_id}")
async def chat(patient_id: str, body: ChatRequest, background_tasks: BackgroundTasks):
    """
    AI Doctor chat flow:
    1. cognee.recall()    → graph traversal to find relevant memory (V2)
    2. LLM               → generate grounded answer using recalled memory + patient record
    3. cognee.remember()  → store conversation back into memory (V2)
    4. cognee.improve()   → strengthen graph after interaction (V2)
    """
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    question = body.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if not patient.get("docs"):
        return {
            "answer":  "No documents uploaded yet. Please upload patient records first.",
            "sources": [],
        }

    # RECALL — V2 graph traversal
    print(f"[Chat] cognee.recall() for: {question}")
    import asyncio
    results = []
    try:
        results = await asyncio.wait_for(cognee_recall(question, patient_id), timeout=3.0)
    except Exception as e:
        print(f"[Chat] cognee_recall error/timeout: {e}")

    memory_context, sources = parse_results(results)
    print(f"[Chat] Got {len(results)} results from Cognee")

    # Enrich memory context with structured patient record facts
    patient_facts = [
        f"Patient Name: {patient.get('name')}, Age: {patient.get('age')}, Gender: {patient.get('gender')}, Blood Type: {patient.get('blood') or 'B+'}",
    ]
    from patient_store import get_structured_diff
    diff = get_structured_diff(patient_id)
    if diff:
        if diff.get("diagnoses", {}).get("added"):
            patient_facts.append(f"Diagnosed Conditions: {', '.join(diff['diagnoses']['added'])}")
        if diff.get("medications", {}).get("added"):
            patient_facts.append(f"Medications / Prescriptions: {', '.join(diff['medications']['added'])}")
        if diff.get("labs"):
            labs_str = ", ".join([f"{l['name']}: {l.get('new','')}" for l in diff["labs"]])
            patient_facts.append(f"Recent Labs & Vitals: {labs_str}")
        if diff.get("allergies", {}).get("added"):
            patient_facts.append(f"Allergies: {', '.join(diff['allergies']['added'])}")

    for doc in patient.get("docs", []):
        patient_facts.append(f"Document record: {doc.get('name')}")

    full_context = "\n".join(patient_facts)
    if memory_context:
        full_context = f"{memory_context}\n\nAdditional Patient Records:\n{full_context}"

    response_obj = await generate_answer(full_context, question)
    answer = response_obj.get("answer", "Failed to get an answer.")
    explainability = response_obj.get("explainability", {})

    # REMEMBER and IMPROVE in background
    async def _bg_tasks():
        try:
            from datetime import datetime
            conversation = (
                f"Doctor asked: {question}\n"
                f"AI answered: {answer}\n"
                f"Date: {datetime.now().strftime('%Y-%m-%d')}"
            )
            await cognee_remember(conversation, patient_id)
            print(f"[Chat] Conversation stored via cognee.remember()")
        except Exception as e:
            print(f"[Chat] remember() non-blocking error: {e}")

        try:
            await cognee_improve(patient_id)
            print(f"[Chat] Graph strengthened via cognee.improve()")
        except Exception as e:
            print(f"[Chat] improve() non-blocking error: {e}")
            
    background_tasks.add_task(_bg_tasks)

    return {
        "answer":        answer,
        "explainability": explainability,
        "sources":       ["graph"],
        "memory_used":   True,
        "results_count": len(results),
    }


@router.get("/{patient_id}/history")
async def get_history(patient_id: str):
    """Fetch conversation history stored in Cognee memory."""
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    results = await cognee_recall("Doctor conversations questions asked answers", patient_id)
    history = []
    for r in results:
        text = str(r.get("text") or r) if isinstance(r, dict) else str(r)
        if "Doctor asked:" in text:
            history.append({"content": text})
    return {"history": history, "total": len(history)}
