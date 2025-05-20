import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AnalyticsGraph = ({ tasks, members }) => {
  // Calculate completion stats per member
  const memberStats = members.map(member => {
    const completedTasks = tasks.filter(
      task => task.assignedTo === member.name && task.completed && task.approved
    ).length;
    
    return {
      name: member.name,
      completed: completedTasks
    };
  });

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-white text-lg mb-4">Task Completion Stats</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={memberStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff'
              }}
            />
            <Bar dataKey="completed" fill="#10B981" name="Completed Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsGraph;