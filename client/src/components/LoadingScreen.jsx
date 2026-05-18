import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      <motion.div
        className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <h1 className="mt-6 text-2xl font-bold text-white tracking-widest uppercase">Teamer</h1>
      <p className="mt-2 text-gray-400">{message}</p>
    </div>
  );
};

export default LoadingScreen;
