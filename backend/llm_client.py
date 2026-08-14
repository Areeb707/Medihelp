"""
llm_client.py — LLM provider support with robust JSON parsing for briefs
"""
import os, json, re
from dotenv import load_dotenv
load_dotenv()


def get_config() -> dict:
    return {
        "key":      os.getenv("LLM_API_KEY",   ""),
        "model":    os.getenv("LLM_MODEL",      "llama-3.1-8b-instant"),
        "provider": os.getenv("LLM_PROVIDER",   "groq"),
        "base_url": os.getenv("LLM_BASE_URL",   ""),
    }


EXPLAINABILITY_INSTRUCTION = """
Every response MUST include a shared Clinical Evidence & Explainability Framework in the JSON output, exactly following this schema:
"explainability": {
  "clinical_significance": "Short explanation of why the finding matters. Never prescribe treatment.",
  "evidence_strength": "Strong" | "Moderate" | "Limited",
  "evidence_reason": "Explanation of strength based on measurable factors like document count, entities, timeline.",
  "clinical_reasoning": "Step-by-step reasoning used to reach conclusion.",
  "source_documents": ["DocName.pdf (Page X)"],
  "knowledge_graph_entities": ["Entity1"],
  "timeline_events": ["Event1"],
  "retrieval_summary": "e.g., Retrieved 3 Lab Reports, 2 Prescriptions, 14 Knowledge Graph Entities.",
  "unsupported_evidence": false,
  "contradictions": [
    {"conflict": "Description of conflict", "documents": ["Doc1.pdf", "Doc2.pdf"], "recommendation": "Manual clinical verification recommended."}
  ]
}
If insufficient evidence: set "unsupported_evidence": true and do not fabricate.
"""

DOCTOR_SYSTEM = """You are Medhelp AI — an enterprise-grade Clinical Decision Support System and AI Doctor.
Ground every answer in the provided patient memory and medical history.
Provide comprehensive, structured, and clinically accurate responses.
Format lists clearly with bullet points (- item).
Use clean paragraphs with double newlines between sections.
Never fabricate data outside of the provided patient record. Return valid JSON only."""

BRIEF_SYSTEM = """You are Medhelp AI. Generate a pre-visit clinical brief as valid JSON only.
CRITICAL: Return ONLY raw JSON. No markdown. No text before or after."""

STRUCTURED_DIFF_SYSTEM = """You are Medhelp AI. Your task is Stage 1: Difference Detection.
Compare the provided previous medical memory with the updated memory.
Detect ONLY structured differences. Do NOT generate natural language explanations.
Return strictly JSON."""

EVOLUTION_SYSTEM = """You are Medhelp AI - Longitudinal Patient Intelligence module.
Your task is Stage 2: Clinical Explanation.
Use the provided structured differences (JSON) to generate a concise summary of the patient's health evolution.
Determine the Health Trajectory (Improving, Stable, Needs Attention, Declining) and explain WHY.
Everything must be grounded in the detected differences. Never hallucinate. Return valid JSON only."""

def _parse_json_safely(raw: str, default: dict) -> dict:
    import json, re
    if not raw:
        return default
    try:
        return json.loads(raw.strip())
    except:
        pass
    cleaned = re.sub(r'```json\s*', '', raw)
    cleaned = re.sub(r'```\s*', '', cleaned).strip()
    try:
        return json.loads(cleaned)
    except:
        pass
    start = cleaned.find('{')
    end = cleaned.rfind('}')
    if start != -1 and end != -1 and end >= start:
        sub = cleaned[start:end+1]
        try:
            return json.loads(sub)
        except:
            pass
        try:
            fixed = re.sub(r'(?<!\\)\n', r'\\n', sub)
            return json.loads(fixed)
        except:
            pass

    # Direct regex extraction for "answer"
    m = re.search(r'"answer"\s*:\s*"(.*?)"\s*,\s*"explainability"', cleaned, re.DOTALL)
    if m:
        ans = m.group(1).replace('\\n', '\n').replace('\\"', '"')
        return {"answer": ans, "explainability": {"unsupported_evidence": False}}

    # If LLM returned raw text
    if len(raw.strip()) > 10 and not raw.strip().startswith('{'):
        return {"answer": raw.strip(), "explainability": {"unsupported_evidence": False}}

    return default


async def generate_answer(memory_context: str, question: str) -> dict:
    cfg = get_config()
    prompt = f"""Patient memory & clinical record:
{memory_context}

Doctor's question: {question}

Provide a thorough, professional, and well-structured clinical answer.
Format paragraphs clearly with double newlines. If listing medications or items, format each on a new line with a bullet point (- Item).

Return strictly JSON:
{{
  "answer": "Comprehensive clinical answer...",
  "explainability": {{"retrieval_summary": "retrieved patient graph memory"}}
}}
"""
    raw = await _complete(cfg, DOCTOR_SYSTEM, prompt)
    return _parse_json_safely(raw, {"answer": raw.strip() if raw and not raw.strip().startswith('{') else "Failed to parse response.", "explainability": {"unsupported_evidence": True}})


