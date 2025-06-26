import React, { useState, useEffect } from 'react';
import './SensorForm.css'; // Styles for SensorForm

interface SensorEditable {
  sensor_id: string;
  name?: string;
  type: string;
  location?: string;
  threshold?: number;
  unit?: string;
}

interface SensorFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SensorEditable) => void;
  initialData?: SensorEditable | null; // For editing existing sensor
}

const SensorForm: React.FC<SensorFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<SensorEditable>({
    sensor_id: '',
    name: '',
    type: 'moisture', // Default type
    location: '',
    threshold: 0,
    unit: '%', // Default unit for moisture
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SensorEditable, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        sensor_id: initialData.sensor_id || '',
        name: initialData.name || '',
        type: initialData.type || 'moisture',
        location: initialData.location || '',
        threshold: initialData.threshold === undefined || initialData.threshold === null ? 0 : initialData.threshold,
        unit: initialData.unit || (initialData.type === 'moisture' ? '%' : initialData.type === 'temperature' ? '°C' : ''),
      });
    } else {
      // Reset form for new sensor
      setFormData({
        sensor_id: '',
        name: '',
        type: 'moisture',
        location: '',
        threshold: 0,
        unit: '%',
      });
    }
    setErrors({}); // Clear errors when initialData changes or form opens/closes
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;

    if (type === 'number') {
      processedValue = value === '' ? '' : parseFloat(value); // Keep as '' if empty to allow clearing
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));

    if (name === 'type') { // Auto-suggest unit based on type
        if (value === 'moisture') setFormData(prev => ({ ...prev, unit: '%' }));
        else if (value === 'temperature') setFormData(prev => ({ ...prev, unit: '°C' }));
        else if (value === 'humidity') setFormData(prev => ({ ...prev, unit: '%' }));
        else setFormData(prev => ({ ...prev, unit: '' }));
    }

    // Clear specific error when user starts typing
    if (errors[name as keyof SensorEditable]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SensorEditable, string>> = {};
    if (!formData.sensor_id.trim()) {
      newErrors.sensor_id = 'Sensor ID is required.';
    } else if (!/^[a-zA-Z0-9-_]+$/.test(formData.sensor_id.trim())) {
      newErrors.sensor_id = 'Sensor ID can only contain letters, numbers, hyphens, and underscores.';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Sensor type is required.';
    }
    if (!formData.name?.trim()) { // Name is optional, but if provided, should be valid
        // newErrors.name = 'Sensor name is required.';
    }
    if (formData.threshold === undefined || formData.threshold === null || isNaN(Number(formData.threshold))) {
        // Allow empty threshold, or validate if you want it always set
        // newErrors.threshold = 'Threshold must be a valid number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const finalFormData = {
        ...formData,
        threshold: formData.threshold === '' || formData.threshold === undefined || isNaN(Number(formData.threshold)) ? null : Number(formData.threshold)
      };
      onSubmit(finalFormData  as SensorEditable);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="sensor-form-modal" role="dialog" aria-modal="true" aria-labelledby="sensorFormTitle">
      <div className="sensor-form-modal__overlay" onClick={onClose}></div>
      <div className="sensor-form-modal__content">
        <form onSubmit={handleSubmit} className="sensor-form">
          <div className="sensor-form__header">
            <h2 id="sensorFormTitle" className="sensor-form__title">
              {initialData ? 'Edit Sensor' : 'Add New Sensor'}
            </h2>
            <button type="button" onClick={onClose} className="sensor-form__close-button" aria-label="Close form">
              &times;
            </button>
          </div>

          <div className="sensor-form__body">
            <div className="sensor-form__field">
              <label htmlFor="sensor_id" className="sensor-form__label">Sensor ID*</label>
              <input
                type="text"
                id="sensor_id"
                name="sensor_id"
                value={formData.sensor_id}
                onChange={handleChange}
                className={`sensor-form__input ${errors.sensor_id ? 'sensor-form__input--error' : ''}`}
                disabled={!!initialData} // Disable editing ID for existing sensors
                required
              />
              {errors.sensor_id && <p className="sensor-form__error-message">{errors.sensor_id}</p>}
            </div>

            <div className="sensor-form__field">
              <label htmlFor="name" className="sensor-form__label">Sensor Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="sensor-form__input"
              />
            </div>

            <div className="sensor-form__field">
              <label htmlFor="type" className="sensor-form__label">Sensor Type*</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className={`sensor-form__input ${errors.type ? 'sensor-form__input--error' : ''}`}
                required
              >
                <option value="moisture">Moisture</option>
                <option value="temperature">Temperature</option>
                <option value="humidity">Humidity</option>
                <option value="light">Light</option>
                <option value="co2">CO2</option>
                <option value="custom">Custom</option>
              </select>
              {errors.type && <p className="sensor-form__error-message">{errors.type}</p>}
            </div>

            <div className="sensor-form__field">
              <label htmlFor="location" className="sensor-form__label">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="sensor-form__input"
              />
            </div>

            <div className="sensor-form__field">
              <label htmlFor="threshold" className="sensor-form__label">Threshold Value</label>
              <input
                type="number"
                id="threshold"
                name="threshold"
                value={formData.threshold === null || formData.threshold === undefined ? '' : formData.threshold}
                onChange={handleChange}
                className={`sensor-form__input ${errors.threshold ? 'sensor-form__input--error' : ''}`}
                step="any" // Allow decimals
              />
              {errors.threshold && <p className="sensor-form__error-message">{errors.threshold}</p>}
            </div>

            <div className="sensor-form__field">
              <label htmlFor="unit" className="sensor-form__label">Unit</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="sensor-form__input"
                placeholder={formData.type === 'moisture' ? '%' : formData.type === 'temperature' ? '°C' : ''}
              />
            </div>
          </div>

          <div className="sensor-form__footer">
            <button type="button" onClick={onClose} className="sensor-form__button sensor-form__button--cancel">
              Cancel
            </button>
            <button type="submit" className="sensor-form__button sensor-form__button--submit">
              {initialData ? 'Save Changes' : 'Add Sensor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SensorForm;
