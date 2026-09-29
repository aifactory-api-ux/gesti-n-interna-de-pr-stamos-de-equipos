import React from 'react';
import { tokens } from '../../styles/tokens';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: tokens.colors.successLight,
          color: tokens.colors.successDark,
        };
      case 'warning':
        return {
          backgroundColor: tokens.colors.warningLight,
          color: tokens.colors.warningDark,
        };
      case 'error':
        return {
          backgroundColor: tokens.colors.errorLight,
          color: tokens.colors.errorDark,
        };
      case 'info':
        return {
          backgroundColor: tokens.colors.infoLight,
          color: tokens.colors.infoDark,
        };
      default:
        return {
          backgroundColor: tokens.colors.borderLight,
          color: tokens.colors.textSecondary,
        };
    }
  };

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: {
      padding: `${tokens.spacing[0]} ${tokens.spacing[2]}`,
      fontSize: tokens.typography.fontSizeXs,
    },
    md: {
      padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
      fontSize: tokens.typography.fontSizeSm,
    },
  };

  const variantStyles = getVariantStyles();

  const containerStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    fontFamily: tokens.typography.fontFamily,
    fontWeight: tokens.typography.fontWeightMedium,
    borderRadius: tokens.borderRadius.full,
    ...sizeStyles[size],
    ...variantStyles,
  };

  return (
    <span className={className} style={containerStyles}>
      {children}
    </span>
  );
}
