import React from "react";
import "../../src/Dashboard.css";
import { useNavigate } from "react-router-dom";


const mockInterviews = [
  { date: "March 10, 2025", score: 85, feedback: "Good communication, improve technical depth." },
  { date: "March 5, 2025", score: 78, feedback: "Solid problem-solving, work on speed." },
  { date: "February 28, 2025", score: 92, feedback: "Excellent! Keep refining system design skills." },
];

const Dashboard = () => {

  const navigate = useNavigate()

  const handleProfile=()=>{
    navigate("/profile-update")
  
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <button className="profile-button" onClick={handleProfile}>UPDATE PROFILE</button>
        
      </aside>
      <main className="main-content">
        {/* <h1 className="dashboard-title">AI Mock Interview Dashboard</h1> */}
        <div className="tiles-container">
          <div className="tile">Total Interviews: {mockInterviews.length}</div>
          <div className="tile">Average Score: {Math.round(mockInterviews.reduce((acc, cur) => acc + cur.score, 0) / mockInterviews.length)}</div>
        </div>
        <div className="interview-history">
          {mockInterviews.map((interview, index) => (
            <div key={index} className="interview-card">
              <h2>{interview.date}</h2>
              <p><strong>Score:</strong> {interview.score}</p>
              <p><strong>Feedback:</strong> {interview.feedback}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
