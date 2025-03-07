// src/components/Login.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // For navigation to Sign-Up page
import '../../src/Login.css'; // Import CSS for styling
import image from '../assets/Interview image.jpeg'
import { useNavigate  } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate ();


  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation for fields
    if (!email || !password) {
      setErrorMessage('Both fields are required!');
      return;
    }

    // Handle login logic here (API call, etc.)

    setErrorMessage('');
    alert('Login successful!');
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <div className="image-section">
        {/* <img src={image} alt="Login Background" />  Replace with your image */}
      </div>
      <div className="login-form">
      
        <h2>Login</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="login-btn">Login</button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
