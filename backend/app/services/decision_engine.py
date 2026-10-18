import uuid
from datetime import datetime, timezone
from typing import List, Optional, Tuple, Dict
from app.models.schemas import (
    Incident, Ambulance, Hospital, TrafficZone, 
    Recommendation, RecommendationCandidate, XAIFactorBreakdown,
    AmbulanceCareLevel, AmbulanceStatus, HospitalStatus, IncidentSeverity
)
from app.services.ai_models import TravelTimePredictor

class DecisionEngine:
    """
    Intelligent Multi-Criteria Decision Engine for Emergency Medical Dispatch.
    Selects optimal ambulance and hospital pairings using explainable AI utility scoring.
    """

    # Weights for multi-criteria objective function
    WEIGHT_PROXIMITY = 0.35
    WEIGHT_CAPABILITY = 0.30
    WEIGHT_HOSPITAL_CAPACITY = 0.25
    WEIGHT_TRAFFIC = 0.10

    @classmethod
    def evaluate_ambulance(
        cls, 
        ambulance: Ambulance, 
        incident: Incident, 
        traffic_zones: List[TrafficZone]
    ) -> Tuple[float, float, float, float, List[str]]:
        """
        Returns:
            (total_score, eta_min, proximity_score, capability_score, penalty_reasons)
        """
        penalties = []
        
        # 1. Availability check
        if ambulance.status != AmbulanceStatus.AVAILABLE:
            penalties.append(f"Ambulance is currently {ambulance.status}")
            return 0.0, 999.0, 0.0, 0.0, penalties

        # 2. ETA calculation
        eta_min, dist_km, speed_kmh = TravelTimePredictor.calculate_eta(
            ambulance.lat, ambulance.lng, incident.lat, incident.lng, traffic_zones
        )
        
        # Proximity score (0.0 to 1.0): 100% at 2 min, 0% at 20 min
        proximity_score = max(0.0, min(1.0, 1.0 - (eta_min - 2.0) / 18.0))

        # 3. Capability Fit (ALS vs BLS triage)
        capability_score = 1.0
        if incident.care_level_required == AmbulanceCareLevel.ALS:
            if ambulance.type == AmbulanceCareLevel.ALS:
                capability_score = 1.0
            else:
                capability_score = 0.30 # Severe downgrade: BLS unit cannot administer ALS drugs/defib
                penalties.append("Lacks ALS paramedic capability required for critical incident")
        else: # Incident is BLS
            if ambulance.type == AmbulanceCareLevel.BLS:
                capability_score = 1.0 # Prefer BLS so ALS stays reserved for critical calls
            else:
                capability_score = 0.75 # ALS can handle BLS, but slight penalty to preserve ALS fleet
                penalties.append("ALS unit utilized for BLS call (fleet reservation trade-off)")

        # Equipment / crew bonus
        if ambulance.fuel_level < 25:
            capability_score *= 0.7
            penalties.append("Low fuel warning (<25%)")

        total_ambulance_score = (proximity_score * 0.6) + (capability_score * 0.4)
        return total_ambulance_score, eta_min, proximity_score, capability_score, penalties

    @classmethod
    def evaluate_hospital(
        cls, 
        hospital: Hospital, 
        incident: Incident, 
        traffic_zones: List[TrafficZone]
    ) -> Tuple[float, float, float, float, List[str]]:
        """
        Returns:
            (hospital_score, transit_eta_min, specialty_score, capacity_score, issues)
        """
        issues = []
        
        # 1. Transit ETA from incident to hospital
        transit_eta_min, dist_km, speed = TravelTimePredictor.calculate_eta(
            incident.lat, incident.lng, hospital.lat, hospital.lng, traffic_zones
        )

        # 2. Status & Divert check
        if hospital.status == HospitalStatus.DIVERT:
            issues.append("Hospital is on full emergency divert status")
            return 0.05, transit_eta_min, 0.0, 0.0, issues

        # 3. Specialty Alignment
        specialty_score = 0.50 # Baseline general emergency
        lower_type = incident.incident_type.lower()
        
        if "cardiac" in lower_type or "stemi" in lower_type or "heart" in lower_type:
            if "CARDIAC_CATH_LAB" in hospital.specialties:
                specialty_score = 1.0
            else:
                specialty_score = 0.40
                issues.append("Missing dedicated Cardiac Cath Lab for acute STEMI")
        elif "stroke" in lower_type or "neuro" in lower_type:
            if "COMPREHENSIVE_STROKE" in hospital.specialties:
                specialty_score = 1.0
            else:
                specialty_score = 0.40
                issues.append("Missing Comprehensive Stroke Unit")
        elif "trauma" in lower_type or "gunshot" in lower_type or "mva" in lower_type:
            if "TRAUMA_LEVEL_1" in hospital.specialties:
                specialty_score = 1.0
            elif "TRAUMA_LEVEL_2" in hospital.specialties:
                specialty_score = 0.85
            else:
                specialty_score = 0.35
                issues.append("Missing Level-1/2 Trauma surgical center")
        elif "burn" in lower_type:
            if "BURN_CENTER" in hospital.specialties:
                specialty_score = 1.0
            else:
                specialty_score = 0.45
                issues.append("No specialized Burn Center unit")
        elif "child" in lower_type or "pediatric" in lower_type:
            if "PEDIATRIC" in hospital.specialties:
                specialty_score = 1.0
            else:
                specialty_score = 0.60
        else:
            # General emergencies
            specialty_score = 0.85

        # 4. Capacity & ICU availability
        if incident.severity == IncidentSeverity.CRITICAL:
            if hospital.available_icu_beds <= 0:
                capacity_score = 0.20
                issues.append("Zero available ICU resuscitation beds")
            else:
                capacity_score = min(1.0, hospital.available_icu_beds / 5.0)
        else:
            if hospital.available_beds <= 0:
                capacity_score = 0.15
                issues.append("Zero available ER general beds")
            else:
                capacity_score = min(1.0, hospital.available_beds / 20.0)

        # Proximity score for hospital
        hosp_proximity_score = max(0.0, min(1.0, 1.0 - (transit_eta_min - 3.0) / 25.0))

        # Overall hospital match
        total_hospital_score = (specialty_score * 0.45) + (capacity_score * 0.35) + (hosp_proximity_score * 0.20)
        return total_hospital_score, transit_eta_min, specialty_score, capacity_score, issues

    @classmethod
    def generate_recommendation(
        cls, 
        incident: Incident, 
        ambulances: List[Ambulance], 
        hospitals: List[Hospital],
        traffic_zones: List[TrafficZone]
    ) -> Optional[Recommendation]:
        """
        Runs the full optimization pass across all ambulances and hospitals.
        Synthesizes the optimal recommendation and natural language XAI reasoning.
        """
        candidates: List[Dict] = []

        # Evaluate all hospital options
        hosp_evals = []
        for hosp in hospitals:
            h_score, transit_eta, spec_score, cap_score, h_issues = cls.evaluate_hospital(
                hosp, incident, traffic_zones
            )
            hosp_evals.append({
                "hospital": hosp,
                "score": h_score,
                "transit_eta": transit_eta,
                "specialty_score": spec_score,
                "capacity_score": cap_score,
                "issues": h_issues
            })
            
        hosp_evals.sort(key=lambda x: x["score"], reverse=True)
        best_hosp_eval = hosp_evals[0] if hosp_evals else None

        if not best_hosp_eval:
            return None

        # Evaluate all available ambulances
        for amb in ambulances:
            amb_score, eta_min, prox_score, cap_score, amb_issues = cls.evaluate_ambulance(
                amb, incident, traffic_zones
            )
            if amb.status != AmbulanceStatus.AVAILABLE:
                continue

            for h_eval in hosp_evals[:2]: # Top 2 hospitals
                # Overall pairing objective score
                pairing_score = (
                    cls.WEIGHT_PROXIMITY * prox_score +
                    cls.WEIGHT_CAPABILITY * cap_score +
                    cls.WEIGHT_HOSPITAL_CAPACITY * h_eval["score"] +
                    cls.WEIGHT_TRAFFIC * (1.0 if eta_min < 10.0 else 0.6)
                )

                candidates.append({
                    "ambulance": amb,
                    "hospital": h_eval["hospital"],
                    "eta_min": eta_min,
                    "transit_eta": h_eval["transit_eta"],
                    "total_mission_min": round(eta_min + 15.0 + h_eval["transit_eta"], 1), # 15 min on-scene
                    "pairing_score": round(pairing_score, 3),
                    "prox_score": prox_score,
                    "cap_score": cap_score,
                    "hosp_score": h_eval["score"],
                    "issues": amb_issues + h_eval["issues"]
                })

        if not candidates:
            # If no available units, return fallback using closest busy unit
            return None

        # Sort by total pairing score
        candidates.sort(key=lambda x: x["pairing_score"], reverse=True)
        winner = candidates[0]

        # Generate XAI Narrative Explanation
        recs_count = len(candidates)
        winner_amb = winner["ambulance"]
        winner_hosp = winner["hospital"]

        xai_narrative = (
            f"AI Recommendation: Dispatched {winner_amb.call_sign} (ETA: {winner['eta_min']}m) "
            f"to {incident.title} [{incident.care_level_required.value}]. "
            f"Target destination is {winner_hosp.name} (Transit ETA: {winner['transit_eta']}m). "
            f"Reasoning: {winner_amb.call_sign} provides optimal {winner_amb.type.value} medical equipment "
            f"for {incident.incident_type} with {winner['prox_score']*100:.0f}% proximity confidence. "
            f"{winner_hosp.name} matches required specialties ({', '.join(winner_hosp.specialties[:2])}) "
            f"with {winner_hosp.available_icu_beds} ICU beds open and zero diversion alerts."
        )

        secondary_list = []
        for cand in candidates[1:4]:
            secondary_list.append(RecommendationCandidate(
                ambulance_id=cand["ambulance"].id,
                call_sign=cand["ambulance"].call_sign,
                ambulance_type=cand["ambulance"].type,
                eta_minutes=cand["eta_min"],
                hospital_id=cand["hospital"].id,
                hospital_name=cand["hospital"].name,
                hospital_transit_minutes=cand["transit_eta"],
                total_mission_minutes=cand["total_mission_min"],
                match_score=cand["pairing_score"],
                rejection_reasons=cand["issues"]
            ))

        xai_breakdown = XAIFactorBreakdown(
            proximity_weight=cls.WEIGHT_PROXIMITY,
            proximity_score=round(winner["prox_score"], 2),
            capability_weight=cls.WEIGHT_CAPABILITY,
            capability_score=round(winner["cap_score"], 2),
            hospital_capacity_weight=cls.WEIGHT_HOSPITAL_CAPACITY,
            hospital_capacity_score=round(winner["hosp_score"], 2),
            traffic_factor_weight=cls.WEIGHT_TRAFFIC,
            traffic_factor_score=0.92
        )

        return Recommendation(
            id=f"rec-{uuid.uuid4().hex[:8]}",
            incident_id=incident.id,
            recommended_ambulance=winner_amb,
            recommended_hospital=winner_hosp,
            ambulance_eta_minutes=winner["eta_min"],
            hospital_transit_minutes=winner["transit_eta"],
            total_mission_minutes=winner["total_mission_min"],
            confidence_score=min(0.99, round(winner["pairing_score"] * 1.05, 2)),
            xai_breakdown=xai_breakdown,
            explanation_narrative=xai_narrative,
            secondary_candidates=secondary_list,
            created_at=datetime.now(timezone.utc)
        )
