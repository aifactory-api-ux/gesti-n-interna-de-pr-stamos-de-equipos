import React, { useEffect } from 'react';
import { tokens } from '../../styles/tokens';
import PrimaryButton from './PrimaryButton';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  loading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'primary',
  loading = false,
}: ConfirmModalProps) {
  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colors.overlay,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease',
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.xl,
    boxShadow: tokens.shadows.modal,
    maxWidth: '480px',
    width: '90%',
    overflow: 'hidden',
    animation: 'slideUp 0.2s ease',
  };

  const headerStyles: React.CSSProperties = {
    padding: tokens.spacing[6],
    borderBottom: `1px solid ${tokens.colors.border}`,
  };

  const titleStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeXl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.textPrimary,
    margin: 0,
  };

  const bodyStyles: React.CSSProperties = {
    padding: tokens.spacing[6],
  };

  const messageStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeBase,
    color: tokens.colors.textSecondary,
    margin: 0,
    lineHeight: tokens.typography.lineHeightRelaxed,
  };

  const footerStyles: React.CSSProperties = {
    padding: tokens.spacing[4] + ' ' + tokens.spacing[6],
    borderTop: `1px solid ${tokens.colors.border}`,
    backgroundColor: tokens.colors.background,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacing[3],
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>{title}</h2>
        </div>
        <div style={bodyStyles}>
          <p style={messageStyles}>{message}</p>
        </div>
        <div style={footerStyles}>
          <PrimaryButton variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </PrimaryButton>
          <PrimaryButton variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </PrimaryButton>
        </div>
      </div>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
}
