// Arduino Plant Monitor Sketch

// --- Libraries ---
// #include <WiFiNINA.h> // For MKR WiFi 1010
// #include <PubSubClient.h> // For MQTT communication
// #include <DHT.h> // For DHT22/AM2302 sensor
// #include <ArduinoOTA.h> // For Over-the-Air updates (optional)
// #include <Arduino_JSON.h> // For creating JSON payloads

// --- Sensor Configuration ---
// #define DHTPIN 2        // Digital pin connected to the DHT sensor
// #define DHTTYPE DHT22   // DHT 22 (AM2302)
// DHT dht(DHTPIN, DHTTYPE);

const int SOIL_MOISTURE_PIN = A0; // Analog pin for capacitive soil moisture sensor
const char* SENSOR_ID = "garden-bed-1"; // Unique ID for this sensor device

// --- WiFi Configuration ---
// char ssid[] = "YOUR_WIFI_SSID";        // Your network SSID (name)
// char pass[] = "YOUR_WIFI_PASSWORD";    // Your network password
// int status = WL_IDLE_STATUS;

// --- MQTT Configuration ---
// const char* mqtt_server = "YOUR_MQTT_BROKER_IP_OR_HOSTNAME"; // IP address or hostname of your MQTT broker
// const int mqtt_port = 1883;
// WiFiClient wifiClient;
// PubSubClient mqttClient(wifiClient);

// --- Timing ---
unsigned long lastMeasurementMillis = 0;
const long measurementInterval = 5 * 60 * 1000; // 5 minutes in milliseconds (5 * 60 * 1000)

void setup() {
  Serial.begin(115200);
  while (!Serial) {
    ; // wait for serial port to connect. Needed for native USB port only
  }
  Serial.println("Plant Monitor Setup");

  // Initialize Soil Moisture Sensor Pin
  pinMode(SOIL_MOISTURE_PIN, INPUT);

  // Initialize DHT sensor
  // dht.begin();

  // Connect to WiFi
  // connectToWiFi();

  // Configure MQTT
  // mqttClient.setServer(mqtt_server, mqtt_port);
  // mqttClient.setCallback(mqttCallback); // If subscribing to any topics

  // Configure OTA updates (optional)
  // setupOTA();

  Serial.println("Setup complete.");
}

void loop() {
  // Maintain WiFi connection
  // if (WiFi.status() != WL_CONNECTED) {
  //   connectToWiFi();
  // }

  // Maintain MQTT connection
  // if (!mqttClient.connected()) {
  //   reconnectMQTT();
  // }
  // mqttClient.loop(); // Allow the MQTT client to process incoming messages and maintain connection

  // Perform OTA handling (optional)
  // ArduinoOTA.handle();

  // Take measurements at specified interval
  unsigned long currentMillis = millis();
  if (currentMillis - lastMeasurementMillis >= measurementInterval) {
    lastMeasurementMillis = currentMillis;
    readAndPublishData();
  }
}

void connectToWiFi() {
  // Serial.print("Connecting to WiFi: ");
  // Serial.println(ssid);
  // WiFi.begin(ssid, pass);
  // while (WiFi.status() != WL_CONNECTED) {
  //   delay(500);
  //   Serial.print(".");
  // }
  // Serial.println("\nWiFi connected");
  // Serial.print("IP address: ");
  // Serial.println(WiFi.localIP());
}

void reconnectMQTT() {
  // Loop until we're reconnected
  // while (!mqttClient.connected()) {
  //   Serial.print("Attempting MQTT connection...");
  //   // Attempt to connect
  //   // If you do not want to use a username and password, change next line to
  //   // if (mqttClient.connect(SENSOR_ID)) {
  //   // String clientId = "ArduinoClient-" + String(SENSOR_ID);
  //   // if (mqttClient.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
  //   if (mqttClient.connect(SENSOR_ID)) {
  //     Serial.println("connected");
  //     // Once connected, publish an announcement...
  //     // mqttClient.publish("plant/sensor/status", "connected");
  //     // ... and resubscribe to any topics if necessary
  //     // mqttClient.subscribe("plant/sensor/command");
  //   } else {
  //     Serial.print("failed, rc=");
  //     Serial.print(mqttClient.state());
  //     Serial.println(" try again in 5 seconds");
  //     // Wait 5 seconds before retrying
  //     delay(5000);
  //   }
  // }
}

// void mqttCallback(char* topic, byte* payload, unsigned int length) {
//   // Handle incoming MQTT messages (e.g., commands)
//   Serial.print("Message arrived [");
//   Serial.print(topic);
//   Serial.print("] ");
//   for (unsigned int i = 0; i < length; i++) {
//     Serial.print((char)payload[i]);
//   }
//   Serial.println();
// }

