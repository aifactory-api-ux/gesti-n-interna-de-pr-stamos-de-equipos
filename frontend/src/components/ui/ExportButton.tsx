import React from 'react';
import { tokens } from '../../styles/tokens';
import PrimaryButton from './PrimaryButton';

interface ExportButtonProps {
  onClick: () => void;
  format?: 'csv' | 'pdf';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function ExportButton({
  onClick,
  format = 'csv',
  loading = false,
  disabled = false,
  className = '',
}: ExportButtonProps) {
  const buttonStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
  };

  return (
    <div className={className} style={buttonStyles}>
      <PrimaryButton
        variant="secondary"
        size="sm"
        onClick={onClick}
        loading={loading}
        disabled={disabled}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Exportar {format.toUpperCase()}
      </PrimaryButton>
    </div>
  );
}
