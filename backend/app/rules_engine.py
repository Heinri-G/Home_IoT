import logging
from datetime import datetime
# from .models import Sensor, AlertCreate # Assuming Pydantic or DB models
# from .database import SessionLocal # For fetching thresholds

logger = logging.getLogger(__name__)

# In a real application, thresholds would be loaded from the database (sensors table)
# and potentially cached.
# Example:
# SENSOR_THRESHOLDS = {
# "garden-bed-1_moisture": {"min": 20, "max": 60, "type": "moisture"},
# "indoor-plant-1_moisture": {"min": 30, "max": 70, "type": "moisture"},
# "garden-bed-1_temperature": {"min": 5, "max": 30, "type": "temperature"},
# }

# def load_thresholds_from_db():
#     db = SessionLocal()
#     sensors = db.query(Sensor).all() # Replace with your actual Sensor model
#     thresholds = {}
#     for sensor in sensors:
#         if sensor.threshold is not None: # Assuming a single threshold value for now
#             # Key might be more complex if a sensor has multiple reading types (temp, humidity)
#             # For now, assume sensor.type correctly identifies the reading type.
#             thresholds[f"{sensor.sensor_id}_{sensor.type}"] = {
#                 "value": sensor.threshold,
#                 "name": sensor.name
#             }
#     db.close()
#     return thresholds

# For now, using a placeholder function for processing.
# This function would be called by the MQTT client or a message queue consumer.
def process_reading(reading_data: dict):
    """
    Processes a single sensor reading against its configured thresholds.
    Returns an Alert object if a threshold is breached, otherwise None.

    :param reading_data: A dictionary representing the sensor reading, e.g.,
                         {"sensorId": "garden-bed-1", "type": "moisture", "value": 23.4, "timestamp": "..."}
    :return: An alert dictionary or None
    """
    sensor_id = reading_data.get("sensorId")
    reading_type = reading_data.get("type")
    value = reading_data.get("value")
    timestamp_str = reading_data.get("timestamp")

    if not all([sensor_id, reading_type, value is not None, timestamp_str]):
        logger.warning(f"Incomplete reading data received: {reading_data}")
        return None

    try:
        timestamp = datetime.fromisoformat(timestamp_str.replace("Z", "+00:00"))
    except ValueError:
        logger.warning(f"Invalid timestamp format in reading: {timestamp_str}")
        return None

    # --- Placeholder for threshold checking ---
    # In a real app, fetch the sensor's specific threshold from a database or cache.
    # For example, if sensor_id="garden-bed-1" and type="moisture",
    # you'd look up the moisture threshold for "garden-bed-1".

    # Example: Simple hardcoded threshold for demonstration
    # This logic needs to be dynamic based on sensor config.
    alert_message = None
    # sensor_config_key = f"{sensor_id}_{reading_type}"
    # current_thresholds = load_thresholds_from_db() # This might be inefficient to call every time
    # threshold_info = current_thresholds.get(sensor_config_key)

    # if threshold_info:
    #     sensor_name = threshold_info.get("name", sensor_id)
    #     configured_threshold = threshold_info.get("value")

    #     if reading_type == "moisture":
    #         if value < configured_threshold: # Lower moisture means drier
    #             alert_message = f"Low moisture alert for {sensor_name}: {value}% (Threshold: < {configured_threshold}%)"
    #     elif reading_type == "temperature":
    #         # Example: Alert if temperature is outside a comfortable range (e.g. too low or too high)
    #         # This would need min/max thresholds. For simplicity, let's assume 'threshold' is a 'too high' limit.
    #         if value > configured_threshold:
    #             alert_message = f"High temperature alert for {sensor_name}: {value}°C (Threshold: > {configured_threshold}°C)"
    #     # Add more conditions for other types like "humidity"

    # For this placeholder, let's simulate a simple moisture alert
    if reading_type == "moisture" and value < 25.0: # Example: fixed threshold
        alert_message = f"Low moisture detected for {sensor_id}: {value}%. Needs watering!"
    elif reading_type == "temperature" and value > 35.0: # Example fixed threshold
        alert_message = f"High temperature detected for {sensor_id}: {value}°C. Check conditions!"


    if alert_message:
        logger.info(f"Alert generated for {sensor_id}: {alert_message}")
        alert_payload = {
            "sensorId": sensor_id,
            "sensorName": "Unknown Sensor", # Placeholder, enrich with sensor name from DB
            "readingType": reading_type,
            "readingValue": value,
            "message": alert_message,
            "timestamp": timestamp.isoformat()
        }
        # In a real system, this alert would be enqueued for notifications (In-App, Push, SMS)
        # For example, publish to a specific MQTT topic for alerts, or call a notification service.
        return alert_payload # This is a simple dict, could be a Pydantic model

    return None

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Test cases
    test_reading_low_moisture = {
        "sensorId": "garden-bed-1",
        "type": "moisture",
        "value": 15.5, # Below 25%
        "timestamp": "2025-06-26T14:35:00Z"
    }
    alert = process_reading(test_reading_low_moisture)
    if alert:
        print(f"Generated Alert: {alert}")
    else:
        print("No alert for low moisture test (unexpected).")

    test_reading_normal_moisture = {
        "sensorId": "garden-bed-1",
        "type": "moisture",
        "value": 30.0, # Above 25%
        "timestamp": "2025-06-26T14:40:00Z"
    }
    alert = process_reading(test_reading_normal_moisture)
    if not alert:
        print("No alert for normal moisture test (as expected).")
    else:
        print(f"Generated Alert for normal moisture (unexpected): {alert}")

    test_reading_high_temp = {
        "sensorId": "greenhouse-1",
        "type": "temperature",
        "value": 40.0, # Above 35C
        "timestamp": "2025-06-26T14:45:00Z"
    }
    alert = process_reading(test_reading_high_temp)
    if alert:
        print(f"Generated Alert: {alert}")
    else:
        print("No alert for high temperature test (unexpected).")

    test_reading_incomplete = {
        "sensorId": "test-sensor",
        # "type": "moisture", # Missing type
        "value": 50.0,
        "timestamp": "2025-06-26T14:50:00Z"
    }
    alert = process_reading(test_reading_incomplete)
    if not alert:
        print("No alert for incomplete data (as expected).")
    else:
        print(f"Generated Alert for incomplete data (unexpected): {alert}")
