import React, { useEffect, useState } from "react";
import "../../src/Dashboard.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const BACKEND_URL = "http://localhost:8000/api"; // Replace with your backend URL

const ProjectInfo = () => (
  <div className="project-info">
    <h2>Welcome to AI Interviewer</h2>
    <div className="project-description">
      <p>
        The AI Interviewer is a smart, interactive platform designed to simulate real interview 
        experiences using advanced AI models. It guides users through different rounds—Self Introduction, 
        Technical Questions, and MCQs—using voice prompts and evaluates their responses in real-time.
      </p>
      
      <div className="features">
        <h3>Key Features</h3>
        <div className="feature-grid">
          <div className="feature-item">
            <span className="feature-icon">🎤</span>
            <p>Voice-based interaction to simulate real interview environments</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🤖</span>
            <p>LLaMA-powered feedback on communication, technical knowledge, and confidence</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <p>Score tracking and feedback summaries to help users improve</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📚</span>
            <p>RAG (Retrieval-Augmented Generation) integration for context-aware questioning</p>
          </div>
        </div>
      </div>

      <div className="goal-section">
        <h3>Our Goal</h3>
        <p>
          The goal is to help users practice, improve, and gain confidence in interviews using 
          personalized AI feedback.
        </p>
      </div>

      <div className="get-started">
        <h3>Ready to Begin?</h3>
        <p>Click the "START INTERVIEW" button below to begin your interview practice journey!</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null); // Store the summary data
  const [message, setMessage] = useState(""); // Store the "no interviews" message
  const [chartData, setChartData] = useState([]); // Data for the chart

  const handleStartInterview = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("Please login again.");
        navigate("/");
        return;
      }

      const response = await axios.get("http://localhost:8000/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.data || response.data === "Profile not found") {
        alert("Please create your profile before starting the interview.");
        navigate("/profile-update");
        return;
      }

      // Check for required fields
      const profile = response.data;
      const requiredFields = {
        company_experience: "Work experience",
        skills: "Skills",
        preferred_role: "Preferred role",
        education: "Education details"
      };

      const missingFields = [];
      for (const [field, label] of Object.entries(requiredFields)) {
        if (!profile[field] || 
            (Array.isArray(profile[field]) && profile[field].length === 0) ||
            (typeof profile[field] === 'string' && profile[field].trim() === '')) {
          missingFields.push(label);
        }
      }

      if (missingFields.length > 0) {
        alert(`Please complete the following in your profile: ${missingFields.join(", ")}`);
        navigate("/profile-update");
        return;
      }

      // If profile is complete, proceed to interview
      navigate("/self-introduction");
    } catch (error) {
      if (error.response?.status === 401) {
        alert("Your session has expired. Please login again.");
        localStorage.removeItem("access_token");
        navigate("/");
      } else {
        console.error("Error checking profile:", error);
        alert("Error checking profile. Please try again.");
      }
    }
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("access_token"); // Retrieve the token
        if (!token) {
          console.error("No token found. Please log in again.");
          setMessage("You are not logged in. Please log in to view your interview summary.");
          navigate("/login"); // Redirect to login if no token is found
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/interview/summary/`, {
          headers: { Authorization: `Bearer ${token}` }, // Include the Bearer token
        });

        if (response.data.message) {
          setMessage(response.data.message); // Set the "no interviews" message
        } else {
          setSummary(response.data); // Set the summary data

          // Prepare data for the chart
          const chartData = response.data.self_intro.map((interview, index) => ({
            date: new Date(interview.timestamp).toLocaleDateString(),
            communication: interview.communication_score,
            confidence: interview.confidence_score,
            professionalism: interview.professionalism_score,
            mcq: response.data.mcq[index]?.score || 0,
            technical: response.data.technical[index]?.technical_knowledge_score || 0,
          }));
          setChartData(chartData);
        }
      } catch (error) {
        console.error("Error fetching interview summary:", error);
        if (error.response && error.response.status === 401) {
          setMessage("Unauthorized access. Please log in again.");
          navigate("/login"); // Redirect to login if unauthorized
        } else {
          setMessage("Failed to fetch interview summary. Please try again later.");
        }
      }
    };

    fetchSummary();
  }, [navigate]);

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
        {message ? (
          <ProjectInfo />
        ) : summary ? (
          <>
            <h2 className="page-heading">Interview Summary</h2>

            {/* Line Chart for Scores */}
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="communication" stroke="#8884d8" name="Communication" />
                  <Line type="monotone" dataKey="confidence" stroke="#82ca9d" name="Confidence" />
                  <Line type="monotone" dataKey="professionalism" stroke="#ffc658" name="Professionalism" />
                  <Line type="monotone" dataKey="mcq" stroke="#3498db" name="MCQ Score" />
                  <Line type="monotone" dataKey="technical" stroke="#e74c3c" name="Technical Knowledge" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Feedback Section */}
            <div className="feedback-container">
              <h3>Overall Performance</h3>
              <p>
                Average Score:{" "}
                {(
                  (summary.self_intro.reduce((acc, curr) => acc + curr.communication_score, 0) +
                    summary.mcq.reduce((acc, curr) => acc + (curr.score || 0), 0) +
                    summary.technical.reduce((acc, curr) => acc + (curr.technical_knowledge_score || 0), 0)) /
                  (summary.self_intro.length + summary.mcq.length + summary.technical.length)
                ).toFixed(2)}
              </p>
            </div>

            {/* Combined Interview Cards */}
            <div className="interview-history">
              {summary.self_intro.map((interview, index) => (
                <div key={index} className="combined-interview-card">
                  <h3>{new Date(interview.timestamp).toLocaleDateString()}</h3>
                  <div className="combined-scores">
                    <div>
                      <h4>Self Introduction</h4>
                      <p>
                        <strong>Communication:</strong> {interview.communication_score}
                      </p>
                      <p>
                        <strong>Confidence:</strong> {interview.confidence_score}
                      </p>
                      <p>
                        <strong>Professionalism:</strong> {interview.professionalism_score}
                      </p>
                      <p>
                        <strong>Feedback:</strong> {interview.feedback || "No feedback available."}
                      </p>
                    </div>
                    {summary.mcq[index] && (
                      <div>
                        <h4>MCQ Round</h4>
                        <p>
                          <strong>Score:</strong> {summary.mcq[index].score}
                        </p>
                        <p>
                          <strong>Feedback:</strong> {summary.mcq[index].feedback}
                        </p>
                      </div>
                    )}
                    {summary.technical[index] && (
                      <div>
                        <h4>Technical Round</h4>
                        <p>
                          <strong>Communication:</strong> {summary.technical[index].communication_score}
                        </p>
                        <p>
                          <strong>Technical Knowledge:</strong> {summary.technical[index].technical_knowledge_score}
                        </p>
                        <p>
                          <strong>Confidence:</strong> {summary.technical[index].confidence_score}
                        </p>
                        <p>
                          <strong>Feedback:</strong> {summary.technical[index].feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="loading-message">Loading interview data...</div>
        )}
      </main>

      {/* Separate Container for Start Interview Button */}
      <div className="start-interview-container">
        <button className="start-interview-button gradient-button" onClick={handleStartInterview}>
          START INTERVIEW
        </button>
      </div>
    </div>
  );
};

export default Dashboard;