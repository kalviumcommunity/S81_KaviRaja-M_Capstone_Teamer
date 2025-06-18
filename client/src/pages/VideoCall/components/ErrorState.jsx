import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-900 text-white">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-xl font-semibold mb-2">{message}</h3>
      {onRetry && (
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;