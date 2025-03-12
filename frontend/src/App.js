import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import UserProfileUpdate from "./components/UserProfileUpdate";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Import it

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/profile-update" element={<ProtectedRoute element={<UserProfileUpdate />} />} />
      </Routes>
    </Router>
  );
}

export default App;
