import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getBackendURL } from '../../utils/fetchApi';
import { Eye, EyeOff } from 'lucide-react';
const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      // navigate("/dashboard"); // Remove direct call, let useEffect handle it
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800">
      {/* No background image */}
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/50"></div>

      {/* Centered Login Form */}
      <div className="relative z-10 bg-gray-900 bg-opacity-90 p-8 rounded-lg shadow-lg w-96 flex flex-col gap-4">
        <h2 className="text-3xl font-extrabold text-center text-white mb-4">
          Login to Teamer
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="email"
            type="email"
            placeholder="Email or Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold">Login</button>
          {error && <div className="text-red-400 text-xs mt-2">{error}</div>}
        </form>
        
        {/* Divider */}
        <div className="flex items-center my-2">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>
        
        {/* Google Login Button */}
        <button
          type="button"
          onClick={() => window.location.href = getBackendURL() + '/api/auth/google'}
          className="bg-white text-gray-800 py-2 px-4 rounded-lg shadow flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>
        
        <p className="text-sm text-center text-gray-400 mt-4">
          Don't have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-400 hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
