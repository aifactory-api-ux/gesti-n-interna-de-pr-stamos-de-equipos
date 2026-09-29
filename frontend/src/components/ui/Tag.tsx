import React from 'react';
import { tokens } from '../../styles/tokens';

interface TagProps {
  children: React.ReactNode;
  color?: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export default function Tag({
  children,
  color = tokens.colors.accent,
  removable = false,
  onRemove,
  className = '',
}: TagProps) {
  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing[1],
    padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeXs,
    fontWeight: tokens.typography.fontWeightMedium,
    color: color,
    backgroundColor: color + '15',
    borderRadius: tokens.borderRadius.sm,
    border: `1px solid ${color}30`,
  };

  const removeButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '16px',
    height: '16px',
    borderRadius: tokens.borderRadius.full,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: color,
    padding: 0,
    transition: 'background-color 0.2s ease',
  };

  return (
    <span className={className} style={containerStyles}>
      {children}
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          style={removeButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = color + '30';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </span>
  );
}
