import React from 'react';
import { tokens } from '../../styles/tokens';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showLabel?: boolean;
  className?: string;
}

export default function ProgressBar({
  value,
  max = 100,
  size = 'md',
  color = tokens.colors.accent,
  showLabel = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const heightStyles: Record<string, string> = {
    sm: '4px',
    md: '8px',
    lg: '12px',
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: tokens.colors.borderLight,
    borderRadius: tokens.borderRadius.full,
    overflow: 'hidden',
  };

  const barStyles: React.CSSProperties = {
    height: heightStyles[size],
    width: `${percentage}%`,
    backgroundColor: color,
    borderRadius: tokens.borderRadius.full,
    transition: 'width 0.3s ease',
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeXs,
    color: tokens.colors.textSecondary,
    marginTop: tokens.spacing[1],
  };

  return (
    <div className={className}>
      <div style={containerStyles}>
        <div style={barStyles} />
      </div>
      {showLabel && (
        <span style={labelStyles}>{Math.round(percentage)}%</span>
      )}
    </div>
  );
}
