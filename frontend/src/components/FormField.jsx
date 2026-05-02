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

  const inputClass = error ? 'reg-input has-error' : 'reg-input';

  switch (type) {
    case 'textarea':
      input = <textarea {...inputProps} rows={rows} className={inputClass} />;
      break;
    case 'select':
      input = (
        <select {...inputProps} className={inputClass}>
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
      input = <input {...inputProps} type={type} className={inputClass} />;
      break;
    default:
      input = <input {...inputProps} type="text" className={inputClass} />;
  }

  return (
    <div className="form-group-custom" style={{ marginBottom: '15px' }}>
      {label && (
        <label className="reg-label">
          <i className="bi bi-circle-fill" style={{opacity: 0, marginRight: '5px'}}></i>
          {label}
          {required && <span style={{ color: 'red' }}> *</span>}
        </label>
      )}
      {input}
{error && <small className="reg-error-msg"><i className="bi bi-exclamation-circle"></i> {String(error)}</small>}
    </div>
  );
}
