import math
from typing import Dict, Any, Tuple, List
from app.models.schemas import PatientVitals, IncidentSeverity, AmbulanceCareLevel, TrafficZone

class SeverityPredictor:
    """
    Predicts triage severity level, required level of care (ALS vs BLS), 
    and mortality risk index based on patient physiological vitals and incident keywords.
    Modeled on Emergency Severity Index (ESI) v4 guidelines.
    """
    
    CRITICAL_KEYWORDS = {
        "arrest", "unconscious", "unresponsive", "apnea", "not breathing", 
        "gunshot", "stabbing", "massive bleeding", "cyanosis", "anaphylaxis",
        "cardiac", "ventricular", "pulseless"
    }
    
    EMERGENT_KEYWORDS = {
        "chest pain", "stemi", "stroke", "facial droop", "slurred speech", 
        "seizure", "severe burn", "asthma attack", "difficulty breathing", 
        "head injury", "amputation", "poisoning"
    }

    @classmethod
    def predict(cls, incident_type: str, vitals: PatientVitals) -> Tuple[IncidentSeverity, AmbulanceCareLevel, float, float]:
        """
        Returns:
            (severity_level, required_care, mortality_risk_index, priority_score)
        """
        lower_type = incident_type.lower()
        risk_points = 0.0
        
        # 1. Keyword indicators
        is_critical_type = any(kw in lower_type for kw in cls.CRITICAL_KEYWORDS)
        is_emergent_type = any(kw in lower_type for kw in cls.EMERGENT_KEYWORDS)
        
        if is_critical_type:
            risk_points += 55.0
        elif is_emergent_type:
            risk_points += 35.0

        # 2. Vital signs evaluation
        if not vitals.breathing or not vitals.conscious:
            risk_points += 60.0
            
        if vitals.severe_bleeding:
            risk_points += 40.0
            
        if vitals.spo2 < 88:
            risk_points += 35.0
        elif vitals.spo2 < 92:
            risk_points += 20.0
            
        if vitals.heart_rate < 45 or vitals.heart_rate > 135:
            risk_points += 25.0
        elif vitals.heart_rate > 115 or vitals.heart_rate < 55:
            risk_points += 15.0
            
        if vitals.systolic_bp < 85: # Shock
            risk_points += 35.0
        elif vitals.systolic_bp > 200 or vitals.systolic_bp < 95:
            risk_points += 20.0
            
        if vitals.pain_level >= 8:
            risk_points += 15.0
            
        if vitals.age > 70 or vitals.age < 5:
            risk_points += 10.0

        # Compute continuous mortality risk index via sigmoid (0.0 to 1.0)
        # Shifted so median risk sits at ~0.15, extreme points reach >0.90
        mortality_risk_index = round(1.0 / (1.0 + math.exp(-((risk_points - 45.0) / 14.0))), 3)
        priority_score = min(100.0, round(risk_points * 1.1, 1))

        # Triage Category & Care Level Classification
        if risk_points >= 60.0 or not vitals.breathing or not vitals.conscious:
            severity = IncidentSeverity.CRITICAL
            care_level = AmbulanceCareLevel.ALS
        elif risk_points >= 35.0 or vitals.spo2 < 92 or vitals.severe_bleeding:
            severity = IncidentSeverity.EMERGENT
            care_level = AmbulanceCareLevel.ALS
        elif risk_points >= 18.0:
            severity = IncidentSeverity.URGENT
            care_level = AmbulanceCareLevel.BLS
        else:
            severity = IncidentSeverity.NON_URGENT
            care_level = AmbulanceCareLevel.BLS

        return severity, care_level, mortality_risk_index, priority_score


class TravelTimePredictor:
    """
    Computes road travel distance, traffic-adjusted speed, and predicted ETA (minutes).
    Generates realistic route waypoints along Manhattan-style street grids.
    """

    @staticmethod
    def haversine_distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        R = 6371.0 # Earth radius in km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = (math.sin(dlat / 2.0) ** 2 +
             math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
             math.sin(dlon / 2.0) ** 2)
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    @classmethod
    def calculate_eta(
        cls, 
        start_lat: float, 
        start_lng: float, 
        end_lat: float, 
        end_lng: float,
        traffic_zones: List[TrafficZone],
        is_emergency: bool = True
    ) -> Tuple[float, float, float]:
        """
        Returns:
            (eta_minutes, distance_km, effective_speed_kmh)
        """
        straight_km = cls.haversine_distance_km(start_lat, start_lng, end_lat, end_lng)
        # Urban circuity factor (Manhattan street grid routing factor ~1.28)
        road_distance_km = straight_km * 1.28

        # Base metropolitan ambulance speed
        base_speed_kmh = 42.0

        # Traffic zone speed factor (find if path crosses any congested zone)
        mid_lat = (start_lat + end_lat) / 2.0
        mid_lng = (start_lng + end_lng) / 2.0
        
        traffic_modifier = 1.0
        for zone in traffic_zones:
            if (zone.lat_min <= mid_lat <= zone.lat_max and 
                zone.lng_min <= mid_lng <= zone.lng_max):
                traffic_modifier = min(traffic_modifier, zone.speed_factor)

        # Siren bonus (Emergency vehicles get ~25% speed advantage through traffic)
        siren_bonus = 1.22 if is_emergency else 1.0
        effective_speed_kmh = max(18.0, base_speed_kmh * traffic_modifier * siren_bonus)

        # Travel time in hours converted to minutes
        eta_minutes = round((road_distance_km / effective_speed_kmh) * 60.0, 1)
        return eta_minutes, round(road_distance_km, 2), round(effective_speed_kmh, 1)

    @classmethod
    def generate_waypoints(
        cls, 
        start_lat: float, 
        start_lng: float, 
        end_lat: float, 
        end_lng: float, 
        steps: int = 8
    ) -> List[List[float]]:
        """
        Generates realistic Manhattan grid turn waypoints between two coordinates.
        """
        waypoints = [[start_lat, start_lng]]
        # Manhattan street corner turn midpoint
        corner_lat = start_lat
        corner_lng = end_lng
        
        # Segment 1: start to corner
        for i in range(1, steps // 2):
            frac = i / (steps / 2)
            waypoints.append([
                start_lat,
                start_lng + frac * (corner_lng - start_lng)
            ])
            
        waypoints.append([corner_lat, corner_lng])
        
        # Segment 2: corner to end
        for i in range(1, steps // 2):
            frac = i / (steps / 2)
            waypoints.append([
                corner_lat + frac * (end_lat - corner_lat),
                end_lng
            ])
            
        waypoints.append([end_lat, end_lng])
        return waypoints
