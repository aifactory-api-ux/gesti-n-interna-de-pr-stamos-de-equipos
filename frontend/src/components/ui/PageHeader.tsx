import React from 'react';
import { tokens } from '../../styles/tokens';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  subtitle = '',
  showBackButton = false,
  onBack,
  actions,
  children,
}: PageHeaderProps) {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[2],
    padding: `${tokens.spacing[6]} ${tokens.spacing[6]}`,
    backgroundColor: tokens.colors.surface,
    borderBottom: `1px solid ${tokens.colors.border}`,
  };

  const topRowStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing[4],
  };

  const leftSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[4],
  };

  const backButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadius.md,
    border: `1px solid ${tokens.colors.border}`,
    backgroundColor: tokens.colors.surface,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const titleStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSize2xl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.textPrimary,
    margin: 0,
  };

  const subtitleStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
    margin: 0,
    marginTop: tokens.spacing[1],
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
  };

  return (
    <header style={containerStyles}>
      <div style={topRowStyles}>
        <div style={leftSectionStyles}>
          {showBackButton && (
            <button
              type="button"
              onClick={onBack}
              style={backButtonStyles}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.borderLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = tokens.colors.surface;
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={tokens.colors.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div>
            <h1 style={titleStyles}>{title}</h1>
            {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div style={actionsStyles}>{actions}</div>}
      </div>
      {children}
    </header>
  );
}
