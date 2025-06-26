import React from 'react';
import './SensorCard.css'; // Styles for SensorCard

interface SensorCardProps {
  id: string;
  name: string;
  value: number | string; // Can be number or "N/A"
  unit: string;
  status: 'ok' | 'warning' | 'alert' | 'unknown'; // Reflects sensor health or threshold breach
  type: string; // e.g., "moisture", "temperature", "humidity"
  location?: string;
  lastUpdated?: string; // ISO date string
  onHistoryClick?: (sensorId: string) => void; // Callback for opening history modal
}

const SensorCard: React.FC<SensorCardProps> = ({
  id,
  name,
  value,
  unit,
  status,
  type,
  location,
  lastUpdated,
  onHistoryClick,
}) => {
  const getStatusClassName = () => {
    switch (status) {
      case 'ok':
        return 'sensor-card--ok';
      case 'warning':
        return 'sensor-card--warning';
      case 'alert':
        return 'sensor-card--alert';
      default:
        return 'sensor-card--unknown';
    }
  };

  const formatLastUpdated = (timestamp?: string): string => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleCardClick = () => {
    if (onHistoryClick) {
      onHistoryClick(id);
    } else {
      console.log(`Card for sensor ${id} clicked, but no onHistoryClick handler provided.`);
    }
  };

  return (
    <div className={`sensor-card ${getStatusClassName()}`} onClick={handleCardClick} role="button" tabIndex={0} aria-label={`View history for ${name}`}>
      <div className="sensor-card__header">
        <h3 className="sensor-card__title">{name}</h3>
        <span className={`sensor-card__status-badge sensor-card__status-badge--${status}`}>{status.toUpperCase()}</span>
      </div>
      <div className="sensor-card__body">
        <p className="sensor-card__value">
          {typeof value === 'number' ? value.toFixed(1) : value}
          <span className="sensor-card__unit">{unit}</span>
        </p>
        <p className="sensor-card__type">Type: {type}</p>
        {location && <p className="sensor-card__location">Location: {location}</p>}
      </div>
      <div className="sensor-card__footer">
        <p className="sensor-card__last-updated">
          Last updated: {formatLastUpdated(lastUpdated)}
        </p>
        {/* Optionally, a button to explicitly open history if the whole card isn't clickable for that */}
        {/* {onHistoryClick && (
          <button onClick={(e) => { e.stopPropagation(); onHistoryClick(id); }} className="sensor-card__history-button">
            View History
          </button>
        )} */}
      </div>
    </div>
  );
};

export default SensorCard;
