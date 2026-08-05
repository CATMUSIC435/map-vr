import React, { useState } from 'react';
import useMapStore, { MAP_STYLES } from '../../store/useMapStore';

export default function MapStyleSwitcher() {
  const currentMapStyle = useMapStore(state => state.currentMapStyle);
  const setCurrentMapStyle = useMapStore(state => state.setCurrentMapStyle);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`map-style-switcher ${isExpanded ? 'expanded' : ''}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {MAP_STYLES.map(style => (
        <button 
          key={style.id}
          className={`style-btn ${currentMapStyle === style.url ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentMapStyle(style.url);
            setIsExpanded(false);
          }}
          title={style.name}
        >
          {style.icon}
        </button>
      ))}
    </div>
  );
}
