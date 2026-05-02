import { useState } from 'react';
import ConfirmModal from './ConfirmModal';

/**
 * Composant DataTable générique pour afficher des listes avec actions
 */
export default function DataTable({ 
  columns = [], 
  data = [], 
  onEdit = null, 
  onDelete = null,
  onAction = null,
  actions = [],
  isLoading = false,
  emptyMessage = 'Aucune donnée trouvée',
}) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await onDelete(deleteConfirm.id);
      setDeleteConfirm(null);
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <i className="bi bi-hourglass-split" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <i className="bi bi-inbox"></i>
        <h4>{emptyMessage}</h4>
      </div>
    );
  }

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item);
    }
    
    const value = column.path ? getNestedValue(item, column.path) : item[column.key];
    
    if (column.type === 'boolean') {
      return (
        <span className={`badge ${value ? 'badge-success' : 'badge-secondary'}`}>
          {value ? 'Oui' : 'Non'}
        </span>
      );
    }
    
    if (column.type === 'number') {
      return value?.toFixed(2) || '0.00';
    }
    
    if (column.type === 'truncate' && value?.length > 50) {
      return value.substring(0, 50) + '...';
    }

    return value || '-';
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  };

  return (
    <div className="table-responsive">
      <table className="table-custom" style={{ width: '100%' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete || actions.length > 0) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.id || idx}>
              {columns.map((col, colIdx) => (
                <td key={colIdx}>
                  {renderCell(item, col)}
                </td>
              ))}
              {(onEdit || onDelete || actions.length > 0) && (
                <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {onEdit && (
                    <button 
                      onClick={() => onEdit(item)} 
                      className="btn-outline-primary-custom btn-sm-custom"
                      title="Modifier"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      onClick={() => setDeleteConfirm(item)} 
                      className="btn-outline-danger-custom btn-sm-custom"
                      title="Supprimer"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  )}
                  {actions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => onAction?.(item, action.key)}
                      className={`btn-outline-${action.color || 'primary'}-custom btn-sm-custom`}
                      title={action.label}
                    >
                      <i className={`bi bi-${action.icon}`}></i>
                    </button>
                  ))}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {deleteConfirm && (
        <ConfirmModal
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer cet élément?`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteConfirm(null)}
          isLoading={deleting}
        />
      )}
    </div>
  );
}
