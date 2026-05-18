import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getBackendURL } from '../../utils/fetchApi';
import toast from 'react-hot-toast';

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
  const [loading, setLoading] = useState(false);

  // ✅ Redirect if already logged in (skip if currently on signup)
  useEffect(() => {
    if (user && window.location.pathname !== "/signup") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Call the register function (should only register, not log in)
      const res = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.username
      );

      // ✅ If register succeeds, redirect to login
      toast.success("Account created successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/50"></div>

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
            className="input-field"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="input-field"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="input-field"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white text-lg font-bold rounded-lg hover:bg-gray-800 transition duration-300"
          >
            {loading ? "Creating Account..." : "Sign up"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-gray-600"></div>
          <span className="px-3 text-gray-400 text-sm">or</span>
          <div className="flex-1 border-t border-gray-600"></div>
        </div>

        {/* Google Signup Button */}
        <button
          type="button"
          onClick={() => window.location.href = getBackendURL() + '/api/auth/google'}
          className="w-full bg-white text-gray-800 py-2 px-4 rounded-lg shadow flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors mb-4"
        >
          <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>

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
