import React, { useEffect, useState } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { X } from 'lucide-react';

const GroupPerformance = ({ onClose }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch('/users/performance')
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => setUsers([]));
  }, []);
  if (loading) return <div className="text-white p-8">Loading performance scores...</div>;
  const data = users.map(user => ({
    member: user.name,
    score: user.performanceScore || 0,
    scoreColor: '#3B82F6',
  }));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-white">Group Performance</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="h-[400px]">
        <ResponsiveBar
          data={data}
          keys={['score']}
          indexBy="member"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={['#3B82F6']}
          borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Members',
            legendPosition: 'middle',
            legendOffset: 40,
            textColor: '#9CA3AF'
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Performance Score',
            legendPosition: 'middle',
            legendOffset: -40,
            textColor: '#9CA3AF'
          }}
          labelSkipWidth={12}
          labelSkipHeight={12}
          labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
          legends={[
            {
              dataFrom: 'keys',
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 120,
              translateY: 0,
              itemsSpacing: 2,
              itemWidth: 100,
              itemHeight: 20,
              itemDirection: 'left-to-right',
              itemOpacity: 0.85,
              symbolSize: 20,
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemOpacity: 1
                  }
                }
              ],
              textColor: '#9CA3AF'
            }
          ]}
          role="application"
          ariaLabel="Group performance chart"
          theme={{
            background: 'transparent',
            textColor: '#9CA3AF',
            fontSize: 11,
            axis: {
              domain: {
                line: {
                  stroke: '#4B5563',
                  strokeWidth: 1
                }
              },
              ticks: {
                line: {
                  stroke: '#4B5563',
                  strokeWidth: 1
                }
              }
            },
            grid: {
              line: {
                stroke: '#374151',
                strokeWidth: 1
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default GroupPerformance;