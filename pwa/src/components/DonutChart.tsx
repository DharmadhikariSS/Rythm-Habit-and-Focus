import React from 'react';
import { SessionRecord } from '../types';

interface DonutChartProps {
  sessions: SessionRecord[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Study: '#2D5A43',
  Code: '#52B788',
  Reading: '#74C69D',
  Work: '#40916C',
  Break: '#A7C957',
  Creative: '#606C38',
  Other: '#386641',
};

export const DonutChart: React.FC<DonutChartProps> = ({ sessions }) => {
  // Aggregate minutes by category
  const categoryTotals = sessions.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + s.durationMinutes;
    return acc;
  }, {} as Record<string, number>);

  const totalMinutes = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  if (totalMinutes === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-center">
        <p className="text-xs text-zen-muted font-medium">No focus sessions recorded yet.</p>
        <span className="text-[11px] text-zen-subtle mt-1">Start a timer to see category breakdown.</span>
      </div>
    );
  }

  // Calculate SVG arc paths
  const radius = 50;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const slices = Object.entries(categoryTotals).map(([cat, mins]) => {
    const percent = mins / totalMinutes;
    const dashoffset = circumference - percent * circumference;
    const rotation = accumulatedPercent * 360 - 90;
    accumulatedPercent += percent;

    return {
      category: cat,
      minutes: mins,
      percent: Math.round(percent * 100),
      color: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
      dasharray: circumference,
      dashoffset,
      rotation,
    };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
      {/* SVG Donut */}
      <div className="relative w-36 h-36 flex items-center justify-center flex-shrink-0">
        <svg className="w-full h-full" viewBox="0 0 130 130">
          {slices.map((slice, i) => (
            <circle
              key={i}
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke={slice.color}
              strokeWidth={strokeWidth}
              strokeDasharray={slice.dasharray}
              strokeDashoffset={slice.dashoffset}
              style={{
                transformOrigin: 'center',
                transform: `rotate(${slice.rotation}deg)`,
                transition: 'stroke-dashoffset 0.6s ease',
              }}
            />
          ))}
        </svg>

        {/* Center Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-xl font-bold tracking-tight text-zen-text">{totalMinutes}m</span>
          <span className="text-[10px] text-zen-muted uppercase tracking-wider font-semibold">Total</span>
        </div>
      </div>

      {/* Legend List */}
      <div className="flex flex-col space-y-2 w-full max-w-[160px]">
        {slices.map(slice => (
          <div key={slice.category} className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: slice.color }}
              />
              <span className="font-medium text-zen-text truncate">{slice.category}</span>
            </div>
            <span className="text-zen-muted font-semibold ml-2">{slice.minutes}m</span>
          </div>
        ))}
      </div>
    </div>
  );
};
