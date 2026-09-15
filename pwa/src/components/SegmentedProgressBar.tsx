import React from 'react';

interface SegmentedProgressBarProps {
  progressPercent: number;
  fillColor?: string;
  segments?: number;
  height?: number; // px
  showPercentText?: boolean;
}

export const SegmentedProgressBar: React.FC<SegmentedProgressBarProps> = ({
  progressPercent,
  fillColor = '#437A55',
  segments = 10,
  height = 8,
  showPercentText = true,
}) => {
  const clamped = Math.min(100, Math.max(0, progressPercent));
  const activeSegments = Math.min(segments, Math.round((clamped / 100) * segments));

  return (
    <div className="flex items-center space-x-2 w-full">
      {showPercentText && (
        <span
          className="text-xs font-bold w-9 text-left font-mono"
          style={{ color: clamped > 0 ? fillColor : 'var(--zen-text-secondary)' }}
        >
          {clamped}%
        </span>
      )}

      <div className="flex-1 flex space-x-[3px]" style={{ height: `${height}px` }}>
        {Array.from({ length: segments }).map((_, i) => {
          const isActive = i < activeSegments;
          return (
            <div
              key={i}
              className="flex-1 rounded-[2.5px] transition-colors duration-200"
              style={{
                backgroundColor: isActive ? fillColor : 'var(--zen-surface-subtle)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
