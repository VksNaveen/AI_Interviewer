// src/components/Toolbar.js
import React from 'react';
import { useNavigate } from "react-router-dom";
import '../../src/Toolbar.css';

const Toolbar = () => {
  const navigate = useNavigate();

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
        <button className="toolbar-link" onClick={() => navigate("/profile-update")}>
          Profile
        </button>
        <button className="toolbar-link" onClick={() => {
          localStorage.removeItem("access_token");
          navigate("/");
        }}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Toolbar;
