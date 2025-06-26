import React, { useState, useEffect } from 'react';
import SensorForm from '@components/SensorForm/SensorForm';
// import { fetchSensors, deleteSensor, registerSensor, updateSensor } from '@services/api'; // API service
import './SensorsPage.css';

// Mock API functions for now
const mockFetchSensorsList = async () => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
  return [
    { sensor_id: 'garden-bed-1-moisture', name: 'Garden Bed 1 Moisture', type: 'moisture', location: 'Backyard', threshold: 25.0, unit: '%' },
    { sensor_id: 'garden-bed-1-temp', name: 'Garden Bed 1 Temp', type: 'temperature', location: 'Backyard', threshold: 30.0, unit: '°C' },
    { sensor_id: 'living-room-fig-moisture', name: 'Living Room Fig', type: 'moisture', location: 'Living Room', threshold: 40.0, unit: '%' },
  ];
};
const mockDeleteSensor = async (id: string) => { console.log(`Mock delete sensor: ${id}`); await new Promise(resolve => setTimeout(resolve, 300)); return true; };
const mockRegisterSensor = async (data: SensorEditable) => { console.log('Mock register sensor:', data); await new Promise(resolve => setTimeout(resolve, 300)); return { ...data, sensor_id: `new-sensor-${Date.now()}` }; };
const mockUpdateSensor = async (id: string, data: SensorEditable) => { console.log(`Mock update sensor ${id}:`, data); await new Promise(resolve => setTimeout(resolve, 300)); return { ...data, sensor_id: id }; };


interface Sensor {
  sensor_id: string;
  name?: string | null;
  type: string;
  location?: string | null;
  threshold?: number | null;
  unit?: string | null;
  // other fields from API if any, like 'is_active', 'last_updated' for metadata
}

interface SensorEditable { // Fields that can be edited or created
  sensor_id: string; // For new sensors, this might be suggested or user-defined
  name?: string;
  type: string;
  location?: string;
  threshold?: number;
  unit?: string;
}

const SensorsPage: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSensor, setEditingSensor] = useState<Sensor | null>(null);

  const loadSensors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // const data = await fetchSensors();
      const data = await mockFetchSensorsList();
      setSensors(data);
    } catch (err) {
      console.error("Failed to fetch sensors:", err);
      setError("Failed to load sensor list.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSensors();
  }, []);

  const handleAddSensor = () => {
    setEditingSensor(null); // Clear any sensor being edited
    setIsModalOpen(true);
  };

  const handleEditSensor = (sensor: Sensor) => {
    setEditingSensor(sensor);
    setIsModalOpen(true);
  };

  const handleDeleteSensor = async (sensorId: string) => {
    if (window.confirm(`Are you sure you want to delete sensor ${sensorId}? This action cannot be undone.`)) {
      try {
        // await deleteSensor(sensorId);
        await mockDeleteSensor(sensorId);
        setSensors(prevSensors => prevSensors.filter(s => s.sensor_id !== sensorId));
        // TODO: Add success toast/notification
      } catch (err) {
        console.error(`Failed to delete sensor ${sensorId}:`, err);
        setError(`Failed to delete sensor ${sensorId}.`);
        // TODO: Add error toast/notification
      }
    }
  };

  const handleFormSubmit = async (formData: SensorEditable) => {
    try {
      if (editingSensor) { // Update existing sensor
        // const updatedSensor = await updateSensor(editingSensor.sensor_id, formData);
        const updatedSensor = await mockUpdateSensor(editingSensor.sensor_id, formData);
        setSensors(prevSensors =>
          prevSensors.map(s => (s.sensor_id === updatedSensor.sensor_id ? updatedSensor : s))
        );
        // TODO: Add success toast
      } else { // Add new sensor
        // const newSensor = await registerSensor(formData);
        const newSensor = await mockRegisterSensor(formData);
        setSensors(prevSensors => [...prevSensors, newSensor]);
        // TODO: Add success toast
      }
      setIsModalOpen(false);
      setEditingSensor(null);
    } catch (err) {
      console.error("Failed to save sensor:", err);
      setError("Failed to save sensor data.");
      // TODO: Add error toast (ideally in the form itself)
    }
  };


  if (isLoading) {
    return <div className="sensors-page__status">Loading sensors...</div>;
  }

  if (error && sensors.length === 0) { // Show general error if list is empty
    return <div className="sensors-page__status sensors-page__status--error">{error}</div>;
  }

  return (
    <div className="sensors-page">
      <div className="sensors-page__header">
        <h1 className="sensors-page__title">Manage Sensors</h1>
        <button onClick={handleAddSensor} className="sensors-page__button sensors-page__button--add">
          Add New Sensor
        </button>
      </div>

      {error && <p className="sensors-page__status sensors-page__status--error">{error}</p>}

      {sensors.length === 0 && !isLoading && !error && (
        <p className="sensors-page__status">No sensors configured yet. Click "Add New Sensor" to get started.</p>
      )}

      {sensors.length > 0 && (
        <table className="sensors-page__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Location</th>
              <th>Threshold</th>
              <th>Unit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sensors.map(sensor => (
              <tr key={sensor.sensor_id}>
                <td data-label="ID">{sensor.sensor_id}</td>
                <td data-label="Name">{sensor.name || 'N/A'}</td>
                <td data-label="Type">{sensor.type}</td>
                <td data-label="Location">{sensor.location || 'N/A'}</td>
                <td data-label="Threshold">{sensor.threshold !== null && sensor.threshold !== undefined ? sensor.threshold : 'N/A'}</td>
                <td data-label="Unit">{sensor.unit || 'N/A'}</td>
                <td className="sensors-page__actions-cell">
                  <button
                    onClick={() => handleEditSensor(sensor)}
                    className="sensors-page__button sensors-page__button--edit"
                    aria-label={`Edit sensor ${sensor.name || sensor.sensor_id}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSensor(sensor.sensor_id)}
                    className="sensors-page__button sensors-page__button--delete"
                    aria-label={`Delete sensor ${sensor.name || sensor.sensor_id}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isModalOpen && (
        <SensorForm
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingSensor(null); }}
          onSubmit={handleFormSubmit}
          initialData={editingSensor}
        />
      )}
    </div>
  );
};

export default SensorsPage;
