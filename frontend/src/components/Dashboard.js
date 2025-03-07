import React from 'react';
import 'E:/Capstone 2/AI_Interviewer/frontend/src/Dashboard.css';  // Import the CSS file for Dashboard styles

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h2 className="dashboard-title">AI Interview Preparation - Mock Interviews</h2>
      <div className="tiles-container">
        {/* Mock Interview Tile 1 - AI Basics */}
        <div className="tile">
          <h5>Mock Interview 1: AI Basics</h5>
          <p>Prepare for basic AI concepts, terminology, and problem-solving questions.</p>
          <button className="tile-btn">Start Interview</button>
        </div>

        {/* Mock Interview Tile 2 - Machine Learning */}
        <div className="tile">
          <h5>Mock Interview 2: Machine Learning</h5>
          <p>Test your knowledge on ML algorithms, supervised and unsupervised learning.</p>
          <button className="tile-btn">Start Interview</button>
        </div>

        {/* Mock Interview Tile 3 - Data Structures */}
        <div className="tile">
          <h5>Mock Interview 3: Data Structures</h5>
          <p>Prepare for questions on arrays, linked lists, trees, and graphs.</p>
          <button className="tile-btn">Start Interview</button>
        </div>

        {/* Mock Interview Tile 4 - Algorithms */}
        <div className="tile">
          <h5>Mock Interview 4: Algorithms</h5>
          <p>Brush up on sorting, searching algorithms, and dynamic programming.</p>
          <button className="tile-btn">Start Interview</button>
        </div>

        {/* Mock Interview Tile 5 - System Design */}
        <div className="tile">
          <h5>Mock Interview 5: System Design</h5>
          <p>Prepare for system design questions commonly asked in interviews.</p>
          <button className="tile-btn">Start Interview</button>
        </div>

        {/* Mock Interview Tile 6 - Deep Learning */}
        <div className="tile">
          <h5>Mock Interview 6: Deep Learning</h5>
          <p>Prepare for questions on neural networks, CNNs, RNNs, and deep learning architectures.</p>
          <button className="tile-btn">Start Interview</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
