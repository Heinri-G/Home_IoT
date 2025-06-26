import paho.mqtt.client as mqtt
import os
import json
import logging
import time
from datetime import datetime

# from .database import SessionLocal, engine # Assuming you have database setup
# from . import crud, models # Assuming you have CRUD operations and models

logger = logging.getLogger(__name__)

MQTT_BROKER_HOST = os.getenv("MQTT_BROKER_HOST", "mosquitto")
MQTT_BROKER_PORT = int(os.getenv("MQTT_BROKER_PORT", 1883))
MQTT_KEEPALIVE = 60
MQTT_TOPIC_PREFIX = "home/#" # Subscribe to all topics under home/

# This is a placeholder for the FastAPI app's WebSocket manager or other callback
# In a real application, you'd need a way for this MQTT client (potentially running
# in a separate thread/process) to communicate with the FastAPI part.
# For example, using a message queue (Redis Pub/Sub, RabbitMQ), or if running
# in the same process with asyncio, using asyncio queues.
external_message_handler = None

def set_external_message_handler(handler):
    global external_message_handler
    external_message_handler = handler

# The callback for when the client receives a CONNACK response from the server.
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        logger.info(f"Connected to MQTT Broker at {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
        # Subscribing in on_connect() means that if we lose the connection and
        # reconnect then subscriptions will be renewed.
        client.subscribe(MQTT_TOPIC_PREFIX)
        logger.info(f"Subscribed to topic: {MQTT_TOPIC_PREFIX}")
    else:
        logger.error(f"Failed to connect to MQTT Broker, return code {rc}")

# The callback for when a PUBLISH message is received from the server.
def on_message(client, userdata, msg):
    topic = msg.topic
    payload_str = msg.payload.decode("utf-8")
    logger.info(f"Received message: Topic: {topic}, Payload: {payload_str}")

    try:
        payload_json = json.loads(payload_str)
        # Expected JSON: {"sensorId": "...", "type": "...", "value": ..., "timestamp": "..."}

        # --- Placeholder for data persistence ---
        # db = SessionLocal()
        # try:
        #     reading_data = models.ReadingCreate(
        #         time=datetime.fromisoformat(payload_json["timestamp"].replace("Z", "+00:00")), # Ensure timezone aware
        #         sensor_id=payload_json["sensorId"],
        #         value=payload_json["value"]
        #     )
        #     crud.create_reading(db=db, reading=reading_data)
        #     logger.info(f"Stored reading for sensor {payload_json['sensorId']} to database.")
        # except Exception as e:
        #     logger.error(f"Error storing reading to database: {e}")
        # finally:
        #     db.close()
        # --- End Placeholder ---


        # --- Placeholder for calling rules engine and notifying via WebSocket ---
        # This is where you would integrate with the FastAPI application logic
        # For example, by putting the message onto a queue that FastAPI processes,
        # or by calling a function if they are in the same process (needs careful design for async).
        if external_message_handler:
            # external_message_handler should be an async function if called from an async context
            # or handle thread safety if MQTT client is in a different thread.
            # Example: external_message_handler(topic, payload_json) -> defined in main.py
            # This is simplified. In a real app, use asyncio.run_coroutine_threadsafe if MQTT runs in a separate thread
            # and FastAPI is async.
            try:
                # This is a conceptual call. The actual mechanism depends on how main.py exposes this.
                # For instance, main.py could have a queue that this client puts messages into.
                # from .main import on_mqtt_message_received # Avoid circular import if possible
                # on_mqtt_message_received(topic, payload_json)
                logger.info("External message handler would be called here.")
            except Exception as e:
                logger.error(f"Error calling external message handler: {e}")
        # --- End Placeholder ---


    except json.JSONDecodeError:
        logger.error(f"Could not decode JSON payload: {payload_str}")
    except KeyError as e:
        logger.error(f"Missing key in JSON payload: {e} - Payload: {payload_str}")
    except Exception as e:
        logger.error(f"An unexpected error occurred processing message: {e}")


client = mqtt.Client(client_id=f"fastapi-plant-service-{os.getpid()}", clean_session=True)
client.on_connect = on_connect
client.on_message = on_message

def connect_mqtt():
    try:
        logger.info(f"Attempting to connect to MQTT broker: {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT}")
        client.connect(MQTT_BROKER_HOST, MQTT_BROKER_PORT, MQTT_KEEPALIVE)
        # client.loop_start() # Starts a new thread to process network traffic, dispatches, and handles reconnects.
                            # This is good for most cases. Use loop_forever() if you want a blocking call.
    except ConnectionRefusedError:
        logger.error(f"MQTT connection refused. Broker at {MQTT_BROKER_HOST}:{MQTT_BROKER_PORT} is not available.")
    except Exception as e:
        logger.error(f"Could not connect to MQTT broker: {e}")

def disconnect_mqtt():
    logger.info("Disconnecting from MQTT broker.")
    # client.loop_stop() # Stop the network loop
    client.disconnect()

# For standalone testing of the MQTT client
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
    logger.info("Starting MQTT client for testing...")
    connect_mqtt()
    client.loop_start() # Keep it running to listen for messages

    try:
        while True:
            time.sleep(1)
            # You could add test publishing here if needed
            # client.publish("test/topic", "Hello from standalone client")
    except KeyboardInterrupt:
        logger.info("Shutting down MQTT client...")
    finally:
        disconnect_mqtt()
        logger.info("MQTT client stopped.")
