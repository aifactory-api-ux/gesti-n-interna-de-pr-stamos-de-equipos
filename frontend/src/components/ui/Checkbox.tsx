import React from 'react';
import { tokens } from '../../styles/tokens';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  disabled = false,
  className = '',
}: CheckboxProps) {
  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
  };

  const checkboxStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: tokens.borderRadius.sm,
    border: `2px solid ${checked ? tokens.colors.accent : tokens.colors.border}`,
    backgroundColor: checked ? tokens.colors.accent : 'transparent',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1,
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: disabled ? tokens.colors.textTertiary : tokens.colors.textPrimary,
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={className} style={containerStyles} onClick={handleClick}>
      <div style={checkboxStyles}>
        {checked && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.textInverse} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {label && <span style={labelStyles}>{label}</span>}
    </div>
  );
}
