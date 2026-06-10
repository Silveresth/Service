import React from 'react';
import GoogleMapAteliers from './GoogleMapAteliers';

// Wrapper pour compat avec l'ancienne structure (carte + sélection)
export default function GoogleMapAtelierPicker({
  ateliers,
  selectedAtelier,
  onSelectAtelier,
  style,
  zoom,
  searchLatLng,
  mapHeight,
}) {
  return (
    <div
      style={{
        height: mapHeight || 'min(400px, 45vh)',
        borderRadius: 12,
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        ...style,
      }}
    >
      <GoogleMapAteliers
        ateliers={ateliers}
        selectedAtelier={selectedAtelier}
        onSelectAtelier={onSelectAtelier}
        zoom={zoom}
        searchLatLng={searchLatLng}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

