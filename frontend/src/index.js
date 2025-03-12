import React from "react";
import ReactDOM from "react-dom/client";  // ✅ Use createRoot
import App from "./App";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root")); // ✅ Correct way in React 18
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
