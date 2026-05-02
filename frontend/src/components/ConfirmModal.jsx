import { useState } from 'react';

/**
 * Modal moderne pour confirmer une action de suppression
 */
export default function ConfirmModal({ title, message, onConfirm, onCancel, isLoading }) {
  return (
    <div className="modal-overlay" onClick={onCancel} style={{ background: 'rgba(12,35,64,0.6)' }}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px', borderRadius: '16px' }}>
        <div className="modal-header-custom" style={{ borderBottom: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0c2340', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ 
              width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#dc3545', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' 
            }}>
              <i className="bi bi-exclamation-triangle-fill"></i>
            </span>
            {title}
          </h3>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>
            ×
          </button>
        </div>
        <div className="modal-body-custom" style={{ padding: '24px 20px' }}>
          <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem', lineHeight: '1.6' }}>{message}</p>
        </div>
        <div className="modal-footer-custom" style={{ padding: '16px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: '2px solid #e2e8f0', 
              background: 'white', color: '#475569', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s', fontSize: '0.9rem'
            }}
          >
            Annuler
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            style={{ 
              padding: '10px 20px', borderRadius: '8px', border: 'none', 
              background: '#dc3545', color: 'white', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s', fontSize: '0.9rem'
            }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '14px', height: '14px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
                Suppression...
              </span>
            ) : 'Supprimer'}
          </button>
        </div>
      </div>
    </div>
  );
}
