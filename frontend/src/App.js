import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import UserProfileUpdate from "./components/UserProfileUpdate";
import ProtectedRoute from "./components/ProtectedRoute"; // ✅ Import it
import Toolbar from "./components/Toolbar";
import SelfIntroduction from "./components/SelfIntroduction"; // ✅ Import SelfIntroduction
import TechnicalRound from "./components/TechnicalRound";

function App() {
  return (
    <Router>
      <Toolbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/profile-update" element={<ProtectedRoute element={<UserProfileUpdate />} />} />
        <Route path="/self-introduction" element={<ProtectedRoute element={<SelfIntroduction />} />} /> {/* ✅ Add route for SelfIntroduction */}
        <Route path="/technical-round" element={<TechnicalRound />} />
      </Routes>
    </Router>
  );
}

export default App;