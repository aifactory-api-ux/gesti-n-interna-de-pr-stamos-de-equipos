import React from 'react';
import { tokens } from '../../styles/tokens';
import { Equipment } from '../../types';
import PrimaryButton from './PrimaryButton';

interface EquipmentCardProps {
  equipment: Equipment;
  onRequestLoan?: (equipment: Equipment) => void;
  showActions?: boolean;
  isManager?: boolean;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
}

export default function EquipmentCard({
  equipment,
  onRequestLoan,
  showActions = true,
  isManager = false,
  onEdit,
  onDelete,
}: EquipmentCardProps) {
  const cardStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border}`,
    overflow: 'hidden',
    transition: 'box-shadow 0.2s ease',
    boxShadow: tokens.shadows.card,
  };

  const headerStyles: React.CSSProperties = {
    padding: tokens.spacing[4],
    borderBottom: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  };

  const iconContainerStyles: React.CSSProperties = {
    width: '48px',
    height: '48px',
    borderRadius: tokens.borderRadius.md,
    backgroundColor: tokens.colors.background,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const titleStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeLg,
    fontWeight: tokens.typography.fontWeightSemibold,
    color: tokens.colors.textPrimary,
    margin: 0,
    marginTop: tokens.spacing[2],
  };

  const typeStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
    margin: 0,
  };

  const bodyStyles: React.CSSProperties = {
    padding: tokens.spacing[4],
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacing[2],
  };

  const infoRowStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const labelStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
  };

  const valueStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.colors.textPrimary,
  };

  const footerStyles: React.CSSProperties = {
    padding: tokens.spacing[3] + ' ' + tokens.spacing[4],
    borderTop: `1px solid ${tokens.colors.border}`,
    backgroundColor: tokens.colors.background,
    display: 'flex',
    gap: tokens.spacing[2],
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'available':
        return tokens.colors.available;
      case 'loaned':
        return tokens.colors.loaned;
      case 'maintenance':
        return tokens.colors.maintenance;
      case 'retired':
        return tokens.colors.retired;
      default:
        return tokens.colors.textSecondary;
    }
  };

  const getEquipmentIcon = (type: string): React.ReactNode => {
    const iconColor = tokens.colors.textSecondary;
    switch (type.toLowerCase()) {
      case 'notebook':
      case 'laptop':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="12" rx="2" ry="2" />
            <line x1="2" y1="20" x2="22" y2="20" />
          </svg>
        );
      case 'monitor':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
            <rect x="9" y="9" width="6" height="6" />
            <line x1="9" y1="1" x2="9" y2="4" />
            <line x1="15" y1="1" x2="15" y2="4" />
            <line x1="9" y1="20" x2="9" y2="23" />
            <line x1="15" y1="20" x2="15" y2="23" />
            <line x1="20" y1="9" x2="23" y2="9" />
            <line x1="20" y1="14" x2="23" y2="14" />
            <line x1="1" y1="9" x2="4" y2="9" />
            <line x1="1" y1="14" x2="4" y2="14" />
          </svg>
        );
    }
  };

  const statusColor = getStatusColor(equipment.status);

  return (
    <div
      style={cardStyles}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = tokens.shadows.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = tokens.shadows.card;
      }}
    >
      <div style={headerStyles}>
        <div style={iconContainerStyles}>{getEquipmentIcon(equipment.type)}</div>
        <div
          style={{
            padding: `${tokens.spacing[1]} ${tokens.spacing[2]}`,
            borderRadius: tokens.borderRadius.sm,
            backgroundColor: statusColor + '20',
            color: statusColor,
            fontSize: tokens.typography.fontSizeXs,
            fontWeight: tokens.typography.fontWeightMedium,
            textTransform: 'capitalize',
          }}
        >
          {equipment.status}
        </div>
      </div>

      <div style={bodyStyles}>
        <h3 style={titleStyles}>{equipment.name}</h3>
        <p style={typeStyles}>{equipment.type}</p>

        <div style={{ ...infoRowStyles, marginTop: tokens.spacing[2] }}>
          <span style={labelStyles}>Serial</span>
          <span style={valueStyles}>{equipment.serial_number || 'N/A'}</span>
        </div>
      </div>

      {showActions && (
        <div style={footerStyles}>
          {isManager ? (
            <>
              {onEdit && (
                <PrimaryButton variant="secondary" size="sm" onClick={() => onEdit(equipment)}>
                  Editar
                </PrimaryButton>
              )}
              {onDelete && (
                <PrimaryButton variant="danger" size="sm" onClick={() => onDelete(equipment)}>
                  Eliminar
                </PrimaryButton>
              )}
            </>
          ) : (
            equipment.status === 'available' && onRequestLoan && (
              <PrimaryButton variant="primary" size="sm" onClick={() => onRequestLoan(equipment)} fullWidth>
                Solicitar Préstamo
              </PrimaryButton>
            )
          )}
        </div>
      )}
    </div>
  );
}
