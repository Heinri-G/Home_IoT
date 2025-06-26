import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Styles for Sidebar

const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <nav className="sidebar__nav">
        <ul className="sidebar__list">
          <li className="sidebar__item">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              {/* Icon placeholder (e.g., from an icon library or SVG) */}
              <span className="sidebar__icon">📊</span> {/* Placeholder icon */}
              <span className="sidebar__text">Dashboard</span>
            </NavLink>
          </li>
          <li className="sidebar__item">
            <NavLink
              to="/sensors"
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              <span className="sidebar__icon">🌡️</span> {/* Placeholder icon */}
              <span className="sidebar__text">Sensors</span>
            </NavLink>
          </li>
          <li className="sidebar__item">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? 'sidebar__link sidebar__link--active' : 'sidebar__link'
              }
            >
              <span className="sidebar__icon">⚙️</span> {/* Placeholder icon */}
              <span className="sidebar__text">Settings</span>
            </NavLink>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
