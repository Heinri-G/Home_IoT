import React, { useState, useEffect } from 'react';
import SensorCard from '@components/SensorCard/SensorCard';
// import { fetchSensors, fetchSensorHistory } from '@services/api'; // Placeholder for API service
// import { useMqtt } from '@context/MqttContext'; // Placeholder for MqttContext
import './DashboardPage.css';

// Mock API functions for now
const mockFetchSensors = async () => {
  return [
    { id: 'garden-bed-1-moisture', name: 'Garden Bed 1 Moisture', value: 28.5, unit: '%', status: 'ok', type: 'moisture', location: 'Backyard', lastUpdated: new Date().toISOString() },
    { id: 'garden-bed-1-temp', name: 'Garden Bed 1 Temp', value: 22.1, unit: '°C', status: 'ok', type: 'temperature', location: 'Backyard', lastUpdated: new Date().toISOString() },
    { id: 'living-room-fig-moisture', name: 'Living Room Fig', value: 35.0, unit: '%', status: 'warning', type: 'moisture', location: 'Living Room', lastUpdated: new Date().toISOString() },
    { id: 'greenhouse-1-humidity', name: 'Greenhouse Humidity', value: 65.7, unit: '%', status: 'ok', type: 'humidity', location: 'Greenhouse', lastUpdated: new Date().toISOString() },
    { id: 'office-desk-plant', name: 'Office Desk Plant', value: 18.2, unit: '%', status: 'alert', type: 'moisture', location: 'Office', lastUpdated: new Date().toISOString() },
  ];
};

interface SensorData {
  id: string;
  name: string;
  value: number | string; // Can be number or N/A string
  unit: string;
  status: 'ok' | 'warning' | 'alert' | 'unknown';
  type: string;
  location: string;
  lastUpdated: string; // ISO string
}

const DashboardPage: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Integrate with MqttContext for real-time updates
  // const { messages } = useMqtt('home/+/+/+'); // Example subscription

  useEffect(() => {
    const loadSensors = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // const fetchedSensors = await fetchSensors(); // Replace with actual API call
        const fetchedSensors = await mockFetchSensors(); // Using mock for now

        // Simulate initial status based on value (this logic will be on backend/rules engine)
        const processedSensors = fetchedSensors.map(s => ({
          ...s,
          // Example client-side status determination if not provided by backend
          // status: s.value < 20 ? 'alert' : s.value < 40 ? 'warning' : 'ok',
        }));
        setSensors(processedSensors);
      } catch (err) {
        console.error("Failed to fetch sensors:", err);
        setError("Failed to load sensor data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadSensors();
  }, []);

  // TODO: useEffect for handling MQTT messages and updating sensor data
  // useEffect(() => {
  //   if (messages && messages.length > 0) {
  //     const latestMessage = messages[messages.length - 1];
  //     // Assuming message payload is JSON: { sensorId, value, timestamp, (optional) type }
  //     try {
  //       const data = JSON.parse(latestMessage.payloadString);
  //       setSensors(prevSensors =>
  //         prevSensors.map(sensor =>
  //           sensor.id === data.sensorId // Or construct ID based on topic
  //             ? { ...sensor, value: data.value, lastUpdated: data.timestamp || new Date().toISOString(), status: determineStatus(data.value, sensor.type) }
  //             : sensor
  //         )
  //       );
  //     } catch (e) {
  //       console.error("Error processing MQTT message:", e);
  //     }
  //   }
  // }, [messages]);

  // const determineStatus = (value: number, type: string): SensorData['status'] => {
  //   // Placeholder: This logic should ideally come from backend or be more sophisticated
  //   if (type === 'moisture') {
  //     if (value < 20) return 'alert';
  //     if (value < 30) return 'warning';
  //     return 'ok';
  //   }
  //   return 'ok'; // Default
  // };


  if (isLoading) {
    return <div className="dashboard-page__loader">Loading sensor data...</div>;
  }

  if (error) {
    return <div className="dashboard-page__error">{error}</div>;
  }

  if (sensors.length === 0) {
    return <div className="dashboard-page__empty">No sensors found. Add sensors in the Sensors page.</div>;
  }

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-page__title">Sensor Dashboard</h1>
      <div className="dashboard-page__grid">
        {sensors.map((sensor) => (
          <SensorCard
            key={sensor.id}
            id={sensor.id}
            name={sensor.name}
            value={sensor.value}
            unit={sensor.unit}
            status={sensor.status}
            type={sensor.type}
            location={sensor.location}
            lastUpdated={sensor.lastUpdated}
            // onHistoryClick={() => handleHistoryClick(sensor.id)} // Implement later
          />
        ))}
      </div>
      {/* HistoryModal would be rendered here, conditionally */}
    </div>
  );
};

export default DashboardPage;
