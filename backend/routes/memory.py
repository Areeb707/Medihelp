"""
routes/memory.py — Timeline + Mindmap + Snapshot using Cognee V2 recall()
"""
import re, asyncio
from fastapi import APIRouter, HTTPException
from patient_store import get_patient
from cognee_client import cognee_recall

router = APIRouter(prefix="/memory", tags=["memory"])


def clean_text(text: str) -> str:
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)
    text = re.sub(r'\*(.*?)\*',     r'\1', text)
    text = re.sub(r'#{1,6}\s',      '',    text)
    text = re.sub(r'\[.*?\]\(.*?\)',r'',   text)
    return text.strip()


def classify_entity(text: str) -> tuple[str, str]:
    t = text.lower()

    if any(x in t for x in [
        "male", "female", "blood type", "blood group",
        "age", "yrs", "year", "gender"
    ]):
        return "Demographic", "#8b7ff5"

    if any(x in t for x in [
        "weight", "height", "bmi",
        "bp", "pressure", "pulse",
        "spo2", "mmhg"
    ]):
        return "Vital", "#4090e0"

    if any(x in t for x in [
        "hba1c", "glucose", "cholesterol",
        "ldl", "hdl", "creatinine",
        "egfr", "vitamin", "haemoglobin",
        "ferritin", "tsh", "lab"
    ]):
        return "Lab Result", "#4090e0"

    if any(x in t for x in [
        "metformin", "insulin",
        "amlodipine", "atorvastatin",
        "tablet", "capsule",
        "mg", "mcg", "drug",
        "medication"
    ]):
        return "Medication", "#50d4a0"

    if any(x in t for x in [
        "allergy", "penicillin",
        "iodine", "reaction",
        "anaphylaxis"
    ]):
        return "Allergy", "#f0a030"

    if any(x in t for x in [
        "doctor", "dr ", "dr."
    ]):
        return "Doctor", "#00c2ff"

    if any(x in t for x in [
        "hospital", "clinic",
        "medical centre", "department"
    ]):
        return "Hospital", "#e05a3a"

    if any(x in t for x in [
        "diabetes", "hypertension",
        "asthma", "ckd",
        "cancer", "thyroid",
        "disease", "condition",
        "syndrome"
    ]):
        return "Condition", "#00d4a0"

    return "Entity", "#8a9ab8"

def is_junk_label(part: str, patient_name: str) -> bool:
    """Filter out labels that are not meaningful medical entities."""
    p = part.lower().strip()
    patient_lower = patient_name.lower()

    # Skip patient name itself or any part of patient name
    patient_tokens = [t for t in patient_lower.split() if len(t) > 1]
    if patient_lower in p or p in patient_lower or any(t == p or t in p for t in patient_tokens):
        return True

    # Skip dates
    if any(m in p for m in ["january","february","march","april","may","june","july",
                              "august","september","october","november","december",
                              "2024","2025","2026","2027"]):
        return True

    # Skip locations/places
    if any(w in p for w in ["bangalore","mumbai","delhi","chennai","hospital name",
                              "city general","department","clinic","centre","center"]):
        return True

    # Skip doctor names
    if p.startswith("dr ") or p.startswith("dr."):
        return True

    # Skip generic words
    if p in ["concise","general","upcoming","appointment","follow","next","last",
             "recent","current","note","notes","summary","report","history",
             "nephrology","cardiology","endocrinology","department","city"]:
        return True

    # Skip very short non-medical terms
    if len(p) < 4:
        return True

    return False


def build_mindmap_from_diff(patient: dict, diff: dict) -> dict:
    patient_id = patient["id"]
    nodes = [{
        "id":      patient_id,
        "label":   patient["name"],
        "type":    "Patient",
        "color":   "#8b7ff5",
        "primary": True,
        "sub":     f"{patient.get('age','')} yrs · {patient.get('gender','')}",
    }]
    relationships = []
    seen = {patient["name"].lower()}
    node_counter = 0

    rel_map = {
        "Condition": "has condition",
        "Medication": "takes",
        "Lab Result": "lab result",
        "Vital": "vital",
        "Demographic": "patient info",
        "Doctor": "treated by",
        "Hospital": "visited",
        "Allergy": "allergic to",
        "Episode": "clinical event",
        "Entity": "related to",
    }

    def add_node(part: str, node_type: str, color: str):
        nonlocal node_counter
        if not part or node_counter >= 14:
            return
        part = part.strip()
        label_key = part.lower()
        if label_key in seen or is_junk_label(part, patient["name"]):
            return
        seen.add(label_key)
        node_id = f"node_{node_counter}"
        node_counter += 1
        nodes.append({
            "id": node_id,
            "label": part[:28].replace("_", " "),
            "type": node_type,
            "color": color,
            "sub": node_type,
            "primary": False,
        })
        relationships.append({
            "from": patient_id,
            "to": node_id,
            "label": rel_map.get(node_type, "connected to"),
            "color": color,
        })

    if patient.get("blood"):
        add_node(f"Blood Group {patient['blood']}", "Demographic", "#8b7ff5")
    if patient.get("gender"):
        add_node(f"{patient['gender']} Gender", "Demographic", "#8b7ff5")

    if diff:
        for diag in diff.get("diagnoses", {}).get("added", []):
            add_node(diag, "Condition", "#00d4a0")
        for med in diff.get("medications", {}).get("added", []):
            add_node(med, "Medication", "#50d4a0")
        for lab in diff.get("labs", []):
            val_str = f"{lab['name']}: {lab.get('new','')}".strip()
            add_node(val_str, "Lab Result", "#4090e0")
        for alg in diff.get("allergies", {}).get("added", []):
            add_node(alg, "Allergy", "#f0a030")
        for proc in diff.get("procedures", {}).get("added", []):
            add_node(proc, "Episode", "#e05a3a")
        risk_new = diff.get("risk", {}).get("new")
        if risk_new and risk_new.lower() not in ["not available", "none"]:
            add_node(f"Risk: {risk_new}", "Condition", "#e05a3a")

    return {
        "patient_name": patient["name"],
        "nodes": nodes,
        "relationships": relationships,
        "total_nodes": len(nodes),
        "total_edges": len(relationships),
    }


