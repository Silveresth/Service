import { useState } from 'react';

/**
 * Composant SearchFilter pour filtrer et rechercher les données
 */
export default function SearchFilter({ 
  onSearch, 
  onFilterChange,
  filters = [],
  searchPlaceholder = 'Rechercher...',
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({});

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...activeFilters, [filterKey]: value };
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    setSearchQuery('');
    setActiveFilters({});
    onSearch?.('');
    onFilterChange?.({});
  };

  return (
    <div style={{ 
      display: 'flex', 
      gap: '12px', 
      marginBottom: '20px', 
      flexWrap: 'wrap',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1, minWidth: '200px' }}>
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearch}
          className="form-control-custom"
          style={{ width: '100%' }}
        />
      </div>

      {filters.map(filter => (
        <select
          key={filter.key}
          value={activeFilters[filter.key] || ''}
          onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          className="form-control-custom"
          style={{ minWidth: '150px' }}
        >
          <option value="">{filter.label}</option>
          {filter.options?.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ))}

      {(searchQuery || Object.values(activeFilters).some(v => v)) && (
        <button 
          onClick={handleReset}
          className="btn-outline-primary-custom"
          style={{ padding: '8px 12px' }}
        >
          <i className="bi bi-arrow-counterclockwise"></i> Réinitialiser
        </button>
      )}
    </div>
  );
}
