import React, { useState, useEffect } from "react";
import "../Login.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { BACKEND_URL } from "./config";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    // Only check and redirect if we're on the login page
    if (location.pathname === "/login") {
      const token = localStorage.getItem("access_token");
      if (token) {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    const { email, password } = formData;
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login/`, {
        email,
        password,
      });

      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem("access_token", access_token);
        navigate("/dashboard", { replace: true });
      } else {
        setError("No token received from the server");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="login-container">
      {/* Navigation Bar */}
      <div className="toolbar">
        <div className="toolbar-logo">
          <img src="/AI_INT.png" alt="Logo" className="logo" />
        </div>
        <div className="toolbar-title">AI INTERVIEW PREPARATION COACH</div>
        <div className="toolbar-links">
          <a href="/about" className="toolbar-link">About</a>
          <a href="/signup" className="toolbar-link">Sign Up</a>
        </div>
      </div>

      {/* Login Box */}
      <div className="login-box">
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">LOGIN</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-btn">Login</button>
          <p className="signup-link">
            Don't have an account?{" "}
            <Link to="/signup" className="signup-text">Sign Up</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;