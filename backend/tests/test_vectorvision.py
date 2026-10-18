import pytest
from app.models.schemas import PatientVitals, IncidentSeverity, AmbulanceCareLevel, AmbulanceStatus
from app.services.ai_models import SeverityPredictor, TravelTimePredictor
from app.services.decision_engine import DecisionEngine
from app.services.simulator import simulator, EMERGENCY_TEMPLATES
from app.data.seed_data import SEED_AMBULANCES, SEED_HOSPITALS, SEED_TRAFFIC_ZONES

def test_severity_predictor_critical():
    vitals = PatientVitals(
        age=65, conscious=False, breathing=False, severe_bleeding=True,
        heart_rate=145, systolic_bp=75, spo2=80, pain_level=10
    )
    severity, care, risk, priority = SeverityPredictor.predict("Cardiac Arrest", vitals)
    assert severity == IncidentSeverity.CRITICAL
    assert care == AmbulanceCareLevel.ALS
    assert risk > 0.80
    assert priority >= 70.0

def test_severity_predictor_minor():
    vitals = PatientVitals(
        age=25, conscious=True, breathing=True, severe_bleeding=False,
        heart_rate=72, systolic_bp=120, spo2=99, pain_level=2
    )
    severity, care, risk, priority = SeverityPredictor.predict("Minor Sprained Ankle", vitals)
    assert severity == IncidentSeverity.NON_URGENT
    assert care == AmbulanceCareLevel.BLS
    assert risk < 0.25

def test_travel_time_predictor():
    lat1, lon1 = 40.7300, -73.9900
    lat2, lon2 = 40.7600, -73.9700
    eta_min, dist_km, speed_kmh = TravelTimePredictor.calculate_eta(lat1, lon1, lat2, lon2, SEED_TRAFFIC_ZONES)
    assert eta_min > 0.0
    assert dist_km > 0.0
    assert speed_kmh > 0.0

def test_decision_engine_recommendation():
    inc = simulator.spawn_synthetic_incident(EMERGENCY_TEMPLATES[0])
    rec = DecisionEngine.generate_recommendation(
        inc, list(simulator.ambulances.values()), list(simulator.hospitals.values()), simulator.traffic_zones
    )
    assert rec is not None
    assert rec.recommended_ambulance is not None
    assert rec.recommended_hospital is not None
    assert rec.confidence_score > 0.5
    assert len(rec.explanation_narrative) > 20

def test_dispatch_lifecycle():
    inc = simulator.spawn_synthetic_incident(EMERGENCY_TEMPLATES[1])
    amb = list(simulator.ambulances.values())[0]
    hosp = list(simulator.hospitals.values())[0]
    
    # Approve dispatch
    success = simulator.approve_dispatch(inc.id, amb.id, hosp.id)
    assert success is True
    assert amb.status == AmbulanceStatus.EN_ROUTE
    assert inc.status == "DISPATCHED"
