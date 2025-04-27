import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ element }) => {
  const isAuthenticated = localStorage.getItem("access_token"); // Check if user is logged in
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