async def generate_brief(memory_context: str, patient_name: str) -> dict:
    cfg = get_config()
    prompt = f"""Patient: {patient_name}

Memory from Cognee Cloud:
{memory_context}

Return ONLY this JSON structure (no markdown, no backticks, start with {{):
{{
  "risk_level": "Low or Moderate or High",
  "risk_reason": "one sentence explaining risk level",
  "points": [
    {{"num": 1, "title": "Current conditions", "text": "list all diagnosed conditions"}},
    {{"num": 2, "title": "Active medications", "text": "list all medications with doses"}},
    {{"num": 3, "title": "Watch out for", "text": "allergies, contraindications, risks"}},
    {{"num": 4, "title": "Last visit notes", "text": "recent findings and doctor observations"}},
    {{"num": 5, "title": "Suggested questions", "text": "questions to ask the patient today"}}
  ],
  "suggested_focus": ["focus item 1", "focus item 2", "focus item 3"],
  "explainability": {{...}}
}}

{EXPLAINABILITY_INSTRUCTION}
"""

    raw = await _complete(cfg, BRIEF_SYSTEM, prompt)
    return _parse_json_safely(raw, _fallback_brief(patient_name))


async def generate_structured_differences(old_memory: str, new_memory: str) -> dict:
    cfg = get_config()
    prompt = f"""
Previous memory snapshot:
{old_memory}

Updated memory snapshot:
{new_memory}

Return strictly this JSON format:
{{
"diagnoses": {{"added": [], "removed": []}},
"medications": {{"added": [], "removed": [], "changed": []}},
"labs": [{{"name": "...", "old": "...", "new": "...", "trend": "improved|worsened|stable"}}],
"allergies": {{"added": [], "removed": []}},
"procedures": {{"added": []}},
"risk": {{"old": "...", "new": "..."}}
}}
"""
    raw = await _complete(cfg, STRUCTURED_DIFF_SYSTEM, prompt)
    import json, re
    try:
        cleaned = re.sub(r'```json\s*', '', raw)
        cleaned = re.sub(r'```\s*', '', cleaned)
        cleaned = cleaned.strip()
        start = cleaned.find('{')
        end   = cleaned.rfind('}')
        if start != -1 and end != -1 and end >= start:
            return json.loads(cleaned[start:end+1])
        return json.loads(cleaned)
    except Exception as e:
        print(f"Error parsing structured diff JSON: {e}")
        return {"diagnoses": {"added": [], "removed": []}, "medications": {"added": [], "removed": [], "changed": []}, "labs": [], "allergies": {"added": [], "removed": []}, "procedures": {"added": []}, "risk": {"old": "Unknown", "new": "Unknown"}}


async def generate_evolution_explanation(diff_json: dict) -> dict:
    cfg = get_config()
    prompt = f"""
Structured Differences:
{json.dumps(diff_json)}

Return strictly this JSON format:
{{
"trajectory": "Improving" | "Stable" | "Needs Attention" | "Declining",
"trajectory_reason": "Why the trajectory changed.",
"overall_risk": "Low" | "Medium" | "High",
"changes": [
  {{"status": "✓" | "⚠" | "🔴" | "🟡", "text": "...", "evidence": ["..."]}}
],
"summary": "Concise explanation of evolution...",
"explainability": {{...}}
}}

{EXPLAINABILITY_INSTRUCTION}

If no meaningful differences exist in the input, return:
{{
"trajectory": "Stable",
"trajectory_reason": "No significant changes.",
"overall_risk": "Unknown",
"changes": [],
"summary": "No clinically significant changes detected since the previous visit.",
"explainability": {{"unsupported_evidence": true}}
}}
"""
    raw = await _complete(cfg, EVOLUTION_SYSTEM, prompt)
    return _parse_json_safely(raw, {"trajectory": "Stable", "trajectory_reason": "Failed to parse.", "overall_risk": "Unknown", "changes": [], "summary": "No clinically significant changes detected since the previous visit.", "explainability": {"unsupported_evidence": True}})


