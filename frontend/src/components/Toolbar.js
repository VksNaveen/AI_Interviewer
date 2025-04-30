// src/components/Toolbar.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../../src/Toolbar.css';
import { BACKEND_URL } from "./config";

const Toolbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // Don't show toolbar on login page or profile update page
  if (location.pathname === '/' || location.pathname === '/profile-update') {
    return null;
  }

  // Only show toolbar if authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="toolbar">
      <div className="toolbar-logo">
        <img src="/AI_INT.png" alt="Logo" className="logo" />
      </div>
      <div className="toolbar-title">AI INTERVIEW PREPARATION COACH</div>
      <div className="toolbar-links">
        <button className="toolbar-link" onClick={() => navigate("/dashboard")}>
          Home
        </button>
        <a onClick={() => navigate("/profile-update")} className="toolbar-link">
          Profile
        </a>
        <a onClick={handleLogout} className="toolbar-link">
          Logout
        </a>
      </div>
    </header>
  );
};

export default Toolbar;
