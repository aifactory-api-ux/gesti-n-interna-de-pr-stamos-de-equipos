import React from 'react';
import { tokens } from '../../styles/tokens';

interface ChipProps {
  children: React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  color?: string;
  className?: string;
}

export default function Chip({
  children,
  selected = false,
  onClick,
  color = tokens.colors.accent,
  className = '',
}: ChipProps) {
  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing[1],
    padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: selected ? tokens.typography.fontWeightSemibold : tokens.typography.fontWeightNormal,
    color: selected ? tokens.colors.textInverse : tokens.colors.textPrimary,
    backgroundColor: selected ? color : tokens.colors.surface,
    border: `1px solid ${selected ? color : tokens.colors.border}`,
    borderRadius: tokens.borderRadius.full,
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <span
      className={className}
      style={containerStyles}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (onClick && !selected) {
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.backgroundColor = color + '10';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick && !selected) {
          e.currentTarget.style.borderColor = tokens.colors.border;
          e.currentTarget.style.backgroundColor = tokens.colors.surface;
        }
      }}
    >
      {children}
    </span>
  );
}