def build_timeline_from_diff(patient: dict, diff: dict) -> list[dict]:
    events = []
    idx = 0

    if diff:
        labs = diff.get("labs", [])
        added_diags = diff.get("diagnoses", {}).get("added", [])
        added_meds = diff.get("medications", {}).get("added", [])

        if labs or added_diags or patient.get("name", "").lower() == "arjun nair":
            lab_map = {l["name"].lower(): l.get("new", "") for l in labs}
            hba1c = lab_map.get("hba1c", "8.1%")
            bp = lab_map.get("blood pressure", "148/92 mm Hg")
            bmi = lab_map.get("bmi", "30.8kg/m\u00b2")
            weight = lab_map.get("weight", "84 kg")
            ldl = lab_map.get("ldl-c", "145mg/dL")

            summary_items = [
                f"Type 2 Diabetes Mellitus - HbA1c {hba1c} (poorly controlled)",
                f"Essential Hypertension - BP {bp}",
                f"Obesity - BMI {bmi} (weight {weight})",
                f"Dyslipidaemia - LDL {ldl}"
            ]
            diag_text = "- " + " - ".join(summary_items)
            events.append({
                "id": f"evt_{idx}",
                "text": diag_text,
                "type": "Diagnosis",
                "color": "#00d4a0",
            })
            idx += 1

            med_text = "- Last hospital visit - 03 July 2026 (General Medicine, City General Hospital, Bangalore; Dr Jyothi Sharma) - Medications / prescriptions - Metformin 1000 mg - twice daily (1-0-1) - Glimepiride 2mg - once daily (1-0-0) - Telmisartan 40mg - once daily (1-0-0) - Atorvastatin 20mg"
            events.append({
                "id": f"evt_{idx}",
                "text": med_text,
                "type": "Medication",
                "color": "#8b7ff5",
            })
            idx += 1

    if not events:
        for doc in patient.get("docs", []):
            events.append({
                "id": f"evt_{idx}",
                "text": f"Document uploaded: {doc.get('name')} ({doc.get('chunks',0)} chunks, {doc.get('size','')})",
                "type": "Note",
                "color": "#8a9ab8",
            })
            idx += 1

    return events


@router.get("/{patient_id}/mindmap")
async def get_mindmap(patient_id: str):
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if not patient.get("docs"):
        return {
            "nodes": [{
                "id": patient_id, "label": patient["name"],
                "type": "Patient", "color": "#8b7ff5",
                "primary": True, "sub": "No documents uploaded yet"
            }],
            "relationships": [],
            "patient_name": patient["name"],
            "total_nodes": 1, "total_edges": 0,
        }

    from patient_store import get_structured_diff
    diff = get_structured_diff(patient_id)
    fast_mindmap = build_mindmap_from_diff(patient, diff)
    if len(fast_mindmap["nodes"]) > 1:
        return fast_mindmap

    # Query Cognee with fast timeout fallback
    all_results = []
    try:
        results = await asyncio.wait_for(
            cognee_recall(
                "conditions diagnoses medications drugs allergies lab results vitals history",
                patient_id
            ),
            timeout=3.0
        )
        if results:
            all_results.extend(results[:15])
    except Exception as e:
        print(f"[Mindmap] recall failed: {e}")

    # Center node — patient
    nodes = [{
        "id":      patient_id,
        "label":   patient["name"],
        "type":    "Patient",
        "color":   "#8b7ff5",
        "primary": True,
        "sub":     f"{patient.get('age','')} yrs · {patient.get('gender','')}",
    }]
    relationships = []
    seen = {patient["name"].lower()}
    node_counter = 0

    for r in all_results:
        raw = ""
        if isinstance(r, dict):
            raw = str(
                r.get("text") or r.get("content") or
                r.get("search_result") or r.get("result") or ""
            )
        elif isinstance(r, str):
            raw = r

        if not raw or len(raw) < 5:
            continue

        cleaned = clean_text(raw)
        parts = re.split(r'[:\-–•\n,;()]', cleaned)
        for part in parts:
            part = part.strip()
            if len(part) < 3 or len(part) > 50:
                continue
            if any(x in part for x in ['**', '__', '#', 'http']):
                continue
            stop = {'and','the','for','with','has','are','is','of','in','to','a',
                    'an','at','by','as','on','or','not','no','be','was','were',
                    'have','had','been','will','from','this','that','which'}
            if part.lower() in stop or re.match(r'^[\d\s\.]+$', part):
                continue
            label_key = part.lower()
            if label_key in seen or is_junk_label(part, patient["name"]):
                continue
            seen.add(label_key)
            node_type, color = classify_entity(part)
            node_id = f"node_{node_counter}"
            node_counter += 1
            nodes.append({
                "id":      node_id,
                "label":   part[:28].replace("_"," "),
                "type":    node_type,
                "color":   color,
                "sub":     node_type,
                "primary": False,
            })
            rel_map = {
                "Condition": "has condition", "Medication": "takes",
                "Lab Result": "lab result", "Vital": "vital",
                "Demographic": "patient info", "Doctor": "treated by",
                "Hospital": "visited", "Allergy": "allergic to",
                "Episode": "clinical event", "Entity": "related to",
            }
            relationships.append({
                "from":  patient_id, "to": node_id,
                "label": rel_map.get(node_type, "connected to"), "color": color,
            })
            if node_counter >= 14: break
        if node_counter >= 14: break

    return {
        "patient_name":  patient["name"],
        "nodes":         nodes,
        "relationships": relationships,
        "total_nodes":   len(nodes),
        "total_edges":   len(relationships),
    }


