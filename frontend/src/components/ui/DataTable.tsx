import React from 'react';
import { tokens } from '../../styles/tokens';
import PrimaryButton from './PrimaryButton';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  onRowClick,
  emptyMessage = 'No hay datos disponibles',
  className = '',
}: DataTableProps<T>) {
  const containerStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border}`,
    overflow: 'hidden',
    boxShadow: tokens.shadows.card,
  };

  const tableStyles: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
  };

  const theadStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.background,
    borderBottom: `1px solid ${tokens.colors.border}`,
  };

  const thStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightSemibold,
    color: tokens.colors.textSecondary,
    textAlign: 'left',
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
  };

  const trStyles: React.CSSProperties = {
    borderBottom: `1px solid ${tokens.colors.borderLight}`,
    transition: 'background-color 0.15s ease',
    cursor: onRowClick ? 'pointer' : 'default',
  };

  const tdStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textPrimary,
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
  };

  const emptyStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeBase,
    color: tokens.colors.textTertiary,
    textAlign: 'center',
    padding: tokens.spacing[12],
  };

  const paginationStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    borderTop: `1px solid ${tokens.colors.border}`,
    backgroundColor: tokens.colors.background,
  };

  const pageInfoStyles: React.CSSProperties = {
    fontFamily: tokens.typography.fontFamily,
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
  };

  const pageButtonsStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[2],
  };

  const loadingStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens.spacing[12],
  };

  if (loading) {
    return (
      <div style={containerStyles} className={className}>
        <div style={loadingStyles}>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={tokens.colors.accent}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
          </svg>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={containerStyles} className={className}>
      <table style={tableStyles}>
        <thead style={theadStyles}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={thStyles}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={emptyStyles}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                style={trStyles}
                onClick={() => onRowClick?.(row)}
                onMouseEnter={(e) => {
                  if (onRowClick) {
                    e.currentTarget.style.backgroundColor = tokens.colors.borderLight;
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={tdStyles}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div style={paginationStyles}>
          <span style={pageInfoStyles}>
            Página {pagination.page} de {pagination.totalPages}
          </span>
          <div style={pageButtonsStyles}>
            <PrimaryButton
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Anterior
            </PrimaryButton>
            <PrimaryButton
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
