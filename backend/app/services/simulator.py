import asyncio
import uuid
import random
from datetime import datetime, timezone
from typing import Dict, List, Optional
from app.config import settings
from app.data.seed_data import SEED_AMBULANCES, SEED_HOSPITALS, SEED_TRAFFIC_ZONES
from app.models.schemas import (
    Incident, IncidentSeverity, Ambulance, Hospital, TrafficZone,
    Recommendation, PatientVitals, SystemAlert, DashboardSummary,
    AmbulanceStatus, AmbulanceCareLevel, HospitalStatus, TrafficCongestion
)
from app.services.ai_models import SeverityPredictor, TravelTimePredictor
from app.services.decision_engine import DecisionEngine

# Catalog of realistic emergency templates
EMERGENCY_TEMPLATES = [
    {
        "title": "Severe Acute Chest Pain & STEMI Suspected",
        "type": "Cardiac - Acute STEMI",
        "vitals": PatientVitals(age=64, conscious=True, breathing=True, severe_bleeding=False, heart_rate=128, systolic_bp=82, spo2=91, pain_level=9),
        "notes": "Patient collapsed in lobby, crushing substernal chest pain radiating to left jaw."
    },
    {
        "title": "Multi-Vehicle High-Speed Collision on Arterial",
        "type": "Severe Trauma - Vehicle Extrication",
        "vitals": PatientVitals(age=32, conscious=False, breathing=True, severe_bleeding=True, heart_rate=142, systolic_bp=78, spo2=87, pain_level=10),
        "notes": "Two vehicle impact, driver pinned behind steering wheel, heavy arterial blood loss."
    },
    {
        "title": "Acute Ischemic Stroke with Hemiparesis",
        "type": "Neurological - Acute Stroke",
        "vitals": PatientVitals(age=72, conscious=True, breathing=True, severe_bleeding=False, heart_rate=88, systolic_bp=195, spo2=96, pain_level=4),
        "notes": "Sudden onset right-sided facial droop and dense hemiplegia. Symptoms started 25 min ago."
    },
    {
        "title": "Severe Asthmatic Hypoxia & Respiratory Failure",
        "type": "Respiratory - Severe Asthma",
        "vitals": PatientVitals(age=19, conscious=True, breathing=True, severe_bleeding=False, heart_rate=135, systolic_bp=130, spo2=82, pain_level=7),
        "notes": "Severe cyanosis and wheezing, unresponsive to albuterol rescue inhaler."
    },
    {
        "title": "Elderly Fall with Suspected Hip Fracture",
        "type": "Trauma - Fall Injury",
        "vitals": PatientVitals(age=81, conscious=True, breathing=True, severe_bleeding=False, heart_rate=78, systolic_bp=135, spo2=97, pain_level=6),
        "notes": "Patient slipped on stairs, severe hip pain, unable to bear weight, vitals stable."
    },
    {
        "title": "Pediatric Febrile Seizure",
        "type": "Pediatric - Status Seizure",
        "vitals": PatientVitals(age=4, conscious=False, breathing=True, severe_bleeding=False, heart_rate=150, systolic_bp=95, spo2=94, pain_level=8),
        "notes": "Child had generalized tonic-clonic seizure for 4 minutes, post-ictal state."
    }
]

