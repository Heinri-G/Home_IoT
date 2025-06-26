import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '@components/Navbar/Navbar';
import Sidebar from '@components/Sidebar/Sidebar'; // Placeholder, will create
import DashboardPage from '@pages/DashboardPage'; // Placeholder, will create
import SensorsPage from '@pages/SensorsPage'; // Placeholder, will create
import SettingsPage from '@pages/SettingsPage'; // Placeholder, will create
// import LoginPage from '@pages/LoginPage'; // For Keycloak integration later
// import { useAuth } from '@context/AuthContext'; // For Keycloak integration later

import './App.css'; // Main App specific styles

function App() {
  // const { isAuthenticated } = useAuth(); // Example for Keycloak

  // if (!isAuthenticated) { // Example for Keycloak
  //   return <LoginPage />;
  // }

  return (
    <div className="app-container">
      <Navbar />
      <div className="main-content-area">
        <Sidebar />
        <main className="page-content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/sensors" element={<SensorsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            {/* Add other routes here, e.g., for login, specific sensor details */}
            {/* <Route path="/login" element={<LoginPage />} /> */}
            <Route path="*" element={<Navigate to="/dashboard" />} /> {/* Fallback */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
