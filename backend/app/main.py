import asyncio
import json
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.models.database import init_db
from app.services.simulator import simulator
from app.routers import incidents, ambulances, hospitals, dispatch, analytics

# Active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(json.dumps(message, default=str))
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background simulation runner
async def simulation_loop():
    while simulator.is_running:
        try:
            simulator.tick()
            
            # Broadcast snapshot to frontend
            payload = {
                "type": "TICK",
                "summary": simulator.get_summary().model_dump(),
                "ambulances": [a.model_dump() for a in simulator.ambulances.values()],
                "incidents": [i.model_dump() for i in simulator.incidents.values()],
                "hospitals": [h.model_dump() for h in simulator.hospitals.values()],
                "traffic_zones": [z.model_dump() for z in simulator.traffic_zones],
                "alerts": [alt.model_dump() for alt in simulator.alerts[:8]]
            }
            await manager.broadcast(payload)
        except Exception as e:
            print(f"[Simulator Tick Error]: {e}")
            
        await asyncio.sleep(settings.SIMULATION_TICK_SECONDS)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database and start simulator
    init_db()
    simulator.start()
    sim_task = asyncio.create_task(simulation_loop())
    print("VectorVision simulation engine started.")
    yield
    # Shutdown
    simulator.stop()
    sim_task.cancel()
    print("VectorVision simulation engine stopped.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(incidents.router, prefix=settings.API_V1_STR)
app.include_router(ambulances.router, prefix=settings.API_V1_STR)
app.include_router(hospitals.router, prefix=settings.API_V1_STR)
app.include_router(dispatch.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "platform": settings.DEPLOYMENT_PLATFORM,
        "active_incidents": len(simulator.incidents),
        "fleet_size": len(simulator.ambulances),
        "hospitals_monitored": len(simulator.hospitals)
    }

@app.websocket("/ws/dispatch")
async def websocket_dispatch_stream(websocket: WebSocket):
    await manager.connect(websocket)
    # Send initial full state immediately upon connection
    initial_payload = {
        "type": "INITIAL_STATE",
        "summary": simulator.get_summary().model_dump(),
        "ambulances": [a.model_dump() for a in simulator.ambulances.values()],
        "incidents": [i.model_dump() for i in simulator.incidents.values()],
        "hospitals": [h.model_dump() for h in simulator.hospitals.values()],
        "traffic_zones": [z.model_dump() for z in simulator.traffic_zones],
        "alerts": [alt.model_dump() for alt in simulator.alerts[:12]]
    }
    await websocket.send_text(json.dumps(initial_payload, default=str))
    
    try:
        while True:
            # Client can send commands such as PING or client-driven triggers
            data = await websocket.receive_text()
            # If ping received, send pong
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
