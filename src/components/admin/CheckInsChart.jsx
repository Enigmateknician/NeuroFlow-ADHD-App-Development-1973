import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays, startOfDay } from 'date-fns';

/**
 * CheckInsChart Component - Bar chart showing daily check-ins for the last 7 days
 */
const CheckInsChart = ({ data, loading = false }) => {
  // Generate last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: startOfDay(date),
      label: format(date, 'EEE'),
      fullLabel: format(date, 'MMM d')
    };
  });

  // Map data to days
  const chartData = last7Days.map(day => {
    const dayData = data.find(d => {
      const dataDate = startOfDay(new Date(d.date));
      return dataDate.getTime() === day.date.getTime();
    });
    return {
      ...day,
      count: dayData ? dayData.count : 0
    };
  });

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Check-ins (Last 7 Days)</h3>
        <div className="animate-pulse">
          <div className="flex items-end justify-between h-40">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div className="bg-gray-200 rounded w-full mx-1" style={{ height: `${Math.random() * 120 + 20}px` }}></div>
                <div className="h-4 bg-gray-200 rounded w-8 mt-2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Check-ins (Last 7 Days)</h3>
      
      <div className="flex items-end justify-between h-40 mb-4">
        {chartData.map((day, index) => (
          <motion.div
            key={day.label}
            className="flex flex-col items-center flex-1 group"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.div
              className="bg-purple-500 rounded-t w-full mx-1 relative hover:bg-purple-600 transition-colors cursor-pointer"
              style={{ 
                height: maxCount > 0 ? `${(day.count / maxCount) * 120 + 20}px` : '20px',
                minHeight: '20px'
              }}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scaleY: 1.05 }}
            >
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {day.fullLabel}: {day.count} check-ins
              </div>
              
              {/* Count label */}
              {day.count > 0 && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                  {day.count}
                </div>
              )}
            </motion.div>
            
            <div className="text-xs text-gray-500 mt-2 font-medium">
              {day.label}
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="text-center text-sm text-gray-500">
        Total check-ins: {chartData.reduce((sum, day) => sum + day.count, 0)}
      </div>
    </motion.div>
  );
};

export default CheckInsChart;