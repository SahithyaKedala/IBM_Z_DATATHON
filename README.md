# VectorVision: Real-Time AI Emergency Dispatch Optimization

> **IBM Datathon Project**  
> High-Throughput, Resilient AI Dispatch Platform Engineered for **IBM LinuxONE & Red Hat OpenShift (s390x)**

---

## 🚑 Project Overview

**VectorVision** transforms municipal emergency medical services (EMS) from naive, proximity-only dispatch into an intelligent, explainable, multi-criteria decision system. By continuously assimilating real-time physiological vitals, live urban traffic bottlenecks, ambulance care capabilities (ALS vs. BLS), and hospital ICU/ER bed saturations, VectorVision ensures the **right unit reaches the right patient and delivers them to the right specialized facility**.

---

## 🏗️ Architecture & 11-Stage Implementation

```
   911 Emergency Stream (Vitals & Address)
                     │
                     ▼
       ┌───────────────────────────┐
       │ AI Severity Triage Engine │  ESI Level 1-4, Mortality Risk Index
       └─────────────┬─────────────┘
                     │
                     ▼
       ┌───────────────────────────┐
       │   Multi-Criteria Decision │  Proximity (35%) + ALS/BLS Fit (30%) +
       │       Engine (MCDA)       │  Hospital Capacity (25%) + Traffic (10%)
       └─────────────┬─────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
  Optimal Unit: Medic-01   Optimal Hospital: St. Jude Cardiac
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
       ┌───────────────────────────┐
       │   Explainable AI (XAI)    │  Natural Language Rationale & Radar Breakdown
       └─────────────┬─────────────┘
                     │
                     ▼
       ┌───────────────────────────┐
       │ Dispatcher Mission Panel  │  Approve / Modify / Reject Controls
       └─────────────┬─────────────┘
                     │
                     ▼
       ┌───────────────────────────┐
       │ Real-Time WebSocket Tele- │  Live GPS Tracking, Dynamic Re-routing & Divert
       │      metry Simulator      │  Alerts on IBM LinuxONE (s390x)
       └───────────────────────────┘
```

### 1. Problem & Requirements
- Real-time 911 dispatch workflow integrating patient vitals, traffic congestion, fleet readiness, and hospital specialties.
- Eradicates critical clinical mismatches (e.g. sending Basic Life Support to a cardiac arrest or sending severe trauma to a facility without trauma surgery).

### 2. Dataset Preparation
- Comprehensive metropolitan seed data:
  - 8-unit ambulance fleet (ALS Critical Care & BLS Emergency response).
  - 5 major metropolitan hospitals with live ER wait times, total and available ICU beds, and specialty accreditations (Level-1 Trauma, Cardiac Cath Lab, Comprehensive Stroke, Burn Center, Pediatric).
  - Dynamic traffic congestion corridors (FDR Expressway, Broadway, Midtown commercial grid).

### 3. Backend Development
- Asynchronous **FastAPI** backend with automated SQLite/PostgreSQL layer.
- WebSocket broadcaster (`/ws/dispatch`) providing 2-second telemetry pulses to mission dashboards.

### 4. AI/ML Module
- **Clinical Severity Predictor**: Implements Emergency Severity Index (ESI v4) scoring and logistic mortality risk regression based on vitals (SpO2, heart rate, systolic BP, consciousness, hemorrhage).
- **Travel-Time & ETA Predictor**: Haversine distance with Manhattan urban grid circuity factor, modulated by real-time traffic congestion zones and code-3 emergency siren bonuses.

### 5. Decision Engine
- Multi-criteria utility function with transparent Explainable AI (XAI) output and natural language narrative synthesis.

### 6. Real-Time Processing & Simulation
- Continuous background simulation loop that advances vehicles in motion, tracks on-scene arrival and patient transfer, and proactively alerts dispatchers to sudden traffic spikes or hospital diversions.

### 7 & 8. Frontend Dashboard & Integration
- Modern React + Vite mission control console with custom dark mode glassmorphism design system.
- Interactive SVG vector radar map displaying moving ambulances, hospital capacity pins, traffic zones, and dynamic route polylines.
- Dispatcher controls: One-click Approve, Manual Override/Modify, and Rejection actions.

### 9. IBM Z / LinuxONE Deployment
- Multi-architecture container build (`Dockerfile.backend`, `Dockerfile.frontend`) supporting `linux/s390x` and `linux/amd64`.
- Red Hat OpenShift manifests (`deployment.yaml`, `service.yaml`, `route.yaml`, `configmap.yaml`) ensuring strict non-root Security Context Constraints (SCC) and high availability on IBM LinuxONE.

### 10. Testing & Evaluation
- 50-scenario Monte Carlo benchmark comparing VectorVision AI against naive nearest-unit baseline:
  - **Critical Care Match Rate**: 100% vs. 74%
  - **Specialty Hospital Alignment**: 100% vs. 26%
  - **Patient Diversion Avoidance**: 100% clean admissions

### 11. Final Demonstration Walkthrough
- Trigger incoming emergency -> AI triage scoring -> Recommended ambulance & hospital -> Dispatcher approval -> Real-time GPS tracking.

---

## 🚀 Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Launch Backend
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
- API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Launch Frontend
```bash
cd frontend
npm install
npm run dev
```
- Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker & OpenShift Deployment on IBM LinuxONE

```bash
# Multi-container local stack
cd deployment
docker compose up --build

# OpenShift on LinuxONE (s390x)
oc apply -f deployment/openshift/configmap.yaml
oc apply -f deployment/openshift/deployment.yaml
oc apply -f deployment/openshift/service.yaml
oc apply -f deployment/openshift/route.yaml
```
See [`docs/ibm_linuxone_deployment.md`](file:///d:/IBM_Datathon/docs/ibm_linuxone_deployment.md) for full deployment instructions.