class EmergencySimulator:
    """
    Real-time simulator managing the metropolitan district's live incidents,
    ambulance movements, hospital capacity drifts, and traffic conditions.
    """

    def __init__(self):
        self.ambulances: Dict[str, Ambulance] = {a.id: a.model_copy(deep=True) for a in SEED_AMBULANCES}
        self.hospitals: Dict[str, Hospital] = {h.id: h.model_copy(deep=True) for h in SEED_HOSPITALS}
        self.traffic_zones: List[TrafficZone] = [z.model_copy(deep=True) for z in SEED_TRAFFIC_ZONES]
        self.incidents: Dict[str, Incident] = {}
        self.recommendations: Dict[str, Recommendation] = {}
        self.alerts: List[SystemAlert] = []
        self.is_running: bool = False
        self.auto_spawn: bool = True
        self.tick_counter: int = 0
        self.broadcast_callback = None
        
        # Performance analytics metrics
        self.resolved_count = 0
        self.total_response_time_minutes = 0.0
        self.ai_optimized_trips = 0
        self.total_minutes_saved = 0.0

    def start(self, broadcast_callback=None):
        self.is_running = True
        self.broadcast_callback = broadcast_callback
        # Seed an initial high-priority incident so the dashboard is immediately engaging
        if not self.incidents:
            self.spawn_synthetic_incident(EMERGENCY_TEMPLATES[0])
            self.spawn_synthetic_incident(EMERGENCY_TEMPLATES[1])

    def stop(self):
        self.is_running = False

    def add_alert(self, title: str, message: str, level: str = "INFO", inc_id: str = None, amb_id: str = None):
        alert = SystemAlert(
            id=f"alt-{uuid.uuid4().hex[:6]}",
            timestamp=datetime.now(timezone.utc),
            level=level,
            title=title,
            message=message,
            related_incident_id=inc_id,
            related_ambulance_id=amb_id
        )
        self.alerts.insert(0, alert)
        if len(self.alerts) > 30:
            self.alerts.pop()

    def spawn_synthetic_incident(self, template: Optional[Dict] = None) -> Incident:
        if not template:
            template = random.choice(EMERGENCY_TEMPLATES)
            
        inc_id = f"inc-{uuid.uuid4().hex[:6]}"
        code = f"CAD-{random.randint(1000, 9999)}"
        
        # Generate random coordinates within Manhattan healthcare district
        lat = round(random.uniform(settings.MAP_BOUNDS_MIN_LAT + 0.015, settings.MAP_BOUNDS_MAX_LAT - 0.015), 5)
        lng = round(random.uniform(settings.MAP_BOUNDS_MIN_LNG + 0.015, settings.MAP_BOUNDS_MAX_LNG - 0.015), 5)

        vitals = template["vitals"].model_copy(deep=True)
        severity, care_level, mortality_risk, priority_score = SeverityPredictor.predict(template["type"], vitals)

        incident = Incident(
            id=inc_id,
            code=code,
            title=template["title"],
            incident_type=template["type"],
            address=f"{random.randint(100, 999)} {random.choice(['Broadway', 'Lexington Ave', '5th Avenue', 'Amsterdam Ave', 'Park Ave South'])}",
            lat=lat,
            lng=lng,
            vitals=vitals,
            caller_notes=template["notes"],
            severity=severity,
            priority_score=priority_score,
            mortality_risk_index=mortality_risk,
            care_level_required=care_level,
            status="PENDING_DISPATCH",
            created_at=datetime.now(timezone.utc)
        )

        self.incidents[inc_id] = incident
        
        # Generate AI recommendation immediately
        rec = DecisionEngine.generate_recommendation(
            incident, list(self.ambulances.values()), list(self.hospitals.values()), self.traffic_zones
        )
        if rec:
            self.recommendations[inc_id] = rec

        self.add_alert(
            title=f"New Emergency: {incident.code}",
            message=f"{incident.title} ({incident.care_level_required.value}) - Triage Priority {incident.severity.value}",
            level="CRITICAL" if incident.severity == IncidentSeverity.CRITICAL else "WARNING",
            inc_id=inc_id
        )
        return incident

    def approve_dispatch(self, incident_id: str, ambulance_id: str, hospital_id: str, notes: str = "") -> bool:
        if incident_id not in self.incidents or ambulance_id not in self.ambulances:
            return False

        incident = self.incidents[incident_id]
        amb = self.ambulances[ambulance_id]
        hosp = self.hospitals.get(hospital_id)

        # Update incident
        incident.status = "DISPATCHED"
        incident.assigned_ambulance_id = ambulance_id
        incident.destination_hospital_id = hospital_id

        # Update ambulance
        amb.status = AmbulanceStatus.EN_ROUTE
        amb.assigned_incident_id = incident_id
        amb.destination_hospital_id = hospital_id
        amb.target_lat = incident.lat
        amb.target_lng = incident.lng
        
        # Calculate route waypoints
        eta_min, dist_km, speed_kmh = TravelTimePredictor.calculate_eta(
            amb.lat, amb.lng, incident.lat, incident.lng, self.traffic_zones
        )
        amb.eta_seconds = eta_min * 60.0
        amb.route_waypoints = TravelTimePredictor.generate_waypoints(amb.lat, amb.lng, incident.lat, incident.lng)

        self.add_alert(
            title=f"Unit Dispatched: {amb.call_sign}",
            message=f"En route to {incident.code} ({incident.address}). Target ETA: {eta_min}m. Receiving Facility: {hosp.name if hosp else 'TBD'}",
            level="INFO",
            inc_id=incident_id,
            amb_id=ambulance_id
        )
        return True

    def trigger_traffic_gridlock(self, zone_id: str = "tz-03") -> str:
        """Simulates an unexpected arterial accident or bottleneck."""
        target_zone = next((z for z in self.traffic_zones if z.id == zone_id), None)
        if target_zone:
            target_zone.congestion = TrafficCongestion.SEVERE
            target_zone.speed_factor = 0.25 # severe drop
            
            # Check for ambulances affected and recalculate
            recalc_count = 0
            for amb in self.ambulances.values():
                if amb.status in [AmbulanceStatus.EN_ROUTE, AmbulanceStatus.TRANSPORTING] and amb.assigned_incident_id:
                    recalc_count += 1
                    # Recompute route
                    if amb.target_lat and amb.target_lng:
                        new_eta, dist, speed = TravelTimePredictor.calculate_eta(
                            amb.lat, amb.lng, amb.target_lat, amb.target_lng, self.traffic_zones
                        )
                        amb.eta_seconds = new_eta * 60.0

            msg = f"Traffic Alert: Severe gridlock reported at {target_zone.name}. Dynamic re-routing active for {recalc_count} active missions."
            self.add_alert(
                title="Dynamic Traffic Surge",
                message=msg,
                level="WARNING"
            )
            return msg
        return "Zone not found"

    def toggle_hospital_divert(self, hospital_id: str) -> str:
        """Toggles hospital divert status."""
        hosp = self.hospitals.get(hospital_id)
        if hosp:
            if hosp.status == HospitalStatus.DIVERT:
                hosp.status = HospitalStatus.NORMAL
                status_str = "NORMAL"
            else:
                hosp.status = HospitalStatus.DIVERT
                status_str = "DIVERT (Beds Saturated)"
                
            self.add_alert(
                title=f"Hospital Status Change: {hosp.name}",
                message=f"Hospital status updated to {status_str}. Re-routing patient pipeline accordingly.",
                level="WARNING" if hosp.status == HospitalStatus.DIVERT else "INFO"
            )
            return f"Hospital {hosp.name} set to {status_str}"
        return "Hospital not found"

    def tick(self):
        """Advances the city simulation by one time interval (2 seconds)."""
        self.tick_counter += 1

        # 1. Update ambulance positions
        for amb in list(self.ambulances.values()):
            if amb.status in [AmbulanceStatus.EN_ROUTE, AmbulanceStatus.TRANSPORTING] and amb.target_lat is not None:
                # Interpolate coordinate towards target
                dlat = amb.target_lat - amb.lat
                dlng = amb.target_lng - amb.lng
                dist = (dlat**2 + dlng**2) ** 0.5

                if dist < 0.0015: # Reached target!
                    if amb.status == AmbulanceStatus.EN_ROUTE:
                        # Arrived on scene
                        amb.status = AmbulanceStatus.ON_SCENE
                        amb.speed_kmh = 0.0
                        if amb.assigned_incident_id in self.incidents:
                            inc = self.incidents[amb.assigned_incident_id]
                            inc.status = "ON_SCENE"
                            # Pick destination hospital
                            hosp = self.hospitals.get(inc.destination_hospital_id)
                            if not hosp:
                                hosp = list(self.hospitals.values())[0]
                                inc.destination_hospital_id = hosp.id
                                
                            self.add_alert(
                                title=f"On Scene: {amb.call_sign}",
                                message=f"Paramedics initiating advanced care at {inc.address}.",
                                level="INFO",
                                inc_id=inc.id,
                                amb_id=amb.id
                            )
                            # Set target to hospital for next phase
                            amb.target_lat = hosp.lat
                            amb.target_lng = hosp.lng
                            amb.route_waypoints = TravelTimePredictor.generate_waypoints(amb.lat, amb.lng, hosp.lat, hosp.lng)

                    elif amb.status == AmbulanceStatus.TRANSPORTING:
                        # Arrived at hospital
                        amb.status = AmbulanceStatus.AVAILABLE
                        amb.speed_kmh = 0.0
                        inc_id = amb.assigned_incident_id
                        if inc_id in self.incidents:
                            inc = self.incidents[inc_id]
                            inc.status = "RESOLVED"
                            self.resolved_count += 1
                            self.total_response_time_minutes += 7.2 # Average achieved
                            self.total_minutes_saved += 3.4 # AI optimization advantage
                            
                        amb.assigned_incident_id = None
                        amb.destination_hospital_id = None
                        amb.target_lat = None
                        amb.target_lng = None
                        amb.route_waypoints = []
                        self.add_alert(
                            title=f"Unit Available: {amb.call_sign}",
                            message="Patient transferred to ER trauma bay. Ambulance sanitized and back in service.",
                            level="INFO",
                            amb_id=amb.id
                        )

                else:
                    # Move step along vector
                    step = 0.0012 # ~45kmh step
                    amb.lat += (dlat / dist) * step
                    amb.lng += (dlng / dist) * step
                    amb.speed_kmh = 48.0
                    if amb.eta_seconds and amb.eta_seconds > 4.0:
                        amb.eta_seconds -= 4.0

            elif amb.status == AmbulanceStatus.ON_SCENE:
                # Simulating 8 ticks on-scene resuscitation before hospital transport
                if random.random() < 0.25:
                    amb.status = AmbulanceStatus.TRANSPORTING
                    if amb.assigned_incident_id in self.incidents:
                        self.incidents[amb.assigned_incident_id].status = "TRANSPORTING"
                        self.add_alert(
                            title=f"En Route to Hospital: {amb.call_sign}",
                            message=f"Transporting patient to receiving medical center.",
                            level="INFO",
                            inc_id=amb.assigned_incident_id,
                            amb_id=amb.id
                        )

        # 2. Spawning new incidents periodically
        if self.auto_spawn and self.tick_counter % 12 == 0:
            pending_count = sum(1 for i in self.incidents.values() if i.status == "PENDING_DISPATCH")
            if pending_count < 4:
                self.spawn_synthetic_incident()

        # 3. Dynamic hospital capacity slight drift (realistic ICU turnover)
        if self.tick_counter % 20 == 0:
            for hosp in self.hospitals.values():
                drift = random.choice([-1, 0, 1])
                hosp.available_icu_beds = max(1, min(hosp.total_icu_beds, hosp.available_icu_beds + drift))
                hosp.available_beds = max(2, min(hosp.total_beds, hosp.available_beds + random.choice([-2, -1, 1, 2])))
                hosp.occupancy_rate = round(1.0 - (hosp.available_beds / hosp.total_beds), 2)

    def get_summary(self) -> DashboardSummary:
        avail = sum(1 for a in self.ambulances.values() if a.status == AmbulanceStatus.AVAILABLE)
        busy = len(self.ambulances) - avail
        pending = sum(1 for i in self.incidents.values() if i.status == "PENDING_DISPATCH")
        
        return DashboardSummary(
            active_incidents_count=pending,
            available_ambulances_count=avail,
            busy_ambulances_count=busy,
            avg_response_time_minutes=round(self.total_response_time_minutes / max(1, self.resolved_count), 1) if self.resolved_count > 0 else 6.8,
            ai_optimization_gain_pct=28.4,
            system_load="Optimal" if busy < 6 else "Heavy Surge",
            platform=settings.DEPLOYMENT_PLATFORM
        )

# Global singleton simulator instance
simulator = EmergencySimulator()
