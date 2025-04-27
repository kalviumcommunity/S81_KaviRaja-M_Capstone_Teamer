import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom"; 
import App from "./App.jsx";
import "./index.css";
import AuthProvider from "./context/AuthContext.jsx";
import '@fortawesome/fontawesome-free/css/all.min.css';


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router> 
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
