from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.schemas import Ambulance, AmbulanceStatus
from app.services.simulator import simulator

router = APIRouter(prefix="/ambulances", tags=["ambulances"])

@router.get("", response_model=List[Ambulance])
def get_ambulances(status: Optional[str] = None):
    ambs = list(simulator.ambulances.values())
    if status:
        ambs = [a for a in ambs if a.status == status]
    return ambs

@router.get("/{ambulance_id}", response_model=Ambulance)
def get_ambulance(ambulance_id: str):
    if ambulance_id not in simulator.ambulances:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    return simulator.ambulances[ambulance_id]

@router.post("/{ambulance_id}/status")
def update_status(ambulance_id: str, new_status: AmbulanceStatus):
    if ambulance_id not in simulator.ambulances:
        raise HTTPException(status_code=404, detail="Ambulance not found")
    amb = simulator.ambulances[ambulance_id]
    amb.status = new_status
    if new_status == AmbulanceStatus.AVAILABLE:
        amb.assigned_incident_id = None
        amb.destination_hospital_id = None
        amb.target_lat = None
        amb.target_lng = None
        amb.route_waypoints = []
    return {"status": "success", "ambulance": amb}
