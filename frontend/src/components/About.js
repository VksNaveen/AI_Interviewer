import React from "react";
import "../About.css";
import { BACKEND_URL } from "./config";

const About = () => {
  return (
    <div className="about-container">
      <div className="toolbar">
        <div className="toolbar-title">AI INTERVIEW PREPARATION COACH</div>
        <div className="toolbar-links">
          <a href="/login" className="toolbar-link">Login</a>
          <a href="/signup" className="toolbar-link">Sign Up</a>
        </div>
      </div>
      <div className="about-content">
        <h1 className="about-title">About This Project</h1>
        <p className="about-description">
          The AI Interview Preparation Coach is a cutting-edge platform designed to help candidates prepare for interviews effectively. 
          It uses advanced AI technologies to simulate real interview scenarios, provide feedback, and improve your skills.
        </p>
        <p className="about-description">
          Key Features:
          <ul>
            <li>Interactive self-introduction and technical rounds</li>
            <li>AI-generated questions and feedback</li>
            <li>Speech-to-text and text-to-speech integration</li>
            <li>Personalized coaching and progress tracking</li>
          </ul>
        </p>
      </div>
    </div>
  );
};

export default About;