import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const GroupPerformance = ({ members }) => {
  const data = members.map(member => ({
    name: member.name,
    messages: Math.floor(Math.random() * 100),
    tasks: Math.floor(Math.random() * 20),
  }));

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      <h3 className="text-white text-lg mb-4">Group Performance</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
            />
            <Bar dataKey="messages" fill="#3B82F6" name="Messages" />
            <Bar dataKey="tasks" fill="#10B981" name="Tasks" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GroupPerformance;