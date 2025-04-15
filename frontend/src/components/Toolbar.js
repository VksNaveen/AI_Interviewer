// src/components/Toolbar.js
import React from 'react';
import { useNavigate } from "react-router-dom"; // Import useNavigate
import '../../src/Toolbar.css';

const Toolbar = () => {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <header className="toolbar">
    <div className="toolbar-logo">
      <img src="/AI_INT.png" alt="Logo" className="logo" />
    </div>
    <div className="toolbar-title">AI INTERVIEW PREPARATION COACH</div>
    <div className="toolbar-links">
      <button className="toolbar-link" onClick={() => window.location.href = "/dashboard"}>
        Home
      </button>
      <button className="toolbar-link" onClick={() => window.location.href = "/profile-update"}>
        Profile
      </button>
      <button className="toolbar-link" onClick={() => window.location.href = "/"}>
        Logout
      </button>
    </div>
  </header>
  );
};

export default Toolbar;
