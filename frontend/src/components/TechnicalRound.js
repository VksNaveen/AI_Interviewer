import React, { useState, useEffect } from "react";
import "../../src/SelfIntroduction.css"; // Reuse the same CSS file
import { useNavigate } from "react-router-dom";
import { FaMicrophone } from "react-icons/fa"; // Import microphone icon

const TechnicalRound = () => {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(30); // Timer for 30 seconds
  const [question, setQuestion] = useState("What is your understanding of REST APIs?"); // Example question
  const [response, setResponse] = useState(""); // User's response

  // Handle recording logic
  const handleMicClick = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimer(30); // Reset timer to 30 seconds
    } else {
      setIsRecording(false);
    }
  };

  // Countdown timer for recording
  useEffect(() => {
    let interval;
    if (isRecording && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRecording(false); // Stop recording when timer reaches 0
    }
    return () => clearInterval(interval);
  }, [isRecording, timer]);

  // Handle next button click
  const handleNext = () => {
    navigate("/next-section"); // Replace with the actual route for the next section
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <header className="top-nav">
        <nav className="nav-bar">
          <ul className="nav-links">
            <li onClick={() => navigate("/dashboard")}>Dashboard</li>
            <li onClick={() => navigate("/profile-update")}>Profile</li>
            <li onClick={() => navigate("/logout")}>Logout</li>
          </ul>
        </nav>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="page-heading">Technical Round</h1>

        {/* AI Interaction Section */}
        <div className="ai-interaction-container">
          <p className="question">{question}</p>
          <div className="mic-container">
            <button
              className={`mic-button ${isRecording ? "recording" : ""}`}
              onClick={handleMicClick}
            >
              <FaMicrophone size={50} />
            </button>
            {isRecording && <p className="timer">Recording... {timer}s remaining</p>}
          </div>
          <div className="response-container">
            <p><strong>Your Response:</strong> {response || "Waiting for your response..."}</p>
          </div>
        </div>

        {/* Next Button */}
        <div className="next-button-container">
          <button className="next-button" onClick={handleNext}>
            NEXT
          </button>
        </div>
      </main>
    </div>
  );
};

export default TechnicalRound;