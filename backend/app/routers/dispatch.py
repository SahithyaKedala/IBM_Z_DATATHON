from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import uuid

from app.models.schemas import Recommendation, DispatchDecisionRequest
from app.services.simulator import simulator
from app.services.decision_engine import DecisionEngine

router = APIRouter(prefix="/dispatch", tags=["dispatch"])

dispatch_logs_in_memory: List[dict] = []

@router.get("/recommendation/{incident_id}", response_model=Recommendation)
def get_recommendation(incident_id: str):
    if incident_id not in simulator.incidents:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident = simulator.incidents[incident_id]
    
    # Recalculate fresh recommendation
    rec = DecisionEngine.generate_recommendation(
        incident,
        list(simulator.ambulances.values()),
        list(simulator.hospitals.values()),
        simulator.traffic_zones
    )
    if not rec:
        raise HTTPException(status_code=400, detail="No suitable available ambulance fleet units found currently")
    
    simulator.recommendations[incident_id] = rec
    return rec

@router.post("/decision")
def submit_dispatch_decision(req: DispatchDecisionRequest):
    if req.incident_id not in simulator.incidents:
        raise HTTPException(status_code=404, detail="Incident not found")
    if req.ambulance_id not in simulator.ambulances:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    if req.hospital_id not in simulator.hospitals:
        raise HTTPException(status_code=404, detail="Hospital not found")

    rec = simulator.recommendations.get(req.incident_id)
    ai_concurrence = True
    if rec:
        ai_concurrence = (
            rec.recommended_ambulance.id == req.ambulance_id and
            rec.recommended_hospital.id == req.hospital_id
        )

    success = simulator.approve_dispatch(
        req.incident_id, req.ambulance_id, req.hospital_id, req.notes
    )

    if not success:
        raise HTTPException(status_code=400, detail="Failed to dispatch unit (unit may be busy)")

    log_entry = {
        "id": f"log-{uuid.uuid4().hex[:6]}",
        "incident_id": req.incident_id,
        "ambulance_id": req.ambulance_id,
        "hospital_id": req.hospital_id,
        "action": req.action,
        "dispatcher_id": req.dispatcher_id,
        "notes": req.notes,
        "ai_concurrence": ai_concurrence,
        "timestamp": datetime.utcnow().isoformat()
    }
    dispatch_logs_in_memory.insert(0, log_entry)

    return {
        "status": "DISPATCHED",
        "log": log_entry,
        "incident": simulator.incidents[req.incident_id],
        "ambulance": simulator.ambulances[req.ambulance_id]
    }

@router.get("/logs")
def get_dispatch_logs():
    return dispatch_logs_in_memory
