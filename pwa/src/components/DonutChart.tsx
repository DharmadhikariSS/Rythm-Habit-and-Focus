import React from 'react';

export interface DonutSliceData {
  label: string;
  value: number; // minutes or seconds
  color: string;
  percentage: number;
}

interface DonutChartProps {
  slices: DonutSliceData[];
  totalText: string;
  size?: number;
  strokeWidth?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  slices,
  totalText,
  size = 140,
  strokeWidth = 16,
}) => {
  const total = slices.reduce((acc, s) => acc + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = -90; // Start at top

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-1">
      {/* SVG Donut */}
      <div className="relative flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {total <= 0 ? (
            /* Empty Track Fallback */
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="var(--zen-border)"
              strokeWidth={strokeWidth}
            />
          ) : (
            slices.map((slice, i) => {
              const fraction = slice.value / total;
              const sweepAngle = Math.max(0, fraction * 360 - (slices.length > 1 ? 2.5 : 0));
              const strokeLength = (sweepAngle / 360) * circumference;
              const strokeDasharray = `${strokeLength} ${circumference}`;

              const rotation = accumulatedAngle;
              accumulatedAngle += fraction * 360;

              return (
                <circle
                  key={i}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={0}
                  style={{
                    transformOrigin: 'center',
                    transform: `rotate(${rotation}deg)`,
                    transition: 'stroke-dasharray 0.5s ease',
                  }}
                />
              );
            })
          )}
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <span className="text-base font-bold text-zen-text-primary tracking-tight font-mono">
            {totalText}
          </span>
          <span className="text-[10px] font-semibold text-zen-text-secondary uppercase tracking-wider">
            Total Focus
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col space-y-1.5 w-full max-w-[170px]">
        {slices.length === 0 ? (
          <span className="text-xs text-zen-text-secondary text-center">No focus data recorded</span>
        ) : (
          slices.map(slice => (
            <div key={slice.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="font-semibold text-zen-text-primary truncate">{slice.label}</span>
              </div>
              <span className="text-zen-text-secondary font-mono font-bold ml-2">
                {slice.percentage}%
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
