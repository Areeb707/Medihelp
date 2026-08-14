<div align="center">

  # 🧠🩺 MedHelp AI
  ### **Great Care Begins Where Memory Never Ends.**

  A persistent medical memory system for doctors and healthcare teams<br>
  Powered by **Cognee Cloud GraphRAG**, **FastAPI**, and **Next.js 14**

  <p>
    <img src="https://img.shields.io/badge/Next.js-14.2-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Cognee_Cloud-GraphRAG_V2-10b981?style=for-the-badge" alt="Cognee" />
    <img src="https://img.shields.io/badge/Groq-Llama_3.1-f54e42?style=for-the-badge" alt="Groq" />
    <img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Status-Submission_Ready-success?style=for-the-badge" alt="Status" />
  </p>

</div>

---

## 📋 Table of Contents
1. [Executive Summary](#executive-summary)
2. [Clinical Safety Notice](#clinical-safety-notice)
3. [Evidence-Grounded GraphRAG Innovation](#evidence-grounded-graphrag-innovation)
4. [High-Value Clinical Feature Portals](#high-value-clinical-feature-portals)
5. [Visual Feature Showcase](#visual-feature-showcase)
6. [Cognee GraphRAG Memory Engine](#cognee-graphrag-memory-engine)
7. [System Architecture Diagram](#system-architecture-diagram)
8. [Clinical Data Flow Sequence](#clinical-data-flow-sequence)
9. [Quickstart Setup Guide](#quickstart-setup-guide)
10. [Full API Endpoint Reference](#full-api-endpoint-reference)
11. [Security, Privacy & HIPAA-Aligned Practices](#security-privacy--hipaa-aligned-practices)
12. [License & Acknowledgments](#license--acknowledgments)

---

## 👁️ Executive Summary

Most electronic health record (EHR) systems store patient histories across scattered PDF uploads, visit notes, and lab reports. Doctors often spend a huge portion of their day manually digging through old files to find relevant details, which is slow and makes it easy to miss important contraindications or past lab trends.

Standard RAG tools connected to vector databases struggle here because text is broken into arbitrary chunks. They often confuse dates, mix up drug dosages, or combine details across different patients.

**MedHelp AI organizes clinical records into a structured Knowledge Graph.** Using **Cognee Cloud GraphRAG**, the system ingests uploaded medical PDFs, extracts core clinical entities (like diagnoses, medications, lab values, vitals, and allergies), and connects them over time.

Doctors can query patient records through an AI assistant that answers based strictly on retrieved patient context—helping reduce hallucination risks, highlighting potential medication risks, and speeding up pre-visit prep.

---

> [!IMPORTANT]
> ### ⚠️ Clinical Safety Notice
> **MedHelp AI is a decision-support tool meant to help doctors review patient records faster.** It does not provide medical diagnoses or replace professional medical judgment. All clinical decisions remain entirely with the treating doctor. If the system does not find enough patient evidence to answer a question, it states that context is missing rather than guessing.

---

## 🛡️ Evidence-Grounded GraphRAG Innovation

| Legacy EHR / Vector RAG Limitations ❌ | MedHelp AI GraphRAG Approach ✅ |
| :--- | :--- |
| **Fragmented PDF Attachments:** Context is scattered across unorganized documents. | **Unified Knowledge Graph:** Extracts diagnoses, drugs, and lab entities into a dedicated dataset per patient (`patient_{uuid}`). |
| **Vector Search Hallucinations:** Text chunks break mid-sentence, losing context and connections. | **Graph-Based Retrieval:** Connects medical facts with explicit edges. Queries pull answers directly from retrieved graph context (`Source: graph`). |
| **Missed Contraindications:** Allergy and drug conflicts stay hidden in old notes. | **Background Risk Scanning:** Scans uploaded files during indexing to flag drug-allergy conflicts and abnormal lab trends automatically. |
| **Outdated Data Collisions:** Old notes conflict with new visit records. | **Evolving Memory (`improve`):** Deduplicates entities and updates lab trends over time as new documents are added. |
| **Cross-Patient Context Bleeding:** Vector databases can accidentally retrieve data from other patients. | **Isolated Datasets (`forget`):** Patient data is completely separated in memory. Deleting a patient triggers dataset removal via `cognee.forget()`. |

---

## 💎 High-Value Clinical Feature Portals

MedHelp AI includes 5 main views built for everyday clinical workflows:

1. **Grounded AI Doctor Assistant (`/patients/chat`)**:
   - Ask questions about a patient's medical history in plain text. Answers reference specific graph context (`Source: graph`) and organize key takeaways cleanly.

2. **Pre-Visit Snapshot Brief (`/patients/brief`)**:
   - Runs parallel `cognee.recall()` queries to generate a quick 5-point summary covering current risk level, active conditions, prescriptions, lab highlights, and suggested follow-up questions.

3. **Longitudinal Medical Timeline (`/patients/timeline`)**:
   - Displays past medical events in chronological order directly from graph memory, showing diagnoses, medications, and lab results with clear severity badges.

4. **Interactive SVG Mindmap Visualizer (`/patients/mindmap`)**:
   - Renders an interactive visual graph of medical entities, conditions, and medication nodes extracted by Cognee Cloud.

5. **Risk Alert Center & Doctor Rosters (`/alerts` & `/patients/list`)**:
   - Automatically checks uploaded records for drug-allergy conflicts or abnormal lab values. Alerts and patient lists filter dynamically based on the logged-in doctor (`?doctor={name}`).

---

## 🖼️ Visual Feature Showcase

<div align="center">
  <img src="./assets/Architecture.png" alt="Platform Architecture Overview" width="90%" />
  <p><em>Figure 1: High-Level Architecture — PDF ingestion pipeline and clinical query workflow.</em></p>
</div>

<br/>

<div align="center">
  <img src="./assets/node.png" alt="Medical Node Extraction" width="90%" />
  <p><em>Figure 2: Cognee Knowledge Graph Engine — Extracted clinical nodes, lab values, and timestamps.</em></p>
</div>

<br/>

<div align="center">
  <img src="./assets/entity.png" alt="Medical Entity Linkage" width="90%" />
  <p><em>Figure 3: Cognee Knowledge Graph Engine — Entity connections between conditions, drugs, and patient records.</em></p>
</div>

---

## 🧠 Cognee GraphRAG Memory Engine

The backend handles patient memory using Cognee Cloud through four main API calls:

```
       [ Uploaded PDF Medical Records ]
                      │
                      ▼
            cognee.remember()
    (NLP Extraction & Graph Construction)
                      │
                      ▼
             [ Knowledge Graph ]
          Patient Dataset: patient_{uuid}
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
  cognee.recall()           cognee.improve()
 (Graph Traversal)        (Graph Refinement)
         │                         │
         ▼                         ▼
 [ Grounded Response ]     [ Evolving Memory ]
```

- **`remember()`**: Parses uploaded PDFs using PyMuPDF and extracts medical entities into a patient-specific graph.
- **`recall()`**: Traverses the graph to retrieve relevant context when a doctor asks a question or requests a brief.
- **`improve()`**: Merges duplicate entities and updates lab trends over time as new documents are uploaded.
- **`forget()`**: Deletes the patient's graph dataset whenever a patient profile is removed.

---

## 📐 System Architecture Diagram

```mermaid
graph TD
    classDef client fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    classDef api fill:#1e1e24,stroke:#a855f7,stroke-width:2px,color:#fff
    classDef cognee fill:#052e16,stroke:#10b981,stroke-width:2px,color:#fff
    classDef llm fill:#3b120c,stroke:#ef4444,stroke-width:2px,color:#fff

    subgraph Client ["🖥️ Client Layer — Next.js 14 (App Router)"]
        direction LR
        UI_Dash["Doctor Dashboard & Roster"]
        UI_Upload["PDF Upload Hub"]
        UI_Chat["AI Doctor Grounded Chat"]
        UI_Timeline["Longitudinal Timeline"]
        UI_Alerts["Risk Alerts Center"]
    end
    class Client,UI_Dash,UI_Upload,UI_Chat,UI_Timeline,UI_Alerts client

    subgraph Backend ["⚡ Server Layer — FastAPI (Python 3.11)"]
        direction TB
        API_Route["API Gateway & Session Manager"]
        Wrk_Ingest["Async Ingestion Worker (PyMuPDF)"]
        Svc_RAG["GraphRAG Query Service"]
        Store_Alerts["Proactive Risk Alert Scanner"]
    end
    class Backend,API_Route,Wrk_Ingest,Svc_RAG,Store_Alerts api

    subgraph MemoryLayer ["🧠 Memory Layer — Cognee Cloud (GraphRAG Engine)"]
        direction TB
        CG_Rem["cognee.remember()<br/>(Entity Extraction & Ingestion)"]
        CG_Rec["cognee.recall()<br/>(Knowledge-Graph Traversal)"]
        CG_Imp["cognee.improve()<br/>(Continuous Memory Evolution)"]
        CG_DB[("Isolated Knowledge Graph<br/>patient_{uuid}")]
        
        CG_Rem -->|Extracts Nodes & Edges| CG_DB
        CG_DB -->|Traverses Retrieved Context| CG_Rec
        CG_Imp -->|Refines Graph Memory| CG_DB
    end
    class MemoryLayer,CG_Rem,CG_Rec,CG_Imp,CG_DB cognee

    subgraph Inference ["🤖 Inference Layer — Groq LLM Engine"]
        Model["Llama-3.1-8b-instant<br/>(Clinical Language Reasoning)"]
    end
    class Inference,Model llm

    UI_Upload -->|1. Multipart Medical PDF| API_Route
    API_Route -->|2. Extract Text Chunks| Wrk_Ingest
    Wrk_Ingest -.->|3. Async Graph Ingestion| CG_Rem
    UI_Chat -->|4. Clinical Query| Svc_RAG
    Svc_RAG -->|5. Knowledge Graph Traversal| CG_Rec
    CG_Rec -->|6. Retrieved Patient Context| Model
    Model -->|7. Evidence-Grounded Response| UI_Chat
    Store_Alerts -->|8. Real-time Risk Alerts| UI_Alerts
```

---

## 🔄 Clinical Data Flow Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Physician
    participant Web as Next.js Frontend
    participant API as FastAPI Backend
    participant Cognee as Cognee Cloud GraphRAG
    participant LLM as Groq Llama-3.1

    Doctor->>Web: Upload Medical Record PDF
    Web->>API: POST /upload/{patient_id}
    API->>API: PyMuPDF Text Extraction & Chunking
    API-->>Web: HTTP 200 (Upload Accepted)
    API->>Cognee: async cognee.remember()
    Note over Cognee: Ingests Entities into patient_{uuid} Graph
    API->>Cognee: async cognee.improve()
    Note over Cognee: Refines Node Edges & Deduplicates Labs
    
    Doctor->>Web: Ask Clinical Question ("Any drug allergy conflicts?")
    Web->>API: POST /chat/{patient_id}
    API->>Cognee: cognee.recall()
    Cognee-->>API: Retrieved Graph Nodes & Entity Edges
    API->>LLM: Pass Retrieved Patient Context + System Prompt
    LLM-->>API: Evidence-Grounded Response
    API-->>Web: Grounded Answer + Source Attribution Badge
```

---

## 💻 Quickstart Setup Guide

### Prerequisites
* **Node.js**: `v18.0.0+` | **Python**: `v3.10+` | **Managers**: `npm` and `pip`

### Step 1: Clone Repository
```bash
git clone https://github.com/MohanrajCit/MedHelp.git
cd MedHelp
```

### Step 2: Launch Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```
*Verify Backend Health: Open `http://localhost:8000/health` (`{"backend": "ok"}`).*

### Step 3: Launch Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

## 🌐 Full API Endpoint Reference

### Base URL: `http://localhost:8000`

| Method | Endpoint | Query / Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | — | Server health check & service status |
| `GET` | `/patients/list` | `?doctor={name}` | Fetch doctor-scoped patient roster |
| `POST` | `/patients/create` | `{ name, age, gender, doctor }` | Create a new patient record |
| `DELETE` | `/patients/{id}` | — | Delete patient record & invoke `cognee.forget()` |
| `POST` | `/upload/{id}` | Multipart Form (`file`) | Upload PDF → PyMuPDF extraction → `cognee.remember()` |
| `POST` | `/chat/{id}` | `{ question }` | AI Doctor chat grounded in retrieved patient context |
| `GET` | `/memory/{id}/timeline` | — | Recalls chronological timeline events |
| `GET` | `/memory/{id}/mindmap` | — | Returns SVG knowledge graph nodes & edges |
| `POST` | `/brief/{id}` | — | Generates 5-point clinical snapshot brief |
| `GET` | `/alerts` | `?doctor={name}` | Fetch doctor-filtered severity risk alerts |
| `PATCH` | `/alerts/{id}/read` | — | Mark a specific alert as read |
| `DELETE` | `/alerts/{id}` | — | Dismiss an alert from the system |

---

## 🔒 Security, Privacy & HIPAA-Aligned Practices

1. **Patient Data Isolation (`patient_{uuid}`)**: Each patient's memory is stored in a separate dataset, keeping context completely isolated.
2. **Dataset Removal (`cognee.forget`)**: Deleting a patient profile triggers `cognee.forget()`, removing all stored graph memory for that patient.
3. **Grounded Responses**: The LLM relies on retrieved graph context for answers. If no relevant evidence is found, it clearly lets the user know.

---

## 📄 License & Acknowledgments

* **Core Memory Engine:** Powered by [Cognee Cloud Platform](https://www.cognee.ai).
* **LLM Provider:** Fast clinical inference by [Groq](https://groq.com).

*Built with ❤️ for clinicians everywhere.*
