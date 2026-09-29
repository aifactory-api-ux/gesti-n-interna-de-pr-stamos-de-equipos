import React, { useEffect, useState } from 'react';
import { tokens } from '../styles/tokens';
import { useAuthContext } from '../contexts/AuthContext';
import { useEquipment } from '../hooks/useEquipment';
import { useLoan } from '../hooks/useLoan';
import { Equipment } from '../types';
import EquipmentCard from '../components/ui/EquipmentCard';
import PrimaryButton from '../components/ui/PrimaryButton';
import Alert from '../components/ui/Alert';

const EQUIPMENT_TYPES = ['Notebook', 'Monitor', 'Accesorio'];
const EQUIPMENT_STATUSES = ['available', 'loaned', 'maintenance', 'retired'];

export default function Catalog() {
  const { user, logout } = useAuthContext();
  const { equipment, loading, error, pagination, fetchEquipment, setFilters, setPage } = useEquipment();
  const { createLoan, loading: loanLoading } = useLoan();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [loanSuccess, setLoanSuccess] = useState<string | null>(null);
  const [loanError, setLoanError] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    fetchEquipment();
  }, [pagination.page]);

  useEffect(() => {
    if (searchTerm || selectedType || selectedStatus) {
      const timer = setTimeout(() => {
        setFilters({
          search: searchTerm || undefined,
          type: selectedType || undefined,
          status: selectedStatus || undefined,
        });
        fetchEquipment({
          search: searchTerm || undefined,
          type: selectedType || undefined,
          status: selectedStatus || undefined,
        });
        setPage(1);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      fetchEquipment();
    }
  }, [searchTerm, selectedType, selectedStatus]);

  const handleRequestLoan = (eq: Equipment) => {
    setSelectedEquipment(eq);
    setDueDate('');
    setLoanError(null);
    setShowLoanModal(true);
  };

  const handleConfirmLoan = async () => {
    if (!selectedEquipment) return;
    setLoanError(null);
    try {
      await createLoan({
        equipment_id: selectedEquipment.id,
        due_date: dueDate || undefined,
      });
      setShowLoanModal(false);
      setSelectedEquipment(null);
      setLoanSuccess('Solicitud de préstamo creada exitosamente');
      fetchEquipment();
    } catch (err) {
      setLoanError(err instanceof Error ? err.message : 'Error al crear solicitud');
    }
  };

  const handleCloseLoanModal = () => {
    setShowLoanModal(false);
    setSelectedEquipment(null);
    setDueDate('');
    setLoanError(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setSelectedStatus('');
    setFilters({});
    fetchEquipment();
    setPage(1);
  };

  const headerStyles: React.CSSProperties = {
    height: '76px',
    backgroundColor: tokens.colors.white,
    borderBottom: `1px solid ${tokens.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    padding: `0 ${tokens.spacing[8]}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const headerContentStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const logoSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
  };

  const logoTextStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.primary,
  };

  const navStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[6],
  };

  const userInfoStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacing[3],
  };

  const userNameStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.colors.textPrimary,
  };

  const heroStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.heroBackground,
    padding: `${tokens.spacing[12]} ${tokens.spacing[8]}`,
    textAlign: 'center' as const,
  };

  const heroTitleStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSize3xl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.white,
    marginBottom: tokens.spacing[2],
  };

  const heroSubtitleStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeLg,
    color: 'rgba(255, 255, 255, 0.8)',
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: `${tokens.spacing[8]}`,
  };

  const filtersBarStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
    flexWrap: 'wrap' as const,
  };

  const searchInputStyles: React.CSSProperties = {
    flex: 1,
    minWidth: '250px',
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSizeBase,
    fontFamily: tokens.typography.fontFamily,
    backgroundColor: tokens.colors.white,
  };

  const selectStyles: React.CSSProperties = {
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSizeBase,
    fontFamily: tokens.typography.fontFamily,
    backgroundColor: tokens.colors.white,
    minWidth: '150px',
    cursor: 'pointer',
  };

  const gridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacing[6],
    marginBottom: tokens.spacing[8],
  };

  const paginationStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing[3],
  };

  const pageButtonStyles: React.CSSProperties = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[4]}`,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: tokens.colors.white,
    fontSize: tokens.typography.fontSizeSm,
    fontWeight: tokens.typography.fontWeightMedium,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const pageInfoStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
  };

  const modalOverlayStyles: React.CSSProperties = {
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

  const modalHeaderStyles: React.CSSProperties = {
    padding: tokens.spacing[6],
    borderBottom: `1px solid ${tokens.colors.border}`,
  };

  const modalTitleStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.textPrimary,
    margin: 0,
  };

  const modalBodyStyles: React.CSSProperties = {
    padding: tokens.spacing[6],
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing[4],
  };

  const equipmentInfoStyles: React.CSSProperties = {
    padding: tokens.spacing[4],
    backgroundColor: tokens.colors.background,
    borderRadius: tokens.borderRadius.md,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: tokens.spacing[2],
  };

  const labelStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
  };

  const valueStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeBase,
    fontWeight: tokens.typography.fontWeightMedium,
    color: tokens.colors.textPrimary,
  };

  const inputStyles: React.CSSProperties = {
    padding: `${tokens.spacing[3]} ${tokens.spacing[4]}`,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSizeBase,
    fontFamily: tokens.typography.fontFamily,
    width: '100%',
    boxSizing: 'border-box' as const,
  };

  const modalFooterStyles: React.CSSProperties = {
    padding: `${tokens.spacing[4]} ${tokens.spacing[6]}`,
    borderTop: `1px solid ${tokens.colors.border}`,
    backgroundColor: tokens.colors.background,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: tokens.spacing[3],
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: tokens.colors.background }}>
      <header style={headerStyles}>
        <div style={headerContentStyles}>
          <div style={logoSectionStyles}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
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
            <span style={logoTextStyles}>Apiux</span>
          </div>

          <nav style={navStyles}>
            <div style={userInfoStyles}>
              <div style={{ textAlign: 'right' as const }}>
                <div style={userNameStyles}>{user?.name}</div>
                <div style={{ fontSize: tokens.typography.fontSizeXs, color: tokens.colors.textSecondary }}>
                  {user?.email}
                </div>
              </div>
            </div>
            <PrimaryButton variant="secondary" size="sm" onClick={logout}>
              Cerrar Sesión
            </PrimaryButton>
          </nav>
        </div>
      </header>

      <section style={heroStyles}>
        <h1 style={heroTitleStyles}>Catálogo de Equipos</h1>
        <p style={heroSubtitleStyles}>
          Explora los equipos disponibles para préstamo en Apiux
        </p>
      </section>

      <main style={contentStyles}>
        {loanSuccess && (
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <Alert
              type="success"
              message={loanSuccess}
              onClose={() => setLoanSuccess(null)}
            />
          </div>
        )}

        {error && (
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <Alert
              type="error"
              message={error}
              onClose={() => {}}
            />
          </div>
        )}

        <div style={filtersBarStyles}>
          <input
            type="search"
            placeholder="Buscar por nombre o serial..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInputStyles}
          />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={selectStyles}
          >
            <option value="">Todos los tipos</option>
            {EQUIPMENT_TYPES.map((type) => (
              <option key={type} value={type.toLowerCase()}>
                {type}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={selectStyles}
          >
            <option value="">Todos los estados</option>
            {EQUIPMENT_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          {(searchTerm || selectedType || selectedStatus) && (
            <PrimaryButton variant="secondary" size="md" onClick={handleClearFilters}>
              Limpiar
            </PrimaryButton>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: tokens.spacing[12] }}>
            <div style={{ color: tokens.colors.textSecondary }}>Cargando equipos...</div>
          </div>
        ) : equipment.length === 0 ? (
          <div style={{ textAlign: 'center', padding: tokens.spacing[12] }}>
            <div style={{ color: tokens.colors.textSecondary }}>
              No se encontraron equipos disponibles
            </div>
          </div>
        ) : (
          <>
            <div style={gridStyles}>
              {equipment.map((eq) => (
                <EquipmentCard
                  key={eq.id}
                  equipment={eq}
                  onRequestLoan={handleRequestLoan}
                  showActions={true}
                />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div style={paginationStyles}>
                <button
                  style={{
                    ...pageButtonStyles,
                    opacity: pagination.page === 1 ? 0.5 : 1,
                    cursor: pagination.page === 1 ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => setPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  Anterior
                </button>
                <span style={pageInfoStyles}>
                  Página {pagination.page} de {pagination.totalPages} ({pagination.total} equipos)
                </span>
                <button
                  style={{
                    ...pageButtonStyles,
                    opacity: pagination.page === pagination.totalPages ? 0.5 : 1,
                    cursor: pagination.page === pagination.totalPages ? 'not-allowed' : 'pointer',
                  }}
                  onClick={() => setPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {showLoanModal && selectedEquipment && (
        <div style={modalOverlayStyles} onClick={handleCloseLoanModal}>
          <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyles}>
              <h2 style={modalTitleStyles}>Solicitar Préstamo</h2>
            </div>
            <div style={modalBodyStyles}>
              <div style={equipmentInfoStyles}>
                <span style={labelStyles}>Equipo</span>
                <span style={valueStyles}>{selectedEquipment.name}</span>
              </div>
              <div style={equipmentInfoStyles}>
                <span style={labelStyles}>Tipo</span>
                <span style={valueStyles}>{selectedEquipment.type}</span>
              </div>
              <div style={equipmentInfoStyles}>
                <span style={labelStyles}>Serial</span>
                <span style={valueStyles}>{selectedEquipment.serial_number || 'N/A'}</span>
              </div>
              <div>
                <label style={{ ...labelStyles, display: 'block', marginBottom: tokens.spacing[2] }}>
                  Fecha de devolución (opcional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  style={inputStyles}
                />
              </div>
              {loanError && (
                <Alert type="error" message={loanError} onClose={() => setLoanError(null)} />
              )}
            </div>
            <div style={modalFooterStyles}>
              <PrimaryButton variant="secondary" onClick={handleCloseLoanModal} disabled={loanLoading}>
                Cancelar
              </PrimaryButton>
              <PrimaryButton variant="primary" onClick={handleConfirmLoan} loading={loanLoading}>
                Solicitar
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
      )}
    </div>
  );
}