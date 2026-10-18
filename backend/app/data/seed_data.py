from typing import List
from app.models.schemas import Hospital, Ambulance, TrafficZone, AmbulanceCareLevel, AmbulanceStatus, HospitalStatus, TrafficCongestion

SEED_HOSPITALS: List[Hospital] = [
    Hospital(
        id="hosp-01",
        name="Metro Central Level-1 Trauma Center",
        address="450 1st Avenue, Metro Core",
        lat=40.7380,
        lng=-73.9780,
        total_beds=320,
        available_beds=48,
        total_icu_beds=36,
        available_icu_beds=6,
        er_wait_time_minutes=18,
        specialties=["TRAUMA_LEVEL_1", "CARDIAC_CATH_LAB", "COMPREHENSIVE_STROKE", "BURN_CENTER"],
        status=HospitalStatus.NORMAL,
        occupancy_rate=0.85
    ),
    Hospital(
        id="hosp-02",
        name="St. Jude Heart & Vascular Institute",
        address="780 Lexington Ave, Midtown East",
        lat=40.7635,
        lng=-73.9680,
        total_beds=210,
        available_beds=32,
        total_icu_beds=24,
        available_icu_beds=8,
        er_wait_time_minutes=12,
        specialties=["CARDIAC_CATH_LAB", "THORACIC_SURGERY"],
        status=HospitalStatus.NORMAL,
        occupancy_rate=0.84
    ),
    Hospital(
        id="hosp-03",
        name="Westside Comprehensive Stroke & Neuro Hospital",
        address="920 10th Avenue, Hell's Kitchen",
        lat=40.7710,
        lng=-73.9910,
        total_beds=180,
        available_beds=26,
        total_icu_beds=20,
        available_icu_beds=5,
        er_wait_time_minutes=15,
        specialties=["COMPREHENSIVE_STROKE", "NEUROSURGERY"],
        status=HospitalStatus.NORMAL,
        occupancy_rate=0.85
    ),
    Hospital(
        id="hosp-04",
        name="Roosevelt Memorial & Pediatric Care",
        address="1000 Amsterdam Ave, Upper West",
        lat=40.7950,
        lng=-73.9670,
        total_beds=250,
        available_beds=55,
        total_icu_beds=28,
        available_icu_beds=10,
        er_wait_time_minutes=22,
        specialties=["TRAUMA_LEVEL_2", "PEDIATRIC", "GENERAL_SURGERY"],
        status=HospitalStatus.NORMAL,
        occupancy_rate=0.78
    ),
    Hospital(
        id="hosp-05",
        name="Downtown Urgent Care & Community Hospital",
        address="170 William Street, Financial District",
        lat=40.7090,
        lng=-74.0060,
        total_beds=140,
        available_beds=8,
        total_icu_beds=12,
        available_icu_beds=1,
        er_wait_time_minutes=42,
        specialties=["GENERAL_EMERGENCY", "BLS_RECEIVING"],
        status=HospitalStatus.SURGE,
        occupancy_rate=0.94
    )
]

