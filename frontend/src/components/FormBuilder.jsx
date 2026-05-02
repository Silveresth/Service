import { useState } from 'react';
import FormField from './FormField';

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation basique
    fields.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} est requis`;
      }
      if (field.type === 'email' && formData[field.name] && !formData[field.name].includes('@')) {
        newErrors[field.name] = 'Email invalide';
      }
      if (field.pattern && formData[field.name] && !new RegExp(field.pattern).test(formData[field.name])) {
        newErrors[field.name] = `Format invalide pour ${field.label}`;
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
