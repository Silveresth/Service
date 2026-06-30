import { useState } from 'react';
import FormField from './FormField';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Composant FormBuilder pour créer des formulaires dynamiques
 */
export default function FormBuilder({ 
  fields = [], 
  initialData = {}, 
  onSubmit, 
  onCancel,
  isLoading = false,
  title = 'Formulaire',
  submitLabel = 'Enregistrer',
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const validateField = (field, rawValue) => {
    const value = rawValue;

    if (field.required && (value === undefined || value === null || String(value).trim() === '')) {
      return `${field.label} est requis`;
    }

    // Si le champ est vide et non requis, on ne valide pas plus loin
    if (value === undefined || value === null || String(value).trim() === '') {
      return null;
    }

    if (field.type === 'email' && !EMAIL_REGEX.test(String(value).trim())) {
      return 'Email invalide';
    }

    if (field.type === 'number') {
      const num = Number(value);
      if (Number.isNaN(num)) {
        return `${field.label} doit être un nombre`;
      }
      if (field.min !== undefined && num < field.min) {
        return `${field.label} doit être supérieur ou égal à ${field.min}`;
      }
      if (field.max !== undefined && num > field.max) {
        return `${field.label} doit être inférieur ou égal à ${field.max}`;
      }
    }

    if (field.pattern && !new RegExp(field.pattern).test(value)) {
      return `Format invalide pour ${field.label}`;
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const field = fields.find(f => f.name === name);
    if (!field) return;
    const fieldError = validateField(field, formData[name]);
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    fields.forEach(field => {
      const fieldError = validateField(field, formData[field.name]);
      if (fieldError) {
        newErrors[field.name] = fieldError;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="card-custom">
      <div className="card-header-custom">
        <h3><i className="bi bi-pencil-square text-primary me-2"></i>{title}</h3>
      </div>
      <div className="card-body-custom">
        <form onSubmit={handleSubmit}>
          {fields.map(field => (
            <FormField
              key={field.name}
              {...field}
              value={formData[field.name]}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors[field.name]}
              disabled={isLoading}
            />
          ))}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              type="submit" 
              className="btn-primary-custom" 
              disabled={isLoading}
            >
              {isLoading ? '...' : submitLabel}
            </button>
            {onCancel && (
              <button 
                type="button" 
                className="btn-outline-primary-custom" 
                onClick={onCancel}
                disabled={isLoading}
              >
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
