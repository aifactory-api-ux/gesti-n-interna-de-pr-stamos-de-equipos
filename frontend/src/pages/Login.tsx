import React from 'react';
import { tokens } from '../styles/tokens';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login, isLoading, error } = useAuth();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={styles.logoIcon}
            >
              <rect width="40" height="40" rx="8" fill={tokens.colors.primary} />
              <path
                d="M12 28V12L20 8L28 12V28L20 32L12 28Z"
                stroke={tokens.colors.white}
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M20 20V32M12 16L20 20L28 16"
                stroke={tokens.colors.white}
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
            <span style={styles.logoText}>Apiux</span>
          </div>
          <div style={styles.secureAccess}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={styles.lockIcon}
            >
              <path
                d="M15 8.5V6C15 3.79086 13.2091 2 11 2H9C6.79086 2 5 3.79086 5 6V8.5C3.65625 9.31055 2.75 10.8994 2.75 12.75C2.75 15.4591 4.79086 17.625 7.375 17.875V18.5C7.375 18.7761 7.59821 19 7.875 19H12.125C12.4018 19 12.625 18.7761 12.625 18.5V17.875C15.2091 17.625 17.25 15.4591 17.25 12.75C17.25 10.8994 16.3438 9.31055 15 8.5Z"
                stroke={tokens.colors.textSecondary}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={styles.secureAccessText}>Secure Access</span>
          </div>
        </div>
      </header>

      <main style={styles.authContent}>
        <div style={styles.introPanel}>
          <div style={styles.introContent}>
            <h1 style={styles.introTitle}>
              Gestión de Préstamos
              <br />
              de Equipos
            </h1>
            <p style={styles.introDescription}>
              Plataforma interna para solicitar y gestionar el préstamo de notebooks,
              monitores y accesorios tecnológicos de Apiux.
            </p>
            <div style={styles.featuresList}>
              <div style={styles.featureItem}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke={tokens.colors.accentLight}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Control total de inventario</span>
              </div>
              <div style={styles.featureItem}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke={tokens.colors.accentLight}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Trazabilidad completa</span>
              </div>
              <div style={styles.featureItem}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke={tokens.colors.accentLight}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Auditoría de operaciones</span>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.formArea}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>Iniciar Sesión</h2>
              <p style={styles.formSubtitle}>
                Accede con tu cuenta corporativa de Apiux
              </p>
            </div>

            {error && (
              <div style={styles.errorAlert}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  style={styles.errorIcon}
                >
                  <path
                    d="M10 6.66666V10M10 13.3333H10.0083M18.3333 10C18.3333 14.6024 14.6024 18.3333 10 18.3333C5.39762 18.3333 1.66667 14.6024 1.66667 10C1.66667 5.39762 5.39762 1.66666 10 1.66666C14.6024 1.66666 18.3333 5.39762 18.3333 10Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div style={styles.buttonContainer}>
              <button
                onClick={login}
                disabled={isLoading}
                style={styles.microsoftButton}
              >
                {isLoading ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={styles.spinner}
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray="31.4 31.4"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    style={styles.microsoftIcon}
                  >
                    <path d="M0 0H9.5V9.5H0V0Z" fill="#F25022" />
                    <path d="M10.5 0H20V9.5H10.5V0Z" fill="#7FBA00" />
                    <path d="M0 10.5H9.5V20H0V10.5Z" fill="#00A4EF" />
                    <path d="M10.5 10.5H20V20H10.5V10.5Z" fill="#FFB900" />
                  </svg>
                )}
                <span style={styles.buttonText}>
                  {isLoading ? 'Redirigiendo...' : 'Iniciar sesión con Microsoft'}
                </span>
              </button>
            </div>

            <p style={styles.helpText}>
              Al iniciar sesión, aceptas las políticas de uso interno de Apiux.
            </p>
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.copyright}>
            © 2026 Apiux · Gestión interna de préstamos de equipos
          </span>
          <a href="mailto:soporte@api-ux.com" style={styles.supportLink}>
            Soporte TI
          </a>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colors.background,
  },
  header: {
    height: '76px',
    backgroundColor: tokens.colors.white,
    borderBottom: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${tokens.spacing[8]}`,
  },
  headerContent: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
  },
  logoIcon: {
    flexShrink: 0,
  },
  logoText: {
    fontSize: tokens.typography.fontSizeXl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.primary,
  },
  secureAccess: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
  },
  lockIcon: {
    color: tokens.colors.textSecondary,
  },
  secureAccessText: {
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
    fontWeight: tokens.typography.fontWeightMedium,
  },
  authContent: {
    flex: 1,
    display: 'flex',
    backgroundColor: tokens.colors.heroBackground,
    minHeight: '744px',
  },
  introPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[12],
    borderRight: `1px solid rgba(255, 255, 255, 0.1)`,
  },
  introContent: {
    maxWidth: '480px',
  },
  introTitle: {
    fontSize: tokens.typography.fontSize4xl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.white,
    lineHeight: tokens.typography.lineHeightTight,
    marginBottom: tokens.spacing[6],
  },
  introDescription: {
    fontSize: tokens.typography.fontSizeLg,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: tokens.typography.lineHeightRelaxed,
    marginBottom: tokens.spacing[8],
  },
  featuresList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[4],
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: tokens.typography.fontSizeBase,
  },
  formArea: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[12],
  },
  formCard: {
    backgroundColor: tokens.colors.white,
    borderRadius: tokens.borderRadius.xl,
    padding: tokens.spacing[10],
    width: '100%',
    maxWidth: '420px',
    boxShadow: tokens.shadows.xl,
  },
  formHeader: {
    textAlign: 'center' as const,
    marginBottom: tokens.spacing[8],
  },
  formTitle: {
    fontSize: tokens.typography.fontSize2xl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.textPrimary,
    marginBottom: tokens.spacing[2],
  },
  formSubtitle: {
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
    backgroundColor: tokens.colors.errorLight,
    color: tokens.colors.errorDark,
    padding: tokens.spacing[3],
    borderRadius: tokens.borderRadius.md,
    marginBottom: tokens.spacing[4],
    fontSize: tokens.typography.fontSizeSm,
  },
  errorIcon: {
    flexShrink: 0,
  },
  buttonContainer: {
    marginBottom: tokens.spacing[6],
  },
  microsoftButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens.spacing[3],
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    backgroundColor: tokens.colors.primary,
    color: tokens.colors.textInverse,
    border: 'none',
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSizeBase,
    fontWeight: tokens.typography.fontWeightMedium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  microsoftIcon: {
    flexShrink: 0,
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  },
  buttonText: {
    whiteSpace: 'nowrap' as const,
  },
  helpText: {
    textAlign: 'center' as const,
    fontSize: tokens.typography.fontSizeXs,
    color: tokens.colors.textTertiary,
    lineHeight: tokens.typography.lineHeightRelaxed,
  },
  footer: {
    height: '80px',
    backgroundColor: tokens.colors.white,
    borderTop: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${tokens.spacing[8]}`,
  },
  footerContent: {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyright: {
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
  },
  supportLink: {
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.accent,
    textDecoration: 'none',
    fontWeight: tokens.typography.fontWeightMedium,
  },
};