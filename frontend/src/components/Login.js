import React, { useState } from "react";
import "../Login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = "http://localhost:8000";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/login/`, {
        email,
        password,
      });

      const { access_token } = response.data; // Extract the token
      if (access_token) {
        localStorage.setItem("access_token", access_token); // Save the token to local storage
        console.log("Token saved:", access_token);
        navigate("/dashboard"); // Redirect to the dashboard or another page
      } else {
        console.error("No token received from the server.");
      }
    } catch (error) {
      console.error("Login failed:", error.response?.data || error.message);
    }
  };

  const token = localStorage.getItem("access_token");
  if (!token) {
    console.error("No token found. Please log in again.");
  } else {
    console.log("Token retrieved:", token);
  }

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
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="input-field"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="input-field"
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