import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale, // Import TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns'; // Import the adapter

// import { fetchSensorHistory } from '@services/api'; // API service
import './HistoryModal.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale // Register TimeScale
);

// Mock API function for now
const mockFetchSensorHistory = async (sensorId: string, start?: string, end?: string) => {
  console.log(`Fetching history for ${sensorId} from ${start} to ${end}`);
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  // Generate some mock data
  const now = new Date();
  return Array.from({ length: 20 }, (_, i) => ({
    time: new Date(now.getTime() - (19 - i) * 60 * 60 * 1000).toISOString(), // Hourly data for last 20 hours
    sensor_id: sensorId,
    value: 50 + Math.random() * 20 - 10, // Random value around 50 +/- 10
  }));
};


interface Reading {
  time: string; // ISO string
  sensor_id: string;
  value: number;
}

interface HistoryModalProps {
  sensorId: string | null;
  sensorName?: string;
  sensorUnit?: string;
  isOpen: boolean;
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  sensorId,
  sensorName,
  sensorUnit,
  isOpen,
  onClose,
}) => {
  const [historyData, setHistoryData] = useState<Reading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: Add date range pickers for start and end dates

  useEffect(() => {
    if (isOpen && sensorId) {
      const loadHistory = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // const data = await fetchSensorHistory(sensorId); // Add start/end date params
          const data = await mockFetchSensorHistory(sensorId);
          setHistoryData(data);
        } catch (err) {
          console.error(`Failed to fetch history for sensor ${sensorId}:`, err);
          setError('Failed to load history data.');
        } finally {
          setIsLoading(false);
        }
      };
      loadHistory();
    } else {
      // Reset data when modal is closed or no sensorId
      setHistoryData([]);
    }
  }, [isOpen, sensorId]);

  if (!isOpen) {
    return null;
  }

  const chartData = {
    labels: historyData.map(d => new Date(d.time)), // Use Date objects for time scale
    datasets: [
      {
        label: `${sensorName || 'Sensor'} Readings (${sensorUnit || ''})`,
        data: historyData.map(d => d.value),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Historical Data for ${sensorName || sensorId}`,
      },
    },
    scales: {
      x: {
        type: 'time' as const, // Specify x-axis as time series
        time: {
          unit: 'hour' as const, // Display unit, can be dynamic
          tooltipFormat: 'MMM d, yyyy HH:mm', // Format for tooltips
          displayFormats: {
            hour: 'HH:mm', // How to display labels for hours
            day: 'MMM d',   // How to display labels for days
          }
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: `Value (${sensorUnit || ''})`,
        },
        beginAtZero: false, // Adjust as needed, may not want to start at zero for temp
      },
    },
  };

  return (
    <div className="history-modal" role="dialog" aria-modal="true" aria-labelledby="historyModalTitle">
      <div className="history-modal__overlay" onClick={onClose}></div>
      <div className="history-modal__content">
        <div className="history-modal__header">
          <h2 id="historyModalTitle" className="history-modal__title">
            History for {sensorName || sensorId}
          </h2>
          <button onClick={onClose} className="history-modal__close-button" aria-label="Close history modal">
            &times;
          </button>
        </div>
        <div className="history-modal__body">
          {/* TODO: Add date range pickers here */}
          {isLoading && <p className="history-modal__loader">Loading history...</p>}
          {error && <p className="history-modal__error">{error}</p>}
          {!isLoading && !error && historyData.length === 0 && (
            <p className="history-modal__empty">No history data available for this sensor.</p>
          )}
          {!isLoading && !error && historyData.length > 0 && (
            <div className="history-modal__chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
