import React from 'react';
import { tokens } from '../../styles/tokens';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  className = '',
}: SwitchProps) {
  const sizeStyles: Record<string, { track: React.CSSProperties; thumb: React.CSSProperties }> = {
    sm: {
      track: { width: '32px', height: '18px' },
      thumb: { width: '14px', height: '14px', left: '2px' },
    },
    md: {
      track: { width: '44px', height: '24px' },
      thumb: { width: '18px', height: '18px', left: '3px' },
    },
  };

  const trackStyles: React.CSSProperties = {
    position: 'relative',
    width: sizeStyles[size].track.width,
    height: sizeStyles[size].track.height,
    backgroundColor: checked ? tokens.colors.accent : tokens.colors.border,
    borderRadius: tokens.borderRadius.full,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background-color 0.2s ease',
    opacity: disabled ? 0.5 : 1,
  };

  const thumbStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: sizeStyles[size].thumb.width,
    height: sizeStyles[size].thumb.height,
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.borderRadius.full,
    boxShadow: tokens.shadows.sm,
    transition: 'left 0.2s ease',
    left: checked
      ? `calc(${sizeStyles[size].track.width} - ${sizeStyles[size].thumb.width} - 3px)`
      : sizeStyles[size].thumb.left,
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: disabled ? tokens.colors.textTertiary : tokens.colors.textPrimary,
    marginLeft: tokens.spacing[2],
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
  };

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
  };

  return (
    <div className={className} style={containerStyles}>
      <div
        style={trackStyles}
        onClick={() => {
          if (!disabled) {
            onChange(!checked);
          }
        }}
      >
        <div style={thumbStyles} />
      </div>
      {label && (
        <span
          style={labelStyles}
          onClick={() => {
            if (!disabled) {
              onChange(!checked);
            }
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
