import React from 'react';
import useMapStore from '../../store/useMapStore';
import useAutoTour from '../../hooks/useAutoTour';

export default function TourButton() {
  const isTouring = useMapStore(state => state.isTouring);
  const toggleTour = useAutoTour();

  return (
    <button 
      className={`tour-btn ${isTouring ? 'active' : ''}`} 
      onClick={toggleTour}
      title={isTouring ? 'Dừng Tour' : 'Khám Phá Tự Động'}
    >
      {isTouring ? '⏹' : '▶'}
    </button>
  );
}
