from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import uuid

from app.models.schemas import Incident, IncidentCreate, IncidentSeverity
from app.services.simulator import simulator, EMERGENCY_TEMPLATES
from app.services.ai_models import SeverityPredictor
from app.services.decision_engine import DecisionEngine

router = APIRouter(prefix="/incidents", tags=["incidents"])

@router.get("", response_model=List[Incident])
def get_incidents(status: Optional[str] = None):
    incidents = list(simulator.incidents.values())
    if status:
        incidents = [i for i in incidents if i.status == status]
    # Sort with PENDING_DISPATCH first, then by priority score descending
    incidents.sort(key=lambda x: (x.status != "PENDING_DISPATCH", -x.priority_score))
    return incidents

@router.get("/{incident_id}", response_model=Incident)
def get_incident(incident_id: str):
    if incident_id not in simulator.incidents:
        raise HTTPException(status_code=404, detail="Incident not found")
    return simulator.incidents[incident_id]

@router.post("", response_model=Incident)
def create_incident(data: IncidentCreate):
    inc_id = f"inc-{uuid.uuid4().hex[:6]}"
    code = f"CAD-{len(simulator.incidents) + 1001}"
    
    # AI Severity prediction
    severity, care_level, mortality_risk, priority_score = SeverityPredictor.predict(
        data.incident_type, data.vitals
    )

    incident = Incident(
        id=inc_id,
        code=code,
        title=data.title,
        incident_type=data.incident_type,
        address=data.address,
        lat=data.lat,
        lng=data.lng,
        vitals=data.vitals,
        caller_notes=data.caller_notes,
        severity=severity,
        priority_score=priority_score,
        mortality_risk_index=mortality_risk,
        care_level_required=care_level,
        status="PENDING_DISPATCH",
        created_at=datetime.utcnow()
    )

    simulator.incidents[inc_id] = incident

    # Pre-generate AI recommendation
    rec = DecisionEngine.generate_recommendation(
        incident,
        list(simulator.ambulances.values()),
        list(simulator.hospitals.values()),
        simulator.traffic_zones
    )
    if rec:
        simulator.recommendations[inc_id] = rec

    simulator.add_alert(
        title=f"Incoming Emergency: {code}",
        message=f"{incident.title} - AI Triage Level: {severity.value} ({care_level.value})",
        level="CRITICAL" if severity == IncidentSeverity.CRITICAL else "WARNING",
        inc_id=inc_id
    )

    return incident

@router.post("/spawn-demo", response_model=Incident)
def spawn_demo_incident(template_index: int = 0):
    idx = template_index % len(EMERGENCY_TEMPLATES)
    template = EMERGENCY_TEMPLATES[idx]
    return simulator.spawn_synthetic_incident(template)
