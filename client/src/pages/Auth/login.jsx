import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

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
      <div className="relative z-10 bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-extrabold text-center text-black mb-4">
          Login to Teamer
        </h2>
        {error && (
          <p className="text-red-500 text-center mb-4">{error}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
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
          <button
            type="submit"
            className="w-full py-3 bg-black text-white font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300"
          >
            Login
          </button>
        </form>
        <p className="text-sm text-center text-black mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-black hover:underline cursor-pointer"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
