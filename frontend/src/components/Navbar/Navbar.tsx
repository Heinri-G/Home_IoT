import React from 'react';
import './Navbar.css'; // Styles for Navbar
// import { useAuth } from '@context/AuthContext'; // For Keycloak logout

const Navbar: React.FC = () => {
  // const { logout } = useAuth(); // Example for Keycloak

  const handleLogout = () => {
    // logout(); // Call Keycloak logout
    console.log("Logout action triggered");
    // Redirect to login page or home
  };

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        {/* Placeholder for a logo image or text */}
        <img src="/plant-icon.svg" alt="Plant Care Logo" className="navbar__logo-img" /> {/* Example SVG */}
        <span className="navbar__logo-text">PlantCare Dashboard</span>
      </div>
      <div className="navbar__actions">
        {/* Other navbar items can go here: e.g., user profile, notifications icon */}
        <button onClick={handleLogout} className="navbar__button navbar__button--logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
