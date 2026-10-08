# DRIVA — Enterprise Freight Decision Platform & AI Logistics Hub

DRIVA is an enterprise-grade autonomous freight dispatch, multi-attribute matching, and decision-support platform designed for corporate supply chains. It combines scikit-learn machine learning prediction models, a multi-attribute decision engine, PostgreSQL data persistence, and a Groq LLaMA 3.3 AI natural-language explanation layer.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│              React + TypeScript + Tailwind Frontend             │
│            (Enterprise Slate / Indigo Operations UI)            │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST API (JSON / JWT)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Enterprise Backend                   │
│          (/api/auth, /api/transport-requests, /api/ai)          │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
                ▼                                 ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     PostgreSQL / SQLite       │ │     DRIVA Decision Engine     │
│   (Single Source of Truth)    │ │   Multi-Attribute Utility     │
└───────────────────────────────┘ └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │           ML Models           │
                                  │     (Cost, ETA, Suitability)  │
                                  └───────────────┬───────────────┘
                                                  │
                                                  ▼
                                  ┌───────────────────────────────┐
                                  │      Groq AI Explanation      │
                                  │    LLaMA 3.3 70B & Fallback   │
                                  └───────────────────────────────┘
```

---

## Key Features

1. **Enterprise Carrier Matching**: Evaluates route corridors (e.g., Salem → Bangalore NH44), cargo payload weight, volume class, and transit deadlines.
2. **Developer 3 ML Models**:
   - **Cost Prediction Model**: Factors route mileage, vehicle class, fuel/EV electricity rate, and toll overheads.
   - **ETA Transit Model**: Analyzes highway corridor speeds, traffic variance, and EV charging buffers.
   - **Suitability Model**: Measures payload capacity utilization and vehicle powertrain feasibility.
3. **DRIVA Multi-Attribute Decision Engine**:
   - Computes weighted composite **Match Score (0–100%)**: Cost Efficiency (30%), ETA & Deadline Adherence (25%), Historical Carrier Reliability (25%), ML Suitability Index (20%).
4. **Groq AI Natural Language Explanation Layer**:
   - Generates executive business explanations justifying top recommendations (e.g., *"ABC Logistics is recommended because it meets the today delivery deadline..."*).
   - Never hallucinates prices; grounded strictly in verified PostgreSQL records.
5. **AI Transportation Assistant**:
   - Interactive business assistant answering executive questions (*"Which option is cheapest?"*, *"Why wasn't the EV selected?"*, *"What will save me more money?"*).
   - High-reliability fallback if Groq API is temporarily unreachable.
6. **Consignment Lifecycle & Live Telemetry**:
   - Full 5-stage stepper: `CONFIRMED` → `DRIVER_ASSIGNED` → `PICKUP` → `IN_TRANSIT` → `DELIVERED`.
   - Driver details, vehicle plate tracking, and interactive highway waypoint progress.
7. **Post-Delivery Carrier Rating**:
   - 1–5 star rating submission with persistent carrier reliability scorecard updates.
8. **Supply Chain Operations Analytics**:
   - Enterprise KPIs: On-time dispatch rate, logistics spend reduction, decision engine accuracy, ESG avoided carbon (kg CO₂).

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
# Groq API Key (Obtain from https://console.groq.com/keys)
GROQ_API_KEY=your_groq_api_key_here

# PostgreSQL Database URL (or defaults to SQLite fallback sqlite:///./driva.db)
DATABASE_URL=sqlite:///./driva.db
# For PostgreSQL use:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/driva

# Security JWT
JWT_SECRET_KEY=driva_enterprise_production_secret_key_2026_xyz987
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Groq Model
GROQ_MODEL=llama-3.3-70b-versatile
```

> **Security Note:** `GROQ_API_KEY`, `DATABASE_URL`, and `JWT_SECRET_KEY` are strictly held in the FastAPI backend environment and are **never** exposed to the React frontend.

---

## Setup & Local Installation

### Prerequisites
- Python 3.10+ (Tested on Python 3.14)
- Node.js v18+ (Tested on Node v24)
- PostgreSQL (Optional; defaults to SQLite `driva.db` for zero-configuration local runs)

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Seed initial enterprise logistics carriers & demo accounts
python -m app.seed_data

# Run Alembic migrations (optional for Postgres)
python -m alembic upgrade head
```

### 2. Frontend Setup

```bash
cd frontend

# Install npm packages
npm install

# Build production bundle
npm run build
```

---

## Running the Application

### Start Backend (Terminal 1)
```bash
cd backend
python main.py
```
*Backend API runs at: [http://localhost:8000](http://localhost:8000)*  
*Swagger API Docs: [http://localhost:8000/docs](http://localhost:8000/docs)*

### Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
*Frontend runs at: [http://localhost:5173](http://localhost:5173)*

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Enterprise Business Manager** | `business@driva.com` | `driva123` |
| **Platform Administrator** | `admin@driva.com` | `driva123` |

*(A 1-click **Quick Fill** button is provided on the sign-in modal for rapid evaluation.)*

---

## End-to-End Demo Workflow

1. **Sign In**: Navigate to `http://localhost:5173` and authenticate as `business@driva.com`.
2. **Create Transport Request**:
   - Origin: `Salem`
   - Destination: `Bangalore`
   - Cargo Weight: `200 kg`
   - Deadline: `Today`
   - Click **"Calculate Optimal Carriers & Match Scores"** (or use the 1-click test button).
3. **ML Prediction & Decision Engine Results**:
   - Review **Recommended Provider** (`ABC Logistics`) with Cost (₹4,161.92), ETA (5.2 hrs), Capacity (1,200 kg), Reliability (98%), and Match Score (93.8%).
   - Compare runner-up carriers (`Economy Haulers`, `GreenRoute Electric`, `Apex Express`).
4. **AI Explanation**:
   - Click **"Why DRIVA recommended this"** to inspect the Groq AI executive decision rationale.
5. **Transportation Assistant**:
   - Click **"AI Assistant"** in the top navigation to ask questions:
     - *"Why wasn't the EV selected?"*
     - *"Which option is cheapest?"*
     - *"What will save me more money?"*
6. **Reserve Dispatch**:
   - Click **"BOOK NOW"** on ABC Logistics to create the booking in PostgreSQL.
7. **Lifecycle Progression**:
   - In the tracking modal, advance lifecycle stages:
     `Confirmed` → `Driver Assigned` → `Cargo Loaded` → `In Transit` → `Delivered`.
8. **Carrier Evaluation**:
   - Upon delivery, submit a 5-star rating with feedback.
9. **Operations Analytics**:
   - Switch to the **Operations Analytics** tab to view live KPIs, carrier reliability scorecards, and ESG carbon avoidance.

---

## License
Proprietary — DRIVA Logistics Technologies.
