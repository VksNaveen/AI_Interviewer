import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '/Users/sonaselvaraj/Documents/Capstone/AI Interviewer 2/AI_Interviewer/frontend/src/Login.css';

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
  
    setError(""); // Clear previous errors
  
    const response = await fetch("http://localhost:8000/auth/signup/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,  // ✅ Ensure FastAPI receives this correctly
      }),
    });
  
    const responseData = await response.json();
  
    if (response.ok) {
      navigate("/");
    } else {
      if (responseData.detail) {
        if (Array.isArray(responseData.detail)) {
          setError(responseData.detail.map((err) => err.msg).join(", "));
        } else {
          setError(responseData.detail);
        }
      } else {
        setError("Signup failed! Please try again.");
      }
    }
  };

  return (

    <div className="login-container">
      <div className="login-box">
       
        <form className="login-form" onSubmit={handleSignup}>
        <h2 className="login-title">SIGNUP</h2>
          <input 
            type="fullname" 
            name="fullname" 
            placeholder="Fullname" 
            className="input-field" 
            onChange={handleChange} 
            required 
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            placeholder="Email" 
            className="input-field" 
            onChange={handleChange}
            // className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password" 
            className="input-field" 
            value={formData.password}
            onChange={handleChange}
            // className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="ConfirmPassword"
            className="input-field" 
            value={formData.confirmPassword}
            onChange={handleChange}
            // className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <button type="submit" className="login-btn">Create Account</button>
          <p className="signup-link">
          Already have an account?
          <Link to="/" className="signup-text">Login</Link>
        </p>
        </form>
        
      </div>
    </div> 

    // <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
    //   <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
    //     <h2 className="text-3xl font-bold text-center text-gray-800">Sign Up</h2>
    //     <form className="mt-6" onSubmit={handleSignup}>

    //       <label className="block mb-2 text-gray-700">Full Name</label>
    //       <input
    //         type="text"
    //         name="username"
    //         value={formData.username}
    //         onChange={handleChange}
    //         className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
    //         required
    //       />

    //       <label className="block mt-4 mb-2 text-gray-700">Email</label>
    //       <input
    //         type="email"
    //         name="email"
    //         value={formData.email}
    //         onChange={handleChange}
    //         className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
    //         required
    //       />

    //       <label className="block mt-4 mb-2 text-gray-700">Password</label>
    //       <input
    //         type="password"
    //         name="password"
    //         value={formData.password}
    //         onChange={handleChange}
    //         className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
    //         required
    //       />

    //       <label className="block mt-4 mb-2 text-gray-700">Confirm Password</label>
    //       <input
    //         type="password"
    //         name="confirmPassword"
    //         value={formData.confirmPassword}
    //         onChange={handleChange}
    //         className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
    //         required
    //       />

    //       {error && <p className="text-red-500 mt-2">{error}</p>}

    //       <button
    //         type="submit"
    //         className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition"
    //       >
    //         Create Account
    //       </button>
    //     </form>

    //     <p className="mt-4 text-center text-gray-600">
    //       Already have an account?{" "}
    //       <Link to="/" className="text-blue-500 hover:underline">
    //         Login
    //       </Link>
    //     </p>

        
    //   </div>
    // </div>
  );
};

export default Signup;
