import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getBackendURL } from '../../utils/fetchApi';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

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
    <div className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background Image with Blur and Scaling Animation */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-cover bg-center filter blur-md brightness-50"
        style={{ backgroundImage: "url('/teamwork.jpg')" }}
      ></motion.div>

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/50"></div>

      {/* Floating Icons */}
      <motion.div
        className="absolute top-10 left-10 text-red-500"
        animate={{
          rotate: 360,
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-users fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-20 right-10 text-yellow-500"
        animate={{
          rotate: -360,
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-tasks fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 text-green-500"
        animate={{
          rotate: 360,
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-users-cog fa-4x"></i>
      </motion.div>

      {/* Additional Floating Icons */}
      <motion.div
        className="absolute top-40 left-1/4 text-white"
        animate={{
          rotate: 360,
          x: [0, -150, 0],
          y: [0, -150, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-calendar-alt fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-60 right-1/4 text-red-500"
        animate={{
          rotate: -360,
          x: [0, 150, 0],
          y: [0, -150, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-clipboard-list fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute bottom-40 right-1/4 text-yellow-500"
        animate={{
          rotate: 180,
          x: [0, 200, 0],
          y: [0, -200, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-cogs fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/4 text-teal-500"
        animate={{
          rotate: 360,
          x: [0, 120, 0],
          y: [0, -120, 0],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-phone-alt fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-10 right-1/4 text-orange-500"
        animate={{
          rotate: -360,
          x: [0, -120, 0],
          y: [0, 120, 0],
        }}
        transition={{
          duration: 13,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-comments fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-1/4 left-1/2 text-purple-500"
        animate={{
          rotate: 360,
          x: [0, 80, 0],
          y: [0, 80, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-bell fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-1/2 text-pink-500"
        animate={{
          rotate: -360,
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
        <i className="fas fa-heart fa-4x"></i>
      </motion.div>

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
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
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
