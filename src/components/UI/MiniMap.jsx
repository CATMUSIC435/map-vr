import React, { useState, useEffect } from 'react';
import Map, { useMap } from 'react-map-gl/mapbox';
import { Map as MapIcon, X } from 'lucide-react';
import useMapStore from '../../store/useMapStore';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function MiniMap() {
  const { 'main-map': mainMap } = useMap();
  const { currentMapStyle } = useMapStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const [viewState, setViewState] = useState({
    longitude: 106.747650,
    latitude: 10.946650,
    zoom: 12,
    pitch: 0,
    bearing: 0
  });

  useEffect(() => {
    if (!mainMap) return;
    const mapboxMap = mainMap.getMap();

    const onMove = () => {
      const center = mapboxMap.getCenter();
      setViewState({
        longitude: center.lng,
        latitude: center.lat,
        zoom: Math.max(mapboxMap.getZoom() - 4, 1),
        pitch: 0,
        bearing: 0
      });
    };

    onMove();

    mapboxMap.on('move', onMove);
    return () => {
      mapboxMap.off('move', onMove);
    };
  }, [mainMap]);

  return (
    <div className={`minimap-wrapper ${isCollapsed ? 'collapsed' : ''}`}>
      {!isCollapsed && (
        <div className="minimap-container">
          <Map
            id="minimap"
            {...viewState}
            mapStyle={currentMapStyle}
            mapboxAccessToken={MAPBOX_TOKEN}
            interactive={false}
            style={{ width: '100%', height: '100%' }}
          />
          <div className="minimap-crosshair"></div>
          
          <button 
            className="minimap-toggle close" 
            onClick={() => setIsCollapsed(true)}
            title="Thu gọn Bản đồ phụ"
          >
            <X size={16} color="#fff" />
          </button>
        </div>
      )}
      
      {isCollapsed && (
        <button 
          className="minimap-toggle open" 
          onClick={() => setIsCollapsed(false)}
          title="Mở Bản đồ phụ"
        >
          <MapIcon size={20} color="#fff" />
        </button>
      )}
    </div>
  );
}
