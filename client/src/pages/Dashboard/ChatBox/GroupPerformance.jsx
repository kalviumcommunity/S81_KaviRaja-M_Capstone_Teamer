import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { X } from 'lucide-react';

const GroupPerformance = ({ members, onClose }) => {
  // Transform data for the chart
  const data = members.map(member => ({
    member: member.name,
    tasks: member.performance?.tasksCompleted || 0,
    tasksColor: '#3B82F6',
    messages: member.messageCount || 0,
    messagesColor: '#10B981',
    polls: member.performance?.pollsCreated || 0,
    pollsColor: '#8B5CF6',
    attendance: member.performance?.meetings?.attended || 0,
    attendanceColor: '#F59E0B'
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
          keys={['tasks', 'messages', 'polls', 'attendance']}
          indexBy="member"
          margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
          padding={0.3}
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B']}
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
            legend: 'Count',
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