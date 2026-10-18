from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class IncidentSeverity(int, Enum):
    CRITICAL = 1      # Immediate resuscitation needed (Cardiac, Major Trauma, Stroke)
    EMERGENT = 2      # High urgency, rapid deterioration possible
    URGENT = 3        # Serious condition, stable vital signs
    NON_URGENT = 4    # Minor illness or injury

class AmbulanceCareLevel(str, Enum):
    ALS = "ALS"       # Advanced Life Support (Paramedic, defibrillator, IV/intubation)
    BLS = "BLS"       # Basic Life Support (EMT, oxygen, splints, first aid)

class AmbulanceStatus(str, Enum):
    AVAILABLE = "AVAILABLE"
    DISPATCHED = "DISPATCHED"
    EN_ROUTE = "EN_ROUTE"
    ON_SCENE = "ON_SCENE"
    TRANSPORTING = "TRANSPORTING"
    RETURNING = "RETURNING"
    MAINTENANCE = "MAINTENANCE"

class HospitalStatus(str, Enum):
    NORMAL = "NORMAL"
    SURGE = "SURGE"
    DIVERT = "DIVERT"

class TrafficCongestion(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HEAVY = "HEAVY"
    SEVERE = "SEVERE"

class PatientVitals(BaseModel):
    age: int = 45
    conscious: bool = True
    breathing: bool = True
    severe_bleeding: bool = False
    heart_rate: int = 80
    systolic_bp: int = 120
    spo2: int = 98
    pain_level: int = 5  # 1 to 10

class IncidentBase(BaseModel):
    title: str
    incident_type: str
    address: str
    lat: float
    lng: float
    vitals: PatientVitals = Field(default_factory=PatientVitals)
    caller_notes: Optional[str] = ""

class IncidentCreate(IncidentBase):
    pass

class Incident(IncidentBase):
    id: str
    code: str
    severity: IncidentSeverity
    priority_score: float  # 0 to 100
    mortality_risk_index: float # 0.0 to 1.0
    care_level_required: AmbulanceCareLevel
    status: str = "PENDING_DISPATCH"
    created_at: datetime
    assigned_ambulance_id: Optional[str] = None
    destination_hospital_id: Optional[str] = None
    target_response_time_min: float = 8.0

class Ambulance(BaseModel):
    id: str
    call_sign: str
    type: AmbulanceCareLevel
    status: AmbulanceStatus
    lat: float
    lng: float
    speed_kmh: float = 45.0
    heading_deg: float = 0.0
    assigned_incident_id: Optional[str] = None
    destination_hospital_id: Optional[str] = None
    fuel_level: int = 95
    paramedic_crew: List[str] = []
    equipment: List[str] = []
    target_lat: Optional[float] = None
    target_lng: Optional[float] = None
    eta_seconds: Optional[float] = None
    route_waypoints: List[List[float]] = []

class Hospital(BaseModel):
    id: str
    name: str
    address: str
    lat: float
    lng: float
    total_beds: int
    available_beds: int
    total_icu_beds: int
    available_icu_beds: int
    er_wait_time_minutes: int
    specialties: List[str]
    status: HospitalStatus = HospitalStatus.NORMAL
    occupancy_rate: float = 0.0

class TrafficZone(BaseModel):
    id: str
    name: str
    congestion: TrafficCongestion
    speed_factor: float  # 1.0 = normal, 0.5 = 50% speed
    lat_min: float
    lat_max: float
    lng_min: float
    lng_max: float

class XAIFactorBreakdown(BaseModel):
    proximity_weight: float
    proximity_score: float
    capability_weight: float
    capability_score: float
    hospital_capacity_weight: float
    hospital_capacity_score: float
    traffic_factor_weight: float
    traffic_factor_score: float

class RecommendationCandidate(BaseModel):
    ambulance_id: str
    call_sign: str
    ambulance_type: AmbulanceCareLevel
    eta_minutes: float
    hospital_id: str
    hospital_name: str
    hospital_transit_minutes: float
    total_mission_minutes: float
    match_score: float
    rejection_reasons: List[str] = []

class Recommendation(BaseModel):
    id: str
    incident_id: str
    recommended_ambulance: Ambulance
    recommended_hospital: Hospital
    ambulance_eta_minutes: float
    hospital_transit_minutes: float
    total_mission_minutes: float
    confidence_score: float
    xai_breakdown: XAIFactorBreakdown
    explanation_narrative: str
    secondary_candidates: List[RecommendationCandidate] = []
    created_at: datetime

class DispatchDecisionRequest(BaseModel):
    incident_id: str
    ambulance_id: str
    hospital_id: str
    action: str = "APPROVE"  # "APPROVE", "MODIFY", "REJECT", "REROUTE"
    dispatcher_id: str = "DISPATCHER_01"
    notes: Optional[str] = ""

class SystemAlert(BaseModel):
    id: str
    timestamp: datetime
    level: str  # "INFO", "WARNING", "CRITICAL"
    title: str
    message: str
    related_incident_id: Optional[str] = None
    related_ambulance_id: Optional[str] = None

class DashboardSummary(BaseModel):
    active_incidents_count: int
    available_ambulances_count: int
    busy_ambulances_count: int
    avg_response_time_minutes: float
    ai_optimization_gain_pct: float
    system_load: str
    platform: str
