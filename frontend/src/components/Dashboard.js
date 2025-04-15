import React from "react";
import "../../src/Dashboard.css";
import { useNavigate } from "react-router-dom";

const mockInterviews = [
  { date: "March 10, 2025", score: 85, feedback: "Good communication, improve technical depth." },
  { date: "March 5, 2025", score: 78, feedback: "Solid problem-solving, work on speed." },
  { date: "February 28, 2025", score: 92, feedback: "Excellent! Keep refining system design skills." },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleStartInterview = () => {
    navigate("/self-introduction");
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="toolbar">
        <div className="toolbar-logo">
          <img src="/AI_INT.png" alt="Logo" className="logo" />
        </div>
        <div className="toolbar-title">AI INTERVIEW PREPARATION COACH</div>
        <div className="toolbar-links">
          <a onClick={() => navigate("/profile-update")} className="toolbar-link">
            Profile
          </a>
          <a onClick={() => navigate("/")} className="toolbar-link">
            Logout
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* <h1 className="page-heading">AI INTERVIEW PREPARATION COACH</h1> */}
        <div className="tiles-container">
          <div className="tile">Total Interviews: {mockInterviews.length}</div>
          <div className="tile">
            Average Score:{" "}
            {Math.round(
              mockInterviews.reduce((acc, cur) => acc + cur.score, 0) / mockInterviews.length
            )}
          </div>
        </div>
        <div className="interview-history">
          {mockInterviews.map((interview, index) => (
            <div key={index} className="interview-card">
              <h2>{interview.date}</h2>
              <p>
                <strong>Score:</strong> {interview.score}
              </p>
              <p>
                <strong>Feedback:</strong> {interview.feedback}
              </p>
            </div>
          ))}
        </div>
        <div className="start-interview-container">
          <button className="start-interview-button" onClick={handleStartInterview}>
            START INTERVIEW
          </button>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;