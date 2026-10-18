import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VectorVision – AI Emergency Dispatch Optimization"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Database
    ENV: str = os.getenv("ENV", "development")
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "sqlite:///./vectorvision.db"
    )
    
    # Simulation settings
    SIMULATION_ENABLED: bool = True
    SIMULATION_TICK_SECONDS: float = 2.0
    AUTO_GENERATE_INCIDENTS: bool = True
    INCIDENT_SPAWN_INTERVAL_SECONDS: int = 18
    
    # Coordinates boundary (Simulated Metropolis / Central Healthcare District)
    # Centered around (40.730610, -73.935242)
    MAP_CENTER_LAT: float = 40.7580
    MAP_CENTER_LNG: float = -73.9855
    MAP_BOUNDS_MIN_LAT: float = 40.7000
    MAP_BOUNDS_MAX_LAT: float = 40.8100
    MAP_BOUNDS_MIN_LNG: float = -74.0200
    MAP_BOUNDS_MAX_LNG: float = -73.9300

    # IBM LinuxONE / Z Deployment metadata
    DEPLOYMENT_PLATFORM: str = os.getenv("DEPLOYMENT_PLATFORM", "IBM LinuxONE / OpenShift s390x Ready")
    
    model_config = {"case_sensitive": True}

settings = Settings()
