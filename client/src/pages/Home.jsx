import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black">

      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      <div className="relative z-10 text-center text-white">
        <p className="text-5xl md:text-6xl font-bold w-full max-w-4xl leading-tight">
          Welcome to Teamer - Collaborate, Organize, Succeed
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <span className="px-4 py-1.5 rounded-full bg-gray-800 text-sm font-medium border border-gray-700">real-time chat</span>
          <span className="px-4 py-1.5 rounded-full bg-gray-800 text-sm font-medium border border-gray-700">video calls</span>
          <span className="px-4 py-1.5 rounded-full bg-gray-800 text-sm font-medium border border-gray-700">task tracking</span>
          <span className="px-4 py-1.5 rounded-full bg-gray-800 text-sm font-medium border border-gray-700">polls</span>
        </div>

        
        <div className="mt-8 flex justify-center space-x-6">
          <button 
            onClick={() => navigate("/login")} 
            className="btn-primary px-8 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg transition-all duration-300 hover:bg-blue-700"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/signup")} 
            className="btn-secondary px-8 py-3 bg-gray-700 text-white text-lg font-medium rounded-lg shadow-lg transition-all duration-300 hover:bg-gray-600"
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;



