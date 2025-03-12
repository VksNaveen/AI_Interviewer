import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">Welcome to Your Dashboard</h1>
      <p className="text-lg text-gray-600 mt-4">
        Here you can track your interviews, progress, and improvements.
      </p>

      <button
        onClick={() => navigate("/profile-update")}
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition"
      >
        Update Profile
      </button>
    </div>
  );
};

export default Dashboard;
