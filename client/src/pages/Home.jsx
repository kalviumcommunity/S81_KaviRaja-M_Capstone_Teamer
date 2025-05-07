import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import React from "react";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-black">

      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-cover bg-center filter blur-md brightness-50"
        style={{ backgroundImage: "url('/path-to-your-image.jpg')" }}
      ></motion.div>

      
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/50"></div>

      
      <motion.div
        className="absolute top-10 left-10 text-red-500"
        animate={{
          rotate: 360,
          x: [0, 100, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
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
        transition={{ duration: 15, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
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
        transition={{ duration: 12, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-users-cog fa-4x"></i>
      </motion.div>

      <motion.div
        className="absolute top-40 left-1/3 text-white"
        animate={{
          rotate: 360,
          x: [0, -150, 0],
          y: [0, -150, 0],
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
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
        transition={{ duration: 14, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
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
        transition={{ duration: 18, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      >
        <i className="fas fa-cogs fa-4x"></i> 
      </motion.div>

      
      <div className="relative z-10 text-center text-white">
        <p className="text-5xl md:text-6xl font-bold w-full max-w-4xl leading-tight">
          Welcome to Teamer - Collaborate, Organize, Succeed
        </p>

        
        <div className="mt-8 flex justify-center space-x-6">
          <button 
            onClick={() => navigate("/login")} 
            className="px-8 py-3 bg-white text-black text-lg font-medium rounded-lg shadow-lg transition-all duration-300 hover:bg-gray-100"
          >
            Login
          </button>
          <button 
            onClick={() => navigate("/signup")} 
            className="px-8 py-3 bg-gray-600 text-white text-lg font-medium rounded-lg shadow-lg transition-all duration-300 hover:bg-gray-700"
          >
            Signup
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;



