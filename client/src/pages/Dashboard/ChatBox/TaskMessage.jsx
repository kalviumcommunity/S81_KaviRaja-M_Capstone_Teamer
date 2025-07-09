import React from 'react';
import { CheckCircle, CheckCircle2 } from 'lucide-react';

const TaskMessage = ({ task, onComplete, onApprove, isAdmin, isAssignee }) => {
  // Debug: log task state as string
  console.log('TaskMessage props:', JSON.stringify({ task, isAdmin, isAssignee, completed: task.completed, approved: task.approved, id: task.id }));

  return (
    <div className="bg-gray-800 rounded-lg p-4 max-w-[80%] break-words">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-white">Task Assignment</h4>
        {task.completed && !task.approved && isAdmin && (
          <button
            onClick={() => onApprove(task.id)}
            className="text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-700 transition-colors"
          >
            Approve
          </button>
        )}
      </div>
      
      <p className="text-white mb-2">{task.description}</p>
      
      <div className="text-sm text-gray-300">
        Assigned to: {task.assignedTo}
      </div>
      
      {isAssignee && !task.completed && (
        <button
          onClick={() => onComplete(task.id)}
          className="mt-3 flex items-center gap-2 text-sm bg-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-700 transition-colors"
        >
          <CheckCircle size={16} />
          <span>Mark as Complete</span>
        </button>
      )}
      
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-400">
        <CheckCircle2 
          size={16} 
          className={task.completed ? 'text-green-500' : 'text-gray-600'} 
        />
        <span>
          {task.completed ? 'Completed' : 'Pending'}
          {task.approved && ' - Approved'}
        </span>
      </div>
    </div>
  );
};

export default TaskMessage;