import React from 'react';
import { tokens } from '../../styles/tokens';
import { AuthUser } from '../../types';

interface NavigationProps {
  isAuthenticated: boolean;
  user?: AuthUser;
  onLogout: () => void;
}

export default function Navigation({ isAuthenticated, user, onLogout }: NavigationProps) {
  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.textInverse,
  };

  const logoStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeLg,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.textInverse,
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
  };

  const navLinksStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[4],
  };

  const linkStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.colors.textInverse,
    textDecoration: 'none',
    opacity: 0.9,
    transition: 'opacity 0.2s ease',
    cursor: 'pointer',
  };

  const userInfoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
  };

  const avatarStyles: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: tokens.borderRadius.full,
    backgroundColor: tokens.colors.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightSemibold,
  };

  const userNameStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightMedium,
  };

  const logoutButtonStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.colors.textInverse,
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.colors.textInverse}`,
    borderRadius: tokens.borderRadius.md,
    padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
    cursor: 'pointer',
    opacity: 0.9,
    transition: 'opacity 0.2s ease',
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav style={navStyles}>
      <div style={logoStyles}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        Apiux Equipos
      </div>

      <div style={navLinksStyles}>
        {user?.is_manager ? (
          <>
            <span style={linkStyles}>Inventario</span>
            <span style={linkStyles}>Panel</span>
          </>
        ) : (
          <>
            <span style={linkStyles}>Catálogo</span>
            <span style={linkStyles}>Mis Préstamos</span>
          </>
        )}
      </div>

      <div style={userInfoStyles}>
        <div style={avatarStyles}>{user?.name ? getInitials(user.name) : 'U'}</div>
        <div style={userNameStyles}>{user?.name}</div>
        <button
          type="button"
          onClick={onLogout}
          style={logoutButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.9';
          }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}
