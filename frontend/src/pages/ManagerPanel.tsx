import React, { useEffect, useState, useCallback } from 'react';
import { tokens } from '../styles/tokens';
import { useAuthContext } from '../contexts/AuthContext';
import { useManager } from '../hooks/useManager';
import { useLoan } from '../hooks/useLoan';
import { Loan, AuditLog } from '../types';
import { auditLogApi, managerApi } from '../api/endpoints';
import DataTable, { ColumnDef } from '../components/ui/DataTable';
import PrimaryButton from '../components/ui/PrimaryButton';
import ConfirmModal from '../components/ui/ConfirmModal';
import Alert from '../components/ui/Alert';

type TabType = 'pending' | 'approved' | 'overdue';

interface LoanWithDetails extends Loan {
  equipment_name?: string;
  collaborator_name?: string;
}

export default function ManagerPanel() {
  const { user, logout } = useAuthContext();
  const { stats, loading: statsLoading, fetchStats } = useManager();
  const {
    loans,
    loading: loansLoading,
    error: loansError,
    pagination,
    fetchLoans,
    fetchPendingLoans,
    approveLoan,
    rejectLoan,
    returnLoan,
    setPage,
  } = useLoan();

  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditPagination, setAuditPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const [selectedLoan, setSelectedLoan] = useState<LoanWithDetails | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchPendingLoans();
    } else if (activeTab === 'approved') {
      fetchLoans({ approval_status: 'approved', status: 'active' });
    } else if (activeTab === 'overdue') {
      fetchLoans({ status: 'overdue' });
    }
  }, [activeTab, pagination.page]);

  const fetchAuditLogs = useCallback(async (page = 1) => {
    setAuditLoading(true);
    try {
      const response = await auditLogApi.list({ page, limit: 10, entity_type: 'loan' });
      setAuditLogs(response.data);
      setAuditPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleAction = async () => {
    if (!selectedLoan || !actionType || !user) return;
    setModalLoading(true);
    setActionError(null);

    try {
      if (actionType === 'approve') {
        await approveLoan(selectedLoan.id, user.id);
        setActionSuccess('Préstamo aprobado exitosamente');
      } else if (actionType === 'reject') {
        await rejectLoan(selectedLoan.id, user.id);
        setActionSuccess('Préstamo rechazado');
      } else if (actionType === 'return') {
        await returnLoan(selectedLoan.id);
        setActionSuccess('Devolución registrada exitosamente');
      }
      setSelectedLoan(null);
      setActionType(null);
      fetchStats();
      if (activeTab === 'pending') {
        fetchPendingLoans();
      } else if (activeTab === 'approved') {
        fetchLoans({ approval_status: 'approved', status: 'active' });
      }
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al procesar la acción');
    } finally {
      setModalLoading(false);
    }
  };

  const openActionModal = (loan: LoanWithDetails, action: 'approve' | 'reject' | 'return') => {
    setSelectedLoan(loan);
    setActionType(action);
    setActionError(null);
  };

  const handleExport = async () => {
    if (!startDate || !endDate) return;
    managerApi.exportReport(exportFormat, startDate, endDate);
    setExportModalOpen(false);
  };

  const getActionMessage = () => {
    if (!selectedLoan) return '';
    if (actionType === 'approve') {
      return `¿Estás seguro de aprobar el préstamo de ${selectedLoan.equipment?.name || 'este equipo'} a ${selectedLoan.collaborator?.name || 'este colaborador'}?`;
    } if (actionType === 'reject') {
      return `¿Estás seguro de rechazar el préstamo de ${selectedLoan.equipment?.name || 'este equipo'}?`;
    }
    return `¿Estás seguro de registrar la devolución de ${selectedLoan.equipment?.name || 'este equipo'}?`;
  };

  const getStatusBadge = (status: string, approvalStatus: string) => {
    let bgColor = tokens.colors.textTertiary;
    let text = status;

    if (approvalStatus === 'pending') {
      bgColor = tokens.colors.pending;
      text = 'Pendiente';
    } else if (approvalStatus === 'approved' && status === 'active') {
      bgColor = tokens.colors.approved;
      text = 'Aprobado';
    } else if (approvalStatus === 'rejected') {
      bgColor = tokens.colors.rejected;
      text = 'Rechazado';
    } else if (status === 'returned') {
      bgColor = tokens.colors.success;
      text = 'Devuelto';
    } else if (status === 'overdue') {
      bgColor = tokens.colors.error;
      text = 'Vencido';
    }

    return (
      <span style={{
        display: 'inline-block',
        padding: `${tokens.spacing[1]} ${tokens.spacing[3]}`,
        borderRadius: tokens.borderRadius.full,
        fontSize: tokens.typography.fontSizeXs,
        fontWeight: tokens.typography.fontWeightMedium,
        color: tokens.colors.white,
        backgroundColor: bgColor,
      }}>
        {text}
      </span>
    );
  };

  const columns: ColumnDef<LoanWithDetails>[] = [
    {
      key: 'equipment',
      header: 'Equipo',
      render: (loan) => loan.equipment?.name || loan.equipment_id,
    },
    {
      key: 'collaborator',
      header: 'Colaborador',
      render: (loan) => loan.collaborator?.name || loan.collaborator_id,
    },
    {
      key: 'loan_date',
      header: 'Fecha Préstamo',
      render: (loan) => new Date(loan.loan_date).toLocaleDateString('es-CL'),
    },
    {
      key: 'due_date',
      header: 'Fecha Devolución',
      render: (loan) => loan.due_date ? new Date(loan.due_date).toLocaleDateString('es-CL') : 'Sin fecha',
    },
    {
      key: 'status',
      header: 'Estado',
      render: (loan) => getStatusBadge(loan.status, loan.approval_status),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (loan) => (
        <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
          {loan.approval_status === 'pending' && (
            <>
              <PrimaryButton
                variant="primary"
                size="sm"
                onClick={() => openActionModal(loan, 'approve')}
              >
                Aprobar
              </PrimaryButton>
              <PrimaryButton
                variant="danger"
                size="sm"
                onClick={() => openActionModal(loan, 'reject')}
              >
                Rechazar
              </PrimaryButton>
            </>
          )}
          {loan.approval_status === 'approved' && loan.status === 'active' && (
            <PrimaryButton
              variant="secondary"
              size="sm"
              onClick={() => openActionModal(loan, 'return')}
            >
              Devolver
            </PrimaryButton>
          )}
        </div>
      ),
    },
  ];

  const auditColumns: ColumnDef<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Fecha/Hora',
      render: (log) => new Date(log.timestamp).toLocaleString('es-CL'),
    },
    {
      key: 'user_id',
      header: 'Usuario',
    },
    {
      key: 'action',
      header: 'Acción',
      render: (log) => (
        <span style={{
          textTransform: 'capitalize',
          fontWeight: tokens.typography.fontWeightMedium,
        }}>
          {log.action}
        </span>
      ),
    },
    {
      key: 'entity_type',
      header: 'Entidad',
    },
    {
      key: 'details',
      header: 'Detalles',
    },
  ];

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

  const contentStyles: React.CSSProperties = {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: `${tokens.spacing[8]}`,
  };

  const statsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: tokens.spacing[6],
    marginBottom: tokens.spacing[8],
  };

  const statCardStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border}`,
    padding: tokens.spacing[6],
    boxShadow: tokens.shadows.card,
  };

  const statLabelStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeSm,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing[2],
  };

  const statValueStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSize3xl,
    fontWeight: tokens.typography.fontWeightBold,
    color: tokens.colors.textPrimary,
  };

  const tabsContainerStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing[1],
    marginBottom: tokens.spacing[6],
    borderBottom: `1px solid ${tokens.colors.border}`,
  };

  const tabStyles = (isActive: boolean): React.CSSProperties => ({
    padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
    fontSize: tokens.typography.fontSizeBase,
    fontWeight: isActive ? tokens.typography.fontWeightSemibold : tokens.typography.fontWeightNormal,
    color: isActive ? tokens.colors.accent : tokens.colors.textSecondary,
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: isActive ? `2px solid ${tokens.colors.accent}` : '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  const sectionStyles: React.CSSProperties = {
    backgroundColor: tokens.colors.surface,
    borderRadius: tokens.borderRadius.lg,
    border: `1px solid ${tokens.colors.border}`,
    padding: tokens.spacing[6],
    marginBottom: tokens.spacing[6],
    boxShadow: tokens.shadows.card,
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: tokens.typography.fontSizeXl,
    fontWeight: tokens.typography.fontWeightSemibold,
    color: tokens.colors.textPrimary,
    marginBottom: tokens.spacing[4],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const exportSectionStyles: React.CSSProperties = {
    display: 'flex',
    gap: tokens.spacing[4],
    alignItems: 'center',
  };

  const dateInputStyles: React.CSSProperties = {
    padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: tokens.typography.fontSizeSm,
    fontFamily: tokens.typography.fontFamily,
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

      <main style={contentStyles}>
        {actionSuccess && (
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />
          </div>
        )}

        {actionError && (
          <div style={{ marginBottom: tokens.spacing[4] }}>
            <Alert type="error" message={actionError} onClose={() => setActionError(null)} />
          </div>
        )}

        <div style={statsGridStyles}>
          <div style={statCardStyles}>
            <div style={statLabelStyles}>Total Equipos</div>
            <div style={statValueStyles}>
              {statsLoading ? '...' : stats?.total_equipment || 0}
            </div>
          </div>
          <div style={statCardStyles}>
            <div style={statLabelStyles}>Disponibles</div>
            <div style={{ ...statValueStyles, color: tokens.colors.available }}>
              {statsLoading ? '...' : stats?.available_equipment || 0}
            </div>
          </div>
          <div style={statCardStyles}>
            <div style={statLabelStyles}>Prestados</div>
            <div style={{ ...statValueStyles, color: tokens.colors.loaned }}>
              {statsLoading ? '...' : stats?.loaned_equipment || 0}
            </div>
          </div>
          <div style={statCardStyles}>
            <div style={statLabelStyles}>Pendientes</div>
            <div style={{ ...statValueStyles, color: tokens.colors.pending }}>
              {statsLoading ? '...' : stats?.pending_requests || 0}
            </div>
          </div>
        </div>

        <div style={sectionStyles}>
          <div style={tabsContainerStyles}>
            <button
              style={tabStyles(activeTab === 'pending')}
              onClick={() => setActiveTab('pending')}
            >
              Pendientes
            </button>
            <button
              style={tabStyles(activeTab === 'approved')}
              onClick={() => setActiveTab('approved')}
            >
              Aprobados
            </button>
            <button
              style={tabStyles(activeTab === 'overdue')}
              onClick={() => setActiveTab('overdue')}
            >
              Vencidos
            </button>
          </div>

          {loansError && (
            <div style={{ marginBottom: tokens.spacing[4] }}>
              <Alert type="error" message={loansError} onClose={() => {}} />
            </div>
          )}

          <DataTable
            columns={columns}
            data={loans as LoanWithDetails[]}
            loading={loansLoading}
            pagination={{
              page: pagination.page,
              totalPages: pagination.totalPages,
              onPageChange: setPage,
            }}
            emptyMessage={
              activeTab === 'pending'
                ? 'No hay solicitudes pendientes'
                : activeTab === 'approved'
                ? 'No hay préstamos aprobados activos'
                : 'No hay préstamos vencidos'
            }
          />
        </div>

        <div style={sectionStyles}>
          <h2 style={sectionTitleStyles}>
            <span>Historial de Auditoría</span>
            <div style={exportSectionStyles}>
              <span style={{ fontSize: tokens.typography.fontSizeSm, color: tokens.colors.textSecondary }}>
                Exportar:
              </span>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'pdf')}
                style={dateInputStyles}
              >
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={dateInputStyles}
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={dateInputStyles}
              />
              <PrimaryButton
                variant="secondary"
                size="sm"
                onClick={() => setExportModalOpen(true)}
                disabled={!startDate || !endDate}
              >
                Exportar
              </PrimaryButton>
            </div>
          </h2>

          <DataTable
            columns={auditColumns}
            data={auditLogs}
            loading={auditLoading}
            pagination={{
              page: auditPagination.page,
              totalPages: auditPagination.totalPages,
              onPageChange: (page) => fetchAuditLogs(page),
            }}
            emptyMessage="No hay registros de auditoría"
          />
        </div>
      </main>

      {selectedLoan && actionType && (
        <ConfirmModal
          isOpen={true}
          onClose={() => {
            setSelectedLoan(null);
            setActionType(null);
          }}
          onConfirm={handleAction}
          title={
            actionType === 'approve'
              ? 'Aprobar Préstamo'
              : actionType === 'reject'
              ? 'Rechazar Préstamo'
              : 'Registrar Devolución'
          }
          message={getActionMessage()}
          confirmText={actionType === 'approve' ? 'Aprobar' : actionType === 'reject' ? 'Rechazar' : 'Confirmar'}
          cancelText="Cancelar"
          variant={actionType === 'reject' ? 'danger' : 'primary'}
          loading={modalLoading}
        />
      )}

      <ConfirmModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onConfirm={handleExport}
        title="Exportar Reporte"
        message={`¿Deseas exportar el reporte en formato ${exportFormat.toUpperCase()} para el período seleccionado?`}
        confirmText="Exportar"
        cancelText="Cancelar"
        variant="primary"
        loading={false}
      />
    </div>
  );
}