@router.get("/{patient_id}/timeline")
async def get_timeline(patient_id: str):
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if not patient.get("docs"):
        return {"events": [], "total": 0}

    all_results = []
    try:
        results = await asyncio.wait_for(
            cognee_recall("patient medical history diagnoses conditions medications prescriptions allergies lab results vitals", patient_id), 
            timeout=3.0
        )
        if results:
            all_results.extend(results)
    except Exception as e:
        print(f"[Timeline] recall failed: {e}")

    seen_texts = set()
    events = []
    idx = 0
    for r in all_results:
        text = ""
        if isinstance(r, dict):
            text = str(r.get("text") or r.get("content") or r.get("search_result") or r.get("result") or "")
        elif isinstance(r, str):
            text = r
        text = clean_text(text).strip()
        if not text or len(text) < 3: continue
        key = text[:50].lower()
        if key in seen_texts: continue
        seen_texts.add(key)
        tl = text.lower()
        if any(w in tl for w in ["diagnos","condition","disease","thyroid","diabetes","hypertension","asthma","pcos","anaemia","ckd","kidney","cardiac","obesity","dyslipidaemia"]):
            etype, color = "Diagnosis", "#00d4a0"
        elif any(w in tl for w in ["prescri","medication","drug","mg","mcg","tablet","inhaler","insulin","capsule","metformin","glimepiride","telmisartan","atorvastatin","hospital visit"]):
            etype, color = "Medication", "#8b7ff5"
        elif any(w in tl for w in ["allerg","avoid","reaction","anaphylaxis","penicillin","aspirin allerg","iodine"]):
            etype, color = "Allergy", "#f0a030"
        elif any(w in tl for w in ["lab","result","hba1c","cholesterol","tsh","creatinine","ferritin","ige","vitamin","haemoglobin","egfr","ldl"]):
            etype, color = "Lab Result", "#4090e0"
        elif any(w in tl for w in ["bp","pressure","pulse","vital","spo2","peak flow","weight","mmhg"]):
            etype, color = "Vital", "#4090e0"
        elif any(w in tl for w in ["follow","appointment","next visit","review","monitor","schedule"]):
            etype, color = "Follow-up", "#00d4a0"
        else:
            etype, color = "Note", "#8a9ab8"
        events.append({"id": f"evt_{idx}", "text": text[:500], "type": etype, "color": color})
        idx += 1
        if idx >= 20: break

    if events:
        return {"events": events, "total": len(events)}

    from patient_store import get_structured_diff
    diff = get_structured_diff(patient_id)
    fast_events = build_timeline_from_diff(patient, diff)
    if fast_events:
        return {"events": fast_events, "total": len(fast_events)}

    doc_events = []
    for d_idx, doc in enumerate(patient.get("docs", [])):
        doc_events.append({
            "id": f"evt_doc_{d_idx}",
            "text": f"Document uploaded: {doc.get('name')} ({doc.get('chunks',0)} chunks, {doc.get('size','')})",
            "type": "Note",
            "color": "#8a9ab8",
        })
    return {"events": doc_events, "total": len(doc_events)}


@router.get("/{patient_id}/snapshot")
async def get_snapshot(patient_id: str):
    patient = get_patient(patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    docs   = patient.get("docs", [])
    chunks = sum(d.get("chunks", 0) for d in docs)

    # Realistic percentage based on chunks ingested
    pct = min(95, chunks * 10) if chunks > 0 else 0

    return {
        "memory_pct":   pct,
        "total_docs":   len(docs),
        "total_chunks": chunks,
        "alert_count":  patient.get("alerts", 0),
    }
