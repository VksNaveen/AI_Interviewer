import React, { useState } from "react";
import '../Login.css';
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:8000/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="login-container">
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
          <button type="submit" className="login-btn flex justify-center">Login</button>
          <p className="signup-link flex=centre">
          Don't have an account? 
          <Link to="/signup" className="signup-text">Sign Up</Link>
        </p>
        </form>
        
      </div>
    </div>
    // <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
    //   <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
    //     <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
    //     <form className="mt-6" onSubmit={handleLogin}>
    //       <input type="email" name="email" placeholder="Email" className="input" onChange={handleChange} required />
    //       <input type="password" name="password" placeholder="Password" className="input" onChange={handleChange} required />
    //       <button type="submit" className="btn-primary">Login</button>
    //     </form>
    //     <p className="mt-4 text-center">
    //       Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
    //     </p>
    //   </div>

    // </div>
  );
};

export default Login;


// <div className="login-form">
// <h2>Login</h2>
// <form onSubmit={handleLogin}>
//   <div className="input-group">
//     <label htmlFor="username">Username</label>
//     <input
//       type="text"
//       id="username"
//       value={username}
//       onChange={(e) => setUsername(e.target.value)}
//       placeholder="Enter your username"
//       required
//     />
//   </div>
//   <div className="input-group">
//     <label htmlFor="password">Password</label>
//     <input
//       type="password"
//       id="password"
//       value={password}
//       onChange={(e) => setPassword(e.target.value)}
//       placeholder="Enter your password"
//       required
//     />
//   </div>
//   {errorMessage && <p className="error">{errorMessage}</p>}
//   <button type="submit" className="login-button">Login</button>
// </form>
// <p className="mt-4 text-center">
//   Don't have an account? <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
// </p>
// </div>