import React, { useEffect } from 'react';
import { tokens } from '../../styles/tokens';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ type, message, onClose, className = '' }: AlertProps) {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: tokens.colors.successLight,
          borderColor: tokens.colors.success,
          iconColor: tokens.colors.success,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
        };
      case 'error':
        return {
          backgroundColor: tokens.colors.errorLight,
          borderColor: tokens.colors.error,
          iconColor: tokens.colors.error,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ),
        };
      case 'warning':
        return {
          backgroundColor: tokens.colors.warningLight,
          borderColor: tokens.colors.warning,
          iconColor: tokens.colors.warning,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
        };
      case 'info':
        return {
          backgroundColor: tokens.colors.infoLight,
          borderColor: tokens.colors.info,
          iconColor: tokens.colors.info,
          icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ),
        };
    }
  };

  const typeStyles = getTypeStyles();

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacing[3],
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${typeStyles.borderColor}`,
    backgroundColor: typeStyles.backgroundColor,
    boxShadow: tokens.shadows.sm,
  };

  const iconContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: typeStyles.iconColor,
  };

  const messageStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textPrimary,
    margin: 0,
    lineHeight: tokens.typography.lineHeightNormal,
    flex: 1,
  };

  const closeButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: tokens.borderRadius.sm,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: tokens.colors.textSecondary,
    flexShrink: 0,
    transition: 'background-color 0.2s ease',
  };

  useEffect(() => {
    if (onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [onClose]);

  return (
    <div className={className} style={containerStyles} role="alert">
      <div style={iconContainerStyles}>{typeStyles.icon}</div>
      <p style={messageStyles}>{message}</p>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={closeButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