SEED_AMBULANCES: List[Ambulance] = [
    Ambulance(
        id="amb-01",
        call_sign="Medic-01 (ALS)",
        type=AmbulanceCareLevel.ALS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7520,
        lng=-73.9850,
        speed_kmh=48.0,
        fuel_level=92,
        paramedic_crew=["S. Connor (Lead CC Paramedic)", "M. Rivera (Paramedic)"],
        equipment=["Cardiac Defibrillator / 12-Lead ECG", "Mechanical Ventilator", "IV Infusion Pump", "Surgical Airway Kit"]
    ),
    Ambulance(
        id="amb-02",
        call_sign="Medic-02 (ALS)",
        type=AmbulanceCareLevel.ALS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7320,
        lng=-73.9920,
        speed_kmh=50.0,
        fuel_level=88,
        paramedic_crew=["D. Vance (Critical Care Paramedic)", "A. Chen (EMT-P)"],
        equipment=["12-Lead Monitor", "Emergency Ultrasound (POCUS)", "LUCAS Chest Compression", "Vascular Access Drill"]
    ),
    Ambulance(
        id="amb-03",
        call_sign="Medic-03 (ALS)",
        type=AmbulanceCareLevel.ALS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7760,
        lng=-73.9540,
        speed_kmh=46.0,
        fuel_level=96,
        paramedic_crew=["T. Jackson (Paramedic)", "K. Walsh (Paramedic)"],
        equipment=["Defibrillator", "IV Meds Kit", "Video Laryngoscope", "Rapid Infuser"]
    ),
    Ambulance(
        id="amb-04",
        call_sign="Medic-04 (ALS)",
        type=AmbulanceCareLevel.ALS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7200,
        lng=-74.0020,
        speed_kmh=45.0,
        fuel_level=82,
        paramedic_crew=["R. Morales (Paramedic)", "J. Kim (EMT-P)"],
        equipment=["Cardiac Monitor", "Airway Suction", "IV Narcotics / Anesthetics", "Trauma Dressing Kit"]
    ),
    Ambulance(
        id="amb-05",
        call_sign="Rescue-11 (BLS)",
        type=AmbulanceCareLevel.BLS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7440,
        lng=-73.9740,
        speed_kmh=52.0,
        fuel_level=90,
        paramedic_crew=["B. Taylor (EMT-Basic)", "C. O'Connor (EMT-Basic)"],
        equipment=["Automated External Defibrillator (AED)", "Oxygen Delivery Kit", "Cervical Collars", "Spine Board"]
    ),
    Ambulance(
        id="amb-06",
        call_sign="Rescue-12 (BLS)",
        type=AmbulanceCareLevel.BLS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7600,
        lng=-73.9980,
        speed_kmh=48.0,
        fuel_level=79,
        paramedic_crew=["L. Martinez (EMT)", "P. Patel (EMT)"],
        equipment=["AED", "Splints & Immobilization", "Oxygen Tank", "Stretcher"]
    ),
    Ambulance(
        id="amb-07",
        call_sign="Rescue-13 (BLS)",
        type=AmbulanceCareLevel.BLS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7850,
        lng=-73.9780,
        speed_kmh=47.0,
        fuel_level=94,
        paramedic_crew=["G. Adams (EMT)", "H. Fischer (EMT)"],
        equipment=["AED", "Trauma First Aid Kit", "Suction Unit", "Wheelchair"]
    ),
    Ambulance(
        id="amb-08",
        call_sign="Medic-05 (ALS)",
        type=AmbulanceCareLevel.ALS,
        status=AmbulanceStatus.AVAILABLE,
        lat=40.7120,
        lng=-73.9880,
        speed_kmh=45.0,
        fuel_level=85,
        paramedic_crew=["E. Wright (Paramedic)", "N. Brooks (Paramedic)"],
        equipment=["Cardiac Defibrillator", "Pediatric Emergency Tape", "Advanced Airway", "IV Meds"]
    )
]

SEED_TRAFFIC_ZONES: List[TrafficZone] = [
    TrafficZone(
        id="tz-01",
        name="Midtown Theater & Times Square Corridor",
        congestion=TrafficCongestion.MODERATE,
        speed_factor=0.75,
        lat_min=40.7500,
        lat_max=40.7620,
        lng_min=-73.9920,
        lng_max=-73.9800
    ),
    TrafficZone(
        id="tz-02",
        name="Lower Manhattan Financial Arterial",
        congestion=TrafficCongestion.LOW,
        speed_factor=0.95,
        lat_min=40.7050,
        lat_max=40.7220,
        lng_min=-74.0150,
        lng_max=-73.9950
    ),
    TrafficZone(
        id="tz-03",
        name="East River FDR Expressway Link",
        congestion=TrafficCongestion.HEAVY,
        speed_factor=0.45,
        lat_min=40.7300,
        lat_max=40.7550,
        lng_min=-73.9750,
        lng_max=-73.9650
    ),
    TrafficZone(
        id="tz-04",
        name="Upper West Broadway Corridor",
        congestion=TrafficCongestion.LOW,
        speed_factor=0.90,
        lat_min=40.7800,
        lat_max=40.8050,
        lng_min=-73.9850,
        lng_max=-73.9600
    )
]
