import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Signup = () => {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    username: ""
  });
  const [error, setError] = useState("");

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard");
    return null; // Prevent rendering anything else
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password, formData.username);
      navigate("/login"); // Go to login page after signup
    } catch (err) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">

      {/* Floating Icons Around Screen */}
      <motion.div
        className="absolute top-10 left-10 text-red-500"
        animate={{ rotate: 360, x: [0, 100, 0], y: [0, -100, 0] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-users fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-20 right-10 text-yellow-500"
        animate={{ rotate: -360, x: [0, -100, 0], y: [0, 100, 0] }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-tasks fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute bottom-20 left-20 text-green-500"
        animate={{ rotate: 360, x: [0, -100, 0], y: [0, 100, 0] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-users-cog fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-40 left-1/3 text-white"
        animate={{ rotate: 360, x: [0, -150, 0], y: [0, -150, 0] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-calendar-alt fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-60 right-1/4 text-red-500"
        animate={{ rotate: -360, x: [0, 150, 0], y: [0, -150, 0] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-clipboard-list fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute bottom-40 right-1/4 text-yellow-500"
        animate={{ rotate: 180, x: [0, 200, 0], y: [0, -200, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-cogs fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-10 right-1/2 text-purple-500"
        animate={{ rotate: 360, x: [0, -120, 0], y: [0, 120, 0] }}
        transition={{ duration: 16, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-comments fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-1/2 text-teal-500"
        animate={{ rotate: -360, x: [0, 100, 0], y: [0, -100, 0] }}
        transition={{ duration: 13, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-bell fa-4x"></i>
      </motion.div>

      {/* Signup Box */}
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black p-8 rounded-lg shadow-lg w-96 z-10">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Name"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white text-black rounded-lg border border-gray-300 focus:outline-none"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white text-black rounded-lg border border-gray-300 focus:outline-none"
          />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white text-black rounded-lg border border-gray-300 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-white text-black rounded-lg border border-gray-300 focus:outline-none"
          />
          <button
            type="submit"
            className="w-full py-3 bg-black text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition duration-300"
          >
            Register
          </button>
        </form>
        <div className="mt-4 text-center">
          <p className="text-white">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-teal-200 cursor-pointer hover:underline"
            >
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
