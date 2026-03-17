import { useState, useEffect } from 'react';

/**
 * Composant FormField générique pour créer des champs de formulaire
 */
export default function FormField({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  required = false,
  error = null,
  disabled = false,
  options = [], // Pour les select
  rows = 5, // Pour les textarea
  pattern = null,
}) {
  const inputProps = {
    name,
    value: value || '',
    onChange,
    required,
    disabled,
    placeholder,
    pattern,
  };

  let input;

  switch (type) {
    case 'textarea':
      input = <textarea {...inputProps} rows={rows} className="form-control-custom" />;
      break;
    case 'select':
      input = (
        <select {...inputProps} className="form-control-custom">
          <option value="">{placeholder || 'Sélectionner...'}</option>
          {options.map(opt => (
            <option key={opt.id || opt.value} value={opt.id || opt.value}>
              {opt.nom || opt.label || opt.name}
            </option>
          ))}
        </select>
      );
      break;
    case 'number':
    case 'email':
    case 'password':
    case 'date':
    case 'datetime-local':
      input = <input {...inputProps} type={type} className="form-control-custom" />;
      break;
    default:
      input = <input {...inputProps} type="text" className="form-control-custom" />;
  }

  return (
    <div className="form-group-custom" style={{ marginBottom: '15px' }}>
      {label && (
        <label className="form-label-custom">
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      {input}
{error && <small className="text-danger" style={{ display: 'block', marginTop: '5px' }}>{String(error)}</small>}
    </div>
  );
}
