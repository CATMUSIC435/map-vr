import React from 'react';
import { useMap } from 'react-map-gl/mapbox';
import useMapStore from '../../store/useMapStore';
import { PersonStanding } from 'lucide-react';
import { playSwoosh } from '../../utils/audioUtils';

export default function StreetViewButton() {
  const { 'main-map': mapRef } = useMap();
  const isAnimating = useMapStore(state => state.isAnimating);
  const setIsAnimating = useMapStore(state => state.setIsAnimating);
  const modelLng = useMapStore(state => state.modelLng);
  const modelLat = useMapStore(state => state.modelLat);

  const goStreetView = () => {
    const map = mapRef?.getMap();
    if (!map || isAnimating) return;

    playSwoosh();
    setIsAnimating(true);
    
    map.flyTo({
      center: [modelLng, modelLat],
      zoom: 19.5,
      pitch: 85, // Look straight ahead
      bearing: map.getBearing(),
      duration: 2500,
      essential: true
    });

    map.once('moveend', () => {
      setIsAnimating(false);
    });
  };

  return (
    <button 
      className="street-view-btn" 
      onClick={goStreetView}
      disabled={isAnimating}
      title="Góc nhìn người đi bộ"
    >
      <PersonStanding size={24} color="#fff" />
    </button>
  );
}
