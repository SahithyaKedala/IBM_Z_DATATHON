from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import Hospital
from app.services.simulator import simulator

router = APIRouter(prefix="/hospitals", tags=["hospitals"])

@router.get("", response_model=List[Hospital])
def get_hospitals():
    return list(simulator.hospitals.values())

@router.get("/{hospital_id}", response_model=Hospital)
def get_hospital(hospital_id: str):
    if hospital_id not in simulator.hospitals:
        raise HTTPException(status_code=404, detail="Hospital not found")
    return simulator.hospitals[hospital_id]

@router.post("/{hospital_id}/toggle-divert")
def toggle_divert(hospital_id: str):
    msg = simulator.toggle_hospital_divert(hospital_id)
    return {"message": msg, "hospital": simulator.hospitals.get(hospital_id)}
