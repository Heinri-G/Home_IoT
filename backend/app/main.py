from fastapi import FastAPI, WebSocket, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict
import datetime
import logging
import os

# Placeholder for database connection and models
# from . import crud, models, schemas
# from .database import SessionLocal, engine
# models.Base.metadata.create_all(bind=engine) # Create database tables

# Placeholder for MQTT client and Rules Engine
# from .mqtt_client import client as mqtt_client, connect_mqtt, disconnect_mqtt
# from .rules_engine import process_reading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Automated Plant Care API",
    description="API for managing plant sensors and their readings.",
    version="0.1.0"
)

# CORS (Cross-Origin Resource Sharing)
# Allow all origins for now, can be restricted in production
origins = [
    "http://localhost:3000", # React frontend (Vite dev server)
    "http://localhost:8080", # Keycloak
    # Add other origins as needed
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allows all methods
    allow_headers=["*"], # Allows all headers
)


# --- Pydantic Models (Data Schemas) ---
class SensorBase(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None # e.g., "moisture", "temperature", "humidity"
    location: Optional[str] = None
    threshold: Optional[float] = None # e.g., moisture level for alert

class SensorCreate(SensorBase):
    sensor_id: str # Must be provided on creation

class Sensor(SensorBase):
    sensor_id: str

    class Config:
        orm_mode = True # For SQLAlchemy compatibility if using it later

class Reading(BaseModel):
    time: datetime.datetime
    sensor_id: str
    value: float

class Alert(BaseModel):
    sensor_id: str
    message: str
    timestamp: datetime.datetime


# --- Placeholder for Auth ---
# This is a dummy dependency. Replace with actual Keycloak OAuth2 integration.
async def get_current_user(token: Optional[str] = None): # Depends(oauth2_scheme)
    # In a real app, validate token and return user object
    # For now, allow if any token is present or no auth for some endpoints
    # if token:
    #     return {"username": "dummy_user", "roles": ["admin"]} # Simulate a user
    # return None # No user / anonymous
    return {"username": "dev_user", "roles": ["admin", "viewer"]} # Simulate an admin for now

# --- API Endpoints ---

@app.on_event("startup")
async def startup_event():
    logger.info("Application startup...")
    # connect_mqtt()
    # Load rules from DB for rules_engine
    logger.info("Application successfully started.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Application shutdown...")
    # disconnect_mqtt()
    logger.info("Application successfully shut down.")

@app.post("/sensors", response_model=Sensor, status_code=status.HTTP_201_CREATED)
async def register_sensor(sensor: SensorCreate, current_user: dict = Depends(get_current_user)):
    # if "admin" not in current_user.get("roles", []):
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to register sensors")
    logger.info(f"Registering sensor: {sensor.sensor_id}")
    # Placeholder: Save to database
    # db_sensor = crud.create_sensor(db=db, sensor=sensor)
    # return db_sensor
    return Sensor(**sensor.dict()) # Echo back for now

@app.get("/sensors", response_model=List[Sensor])
async def list_sensors(current_user: dict = Depends(get_current_user)):
    # if "viewer" not in current_user.get("roles", []) and "admin" not in current_user.get("roles", []):
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view sensors")
    logger.info("Listing all sensors")
    # Placeholder: Fetch from database
    # sensors = crud.get_sensors(db=db)
    # return sensors
    return [
        Sensor(sensor_id="garden-bed-1", name="Garden Bed 1", type="moisture", location="Backyard", threshold=30.0),
        Sensor(sensor_id="indoor-plant-1", name="Fiddle Leaf Fig", type="moisture", location="Living Room", threshold=40.0),
    ]

@app.get("/sensors/{sensor_id}", response_model=Sensor)
async def get_sensor_details(sensor_id: str, current_user: dict = Depends(get_current_user)):
    logger.info(f"Getting details for sensor: {sensor_id}")
    # Placeholder: Fetch from database
    # db_sensor = crud.get_sensor(db=db, sensor_id=sensor_id)
    # if db_sensor is None:
    #     raise HTTPException(status_code=404, detail="Sensor not found")
    # return db_sensor
    if sensor_id == "garden-bed-1":
        return Sensor(sensor_id="garden-bed-1", name="Garden Bed 1", type="moisture", location="Backyard", threshold=30.0)
    raise HTTPException(status_code=404, detail="Sensor not found")


@app.get("/sensors/{sensor_id}/history", response_model=List[Reading])
async def get_sensor_history(
    sensor_id: str,
    start: Optional[datetime.datetime] = None,
    end: Optional[datetime.datetime] = None,
    current_user: dict = Depends(get_current_user)
):
    logger.info(f"Getting history for sensor: {sensor_id} from {start} to {end}")
    # Placeholder: Fetch time-series data from TimescaleDB
    # readings = crud.get_sensor_readings(db=db, sensor_id=sensor_id, start_time=start, end_time=end)
    # return readings
    # Dummy data for now
    now = datetime.datetime.now(datetime.timezone.utc)
    return [
        Reading(time=now - datetime.timedelta(minutes=10), sensor_id=sensor_id, value=25.5),
        Reading(time=now - datetime.timedelta(minutes=5), sensor_id=sensor_id, value=26.1),
        Reading(time=now, sensor_id=sensor_id, value=25.8),
    ]

# --- WebSocket for Live Updates ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {} # Store by user_id or client_id

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
        logger.info(f"WebSocket client {client_id} connected.")

    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            logger.info(f"WebSocket client {client_id} disconnected.")

    async def send_personal_message(self, message: str, client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

    async def broadcast(self, message: str):
        for client_id in self.active_connections:
            await self.active_connections[client_id].send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/updates/{client_id}") # Using client_id for simplicity; auth needed
async def websocket_endpoint(websocket: WebSocket, client_id: str): #, current_user: dict = Depends(get_current_user_ws)): # Add auth for WS
    # # Authentication for WebSocket (example)
    # token = websocket.query_params.get("token")
    # if not token:
    #     await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    #     return
    # user = await get_current_user_ws(token) # Implement this function
    # if not user:
    #     await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
    #     return

    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"WebSocket received from {client_id}: {data}")
            # For now, just echo back or broadcast
            # await manager.send_personal_message(f"You wrote: {data}", client_id)
            # await manager.broadcast(f"Client {client_id} says: {data}")
            # In a real app, this might be used for client commands or subscriptions
            # For now, server pushes data via broadcast when MQTT messages arrive
    except Exception as e: # WebSocketDisconnect is not caught by base Exception in some versions
        logger.warning(f"WebSocket error for client {client_id}: {e}")
    finally:
        manager.disconnect(client_id)
        logger.info(f"WebSocket client {client_id} connection closed.")


# --- Placeholder for MQTT Client and Rules Engine integration ---
# (These would typically run in background tasks or separate processes/threads)

# def on_mqtt_message_received(topic, payload_json):
#   """
#   Callback when an MQTT message is received.
#   Processes the reading, checks rules, and broadcasts via WebSocket if needed.
#   """
#   logger.info(f"MQTT message received: Topic: {topic}, Payload: {payload_json}")
#   # 1. Persist to TimescaleDB (done by mqtt_client.py itself or called from here)
#   # 2. Process with Rules Engine
#   # alert = process_reading(payload_json) # Returns an Alert object or None
#   # if alert:
#   #   asyncio.run(manager.broadcast(alert.json())) # Or send to specific users
#   # 3. Broadcast raw reading (or a summary) to WebSocket clients
#   # asyncio.run(manager.broadcast(json.dumps(payload_json)))


# This is a placeholder for how you might integrate the MQTT client's messages
# with the FastAPI app (e.g., for WebSocket broadcasting).
# A more robust solution might involve a shared message queue (like Redis pub/sub)
# or asyncio background tasks.

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
