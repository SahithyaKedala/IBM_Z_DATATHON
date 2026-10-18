import datetime
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Engine configuration - SQLite connect_args only if sqlite
connect_args = {"check_same_thread": False} if settings.DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class DBIncident(Base):
    __tablename__ = "incidents"
    
    id = Column(String(50), primary_key=True, index=True)
    code = Column(String(20), unique=True, index=True)
    title = Column(String(150))
    incident_type = Column(String(50))
    address = Column(String(255))
    lat = Column(Float)
    lng = Column(Float)
    severity = Column(Integer)  # 1 to 4
    priority_score = Column(Float)
    mortality_risk_index = Column(Float)
    care_level_required = Column(String(10))
    status = Column(String(30), default="PENDING_DISPATCH")
    assigned_ambulance_id = Column(String(50), nullable=True)
    destination_hospital_id = Column(String(50), nullable=True)
    caller_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class DBDispatchLog(Base):
    __tablename__ = "dispatch_logs"
    
    id = Column(String(50), primary_key=True, index=True)
    incident_id = Column(String(50), index=True)
    ambulance_id = Column(String(50))
    hospital_id = Column(String(50))
    action = Column(String(20)) # APPROVE, MODIFY, REJECT, REROUTE
    dispatcher_id = Column(String(50))
    notes = Column(Text, nullable=True)
    ai_recommended_ambulance_id = Column(String(50), nullable=True)
    ai_recommended_hospital_id = Column(String(50), nullable=True)
    ai_concurrence = Column(Boolean, default=True)
    estimated_eta_min = Column(Float)
    actual_response_min = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