def _parse_brief_json(raw: str, patient_name: str) -> dict:
    """Robustly parse brief JSON from LLM response."""
    if not raw:
        return _fallback_brief(patient_name)

    # Try 1 — parse directly
    try:
        return json.loads(raw.strip())
    except Exception:
        pass

    # Try 2 — remove markdown code blocks
    cleaned = re.sub(r'```json\s*', '', raw)
    cleaned = re.sub(r'```\s*', '', cleaned)
    cleaned = cleaned.strip()
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Try 3 — extract JSON between first { and last }
    start = raw.find('{')
    end   = raw.rfind('}')
    if start != -1 and end != -1 and end > start:
        try:
            return json.loads(raw[start:end+1])
        except Exception:
            pass

    # Try 4 — find JSON array of points if full JSON fails
    # Extract what we can and build structure
    risk = "Moderate"
    if "high risk" in raw.lower() or "critical" in raw.lower():
        risk = "High"
    elif "low risk" in raw.lower():
        risk = "Low"

    # Extract text content (remove JSON syntax)
    text_content = re.sub(r'[{}\[\]":]', ' ', raw)
    text_content = re.sub(r'\s+', ' ', text_content).strip()

    return {
        "risk_level":  risk,
        "risk_reason": f"Based on {patient_name}'s medical history",
        "points": [
            {"num":1, "title":"Current conditions",  "text": text_content[:300] if text_content else "See uploaded documents"},
            {"num":2, "title":"Active medications",  "text": "Review uploaded prescriptions"},
            {"num":3, "title":"Watch out for",       "text": "Check allergies and drug interactions"},
            {"num":4, "title":"Last visit notes",    "text": "Refer to uploaded documents"},
            {"num":5, "title":"Suggested questions", "text": "Ask about current symptoms and medication compliance"},
        ],
        "suggested_focus": ["Review medications", "Check vitals", "Assess symptoms"],
    }


def _fallback_brief(patient_name: str) -> dict:
    return {
        "risk_level":  "Moderate",
        "risk_reason": f"Unable to generate brief for {patient_name} — upload more documents",
        "points": [
            {"num":1, "title":"Current conditions",  "text": "Upload patient records to generate"},
            {"num":2, "title":"Active medications",  "text": "Upload prescriptions to generate"},
            {"num":3, "title":"Watch out for",       "text": "Upload medical history to generate"},
            {"num":4, "title":"Last visit notes",    "text": "Upload visit notes to generate"},
            {"num":5, "title":"Suggested questions", "text": "Ask about current symptoms"},
        ],
        "suggested_focus": ["Upload documents", "Review history", "Check medications"],
        "explainability": {"unsupported_evidence": True}
    }


async def _complete(cfg: dict, system: str, prompt: str) -> str:
    provider = cfg["provider"].lower()
    if provider == "groq":
        return await _groq(cfg, system, prompt)
    elif provider == "anthropic":
        return await _anthropic(cfg, system, prompt)
    elif provider == "mistral":
        return await _mistral(cfg, system, prompt)
    elif provider == "together":
        return await _together(cfg, system, prompt)
    elif provider == "custom":
        return await _custom_openai(cfg, system, prompt)
    else:
        return await _openai(cfg, system, prompt)


async def _groq(cfg: dict, system: str, prompt: str) -> str:
    from groq import AsyncGroq
    client = AsyncGroq(api_key=cfg["key"])
    r = await client.chat.completions.create(
        model=cfg["model"],
        messages=[{"role":"system","content":system},{"role":"user","content":prompt}],
        temperature=0.2, max_tokens=1200,
    )
    return r.choices[0].message.content or ""


async def _openai(cfg: dict, system: str, prompt: str) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=cfg["key"])
    r = await client.chat.completions.create(
        model=cfg["model"],
        messages=[{"role":"system","content":system},{"role":"user","content":prompt}],
        temperature=0.2, max_tokens=1200,
    )
    return r.choices[0].message.content or ""


async def _anthropic(cfg: dict, system: str, prompt: str) -> str:
    import anthropic
    client = anthropic.AsyncAnthropic(api_key=cfg["key"])
    msg = await client.messages.create(
        model=cfg["model"], max_tokens=1200,
        system=system,
        messages=[{"role":"user","content":prompt}],
    )
    return msg.content[0].text or ""


async def _mistral(cfg: dict, system: str, prompt: str) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=cfg["key"], base_url="https://api.mistral.ai/v1")
    r = await client.chat.completions.create(
        model=cfg["model"],
        messages=[{"role":"system","content":system},{"role":"user","content":prompt}],
        temperature=0.2, max_tokens=1200,
    )
    return r.choices[0].message.content or ""


async def _together(cfg: dict, system: str, prompt: str) -> str:
    from openai import AsyncOpenAI
    client = AsyncOpenAI(api_key=cfg["key"], base_url="https://api.together.xyz/v1")
    r = await client.chat.completions.create(
        model=cfg["model"],
        messages=[{"role":"system","content":system},{"role":"user","content":prompt}],
        temperature=0.2, max_tokens=1200,
    )
    return r.choices[0].message.content or ""


async def _custom_openai(cfg: dict, system: str, prompt: str) -> str:
    from openai import AsyncOpenAI
    if not cfg.get("base_url"):
        raise ValueError("Custom LLM base URL not set in settings")
    client = AsyncOpenAI(api_key=cfg["key"] or "not-needed", base_url=cfg["base_url"])
    r = await client.chat.completions.create(
        model=cfg["model"],
        messages=[{"role":"system","content":system},{"role":"user","content":prompt}],
        temperature=0.2, max_tokens=1200,
    )
    return r.choices[0].message.content or ""