import React, { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useMap } from 'react-map-gl/mapbox';
import useMapStore from '../../store/useMapStore';

export default function InfoPopup({ amenity }) {
  const setActiveAmenity = useMapStore(state => state.setActiveAmenity);
  const { 'main-map': mapRef } = useMap();
  const map = mapRef?.getMap();
  
  // Get initial zoom from the map instance
  const initialZoom = map ? map.getZoom() : 15;
  const initialDistance = Math.abs(initialZoom - 15);
  const initialScale = Math.max(0.4, 1.0 - (initialDistance * 0.15));

  const [cardSpring, api] = useSpring(() => ({
    opacity: 1,
    transform: `translateY(0px) scale(${initialScale})`,
    from: {
      opacity: 0,
      transform: `translateY(30px) scale(${initialScale * 0.95})`
    },
    config: { tension: 280, friction: 20 }
  }));

  useEffect(() => {
    if (!map) return;
    
    const onZoom = () => {
      const zoom = map.getZoom();
      const distance = Math.abs(zoom - 15);
      const scale = Math.max(0.4, 1.0 - (distance * 0.15));
      // Imperatively update the spring without re-rendering React component!
      api.start({ transform: `translateY(0px) scale(${scale})`, immediate: true });
    };

    map.on('zoom', onZoom);
    return () => map.off('zoom', onZoom);
  }, [map, api]);

  return (
    <animated.div 
      style={{
        ...cardSpring,
        pointerEvents: 'auto'
      }} 
      className="info-card-popup"
    >
      <div className="info-card-inner">
        {amenity.image && (
          <div className="info-card-img-wrapper">
            <img src={amenity.image} alt={amenity.name} className="info-card-image" />
            <div className="info-card-gradient"></div>
          </div>
        )}
        <button 
          className="info-card-close" 
          onClick={(e) => { 
            e.stopPropagation(); 
            setActiveAmenity(null); 
          }}
        >
          ✕
        </button>
        <div className="info-card-content" style={{ paddingTop: amenity.image ? '20px' : '36px' }}>
          <h3 style={{ color: amenity.color || '#fff' }}>{amenity.name}</h3>
          <p>{amenity.dist ? `${amenity.dist} - ${amenity.time}` : amenity.desc}</p>
        </div>
      </div>
    </animated.div>
  );
}