void readAndPublishData() {
  // Read Soil Moisture
  int soilMoistureValue = analogRead(SOIL_MOISTURE_PIN);
  // Convert to percentage or calibrated value as needed.
  // For a basic capacitive sensor, lower values often mean wetter.
  // This needs calibration: map(value, airValue, waterValue, 0, 100);
  float moisturePercent = (1023.0 - soilMoistureValue) / 1023.0 * 100.0; // Example simple conversion

  Serial.print("Soil Moisture Raw: ");
  Serial.print(soilMoistureValue);
  Serial.print(" -> %: ");
  Serial.println(moisturePercent);
  publishSensorData("moisture", moisturePercent);

  // Read Temperature & Humidity from DHT sensor
  // float humidity = dht.readHumidity();
  // float temperature = dht.readTemperature(); // Celsius by default

  // Check if any reads failed and exit early (to try again).
  // if (isnan(humidity) || isnan(temperature)) {
  //   Serial.println("Failed to read from DHT sensor!");
  //   return;
  // }

  // Serial.print("Humidity: ");
  // Serial.print(humidity);
  // Serial.print("%\t");
  // Serial.print("Temperature: ");
  // Serial.print(temperature);
  // Serial.println(" *C");
  // publishSensorData("temperature", temperature);
  // publishSensorData("humidity", humidity);
}

void publishSensorData(const char* type, float value) {
  // if (!mqttClient.connected()) {
  //   Serial.println("MQTT not connected. Cannot publish.");
  //   return;
  // }

  // Create JSON payload
  // JSONVar reading; // Using Arduino_JSON library
  // reading["sensorId"] = SENSOR_ID;
  // reading["type"] = type;
  // reading["value"] = value;
  // String timestamp = getISO8601Timestamp(); // Implement this function
  // reading["timestamp"] = timestamp;
  // String jsonString = JSON.stringify(reading);

  // --- Manual JSON construction (if not using a library) ---
  String jsonPayload = "{";
  jsonPayload += "\"sensorId\":\"" + String(SENSOR_ID) + "\",";
  jsonPayload += "\"type\":\"" + String(type) + "\",";
  jsonPayload += "\"value\":" + String(value, 2) + ","; // value with 2 decimal places
  jsonPayload += "\"timestamp\":\"" + getISO8601Timestamp() + "\""; // Placeholder for real timestamp
  jsonPayload += "}";
  // --- End Manual JSON ---

  String topic = "home/garden/" + String(SENSOR_ID) + "/" + String(type);

  Serial.print("Publishing to topic: ");
  Serial.println(topic);
  Serial.print("Payload: ");
  Serial.println(jsonPayload);

  // mqttClient.publish(topic.c_str(), jsonPayload.c_str());
}

String getISO8601Timestamp() {
  // This is a placeholder. For actual ISO8601 timestamp,
  // you would need an RTC module or sync time via NTP.
  // Format: "YYYY-MM-DDTHH:MM:SSZ"
  // For now, returning a simplified timestamp or millis()
  // time_t now;
  // struct tm timeinfo;
  // if(!getLocalTime(&timeinfo)){
  //   Serial.println("Failed to obtain time");
  //   return "1970-01-01T00:00:00Z";
  // }
  // char buffer[30];
  // strftime(buffer, sizeof(buffer), "%Y-%m-%dT%H:%M:%SZ", &timeinfo);
  // return String(buffer);
  return String("2025-06-26T14:35:00Z"); // Placeholder
}

void setupOTA() {
  // // Port defaults to 3232
  // // ArduinoOTA.setPort(3232);

  // // Hostname defaults to esp3232-[MAC]
  // ArduinoOTA.setHostname("my-plant-monitor");

  // // No authentication by default
  // // ArduinoOTA.setPassword("admin");

  // // Password can be set with it's md5 value as well
  // // MD5(admin) = 21232f297a57a5a743894a0e4a801fc3
  // // ArduinoOTA.setPasswordHash("21232f297a57a5a743894a0e4a801fc3");

  // ArduinoOTA
  //   .onStart([]() {
  //     String type;
  //     if (ArduinoOTA.getCommand() == U_FLASH)
  //       type = "sketch";
  //     else // U_SPIFFS
  //       type = "filesystem";
  //     // NOTE: if updating SPIFFS this would be const char* / float too big for MAX_PATH
  //     Serial.println("Start updating " + type);
  //   })
  //   .onEnd([]() {
  //     Serial.println("\nEnd");
  //   })
  //   .onProgress([](unsigned int progress, unsigned int total) {
  //     Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  //   })
  //   .onError([](ota_error_t error) {
  //     Serial.printf("Error[%u]: ", error);
  //     if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
  //     else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
  //     else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
  //     else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
  //     else if (error == OTA_END_ERROR) Serial.println("End Failed");
  //   });

  // ArduinoOTA.begin();
  // Serial.println("OTA Initialized");
  // Serial.print("IP address: ");
  // Serial.println(WiFi.localIP());
}
