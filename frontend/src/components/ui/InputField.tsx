import React from 'react';
import { tokens } from '../../styles/tokens';

interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'number';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
}: InputFieldProps) {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[1],
    width: '100%',
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightMedium,
    color: error ? tokens.colors.error : tokens.colors.textPrimary,
  };

  const inputStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeBase,
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${error ? tokens.colors.error : tokens.colors.border}`,
    backgroundColor: disabled ? tokens.colors.borderLight : tokens.colors.surface,
    color: tokens.colors.textPrimary,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    width: '100%',
    boxSizing: 'border-box',
  };

  const errorStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeXs,
    color: tokens.colors.error,
    marginTop: tokens.spacing[1],
  };

  return (
    <div className={className} style={containerStyles}>
      <label htmlFor={name} style={labelStyles}>
        {label}
        {required && <span style={{ color: tokens.colors.error }}> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={inputStyles}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? tokens.colors.error : tokens.colors.accent;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${error ? tokens.colors.errorLight : tokens.colors.accentLight}40`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? tokens.colors.error : tokens.colors.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && <span style={errorStyles}>{error}</span>}
    </div>
  );
}
