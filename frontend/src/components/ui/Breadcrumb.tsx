import React from 'react';
import { tokens } from '../../styles/tokens';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  className?: string;
}

export default function Breadcrumb({
  items,
  separator = '/',
  className = '',
}: BreadcrumbProps) {
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
  };

  const linkStyles: React.CSSProperties = {
    color: tokens.colors.textSecondary,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  };

  const activeLinkStyles: React.CSSProperties = {
    color: tokens.colors.textPrimary,
    fontWeight: tokens.typography.fontWeightMedium,
    cursor: 'default',
  };

  const separatorStyles: React.CSSProperties = {
    color: tokens.colors.textTertiary,
    userSelect: 'none',
  };

  return (
    <nav className={className} style={containerStyles} aria-label="breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {isLast ? (
              <span style={activeLinkStyles}>{item.label}</span>
            ) : (
              <span
                style={linkStyles}
                onClick={item.onClick}
                onMouseEnter={(e) => {
                  if (item.onClick) {
                    e.currentTarget.style.color = tokens.colors.accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.onClick) {
                    e.currentTarget.style.color = tokens.colors.textSecondary;
                  }
                }}
              >
                {item.label}
              </span>
            )}
            {!isLast && <span style={separatorStyles}>{separator}</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
