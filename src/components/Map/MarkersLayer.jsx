import React from 'react';
import { Marker } from 'react-map-gl/mapbox';
import useMapStore from '../../store/useMapStore';
import useRouteAnimation from '../../hooks/useRouteAnimation';
import InfoPopup from '../UI/InfoPopup';
import { mockLocations } from '../../mocks/locations';
import { ShoppingBag, School, TreePine, Hotel, MapPin, Map as MapIcon } from 'lucide-react';
import { playPing } from '../../utils/audioUtils';

const Icons = {
  ShoppingBag,
  School,
  TreePine,
  Hotel,
  MapPin,
  Map: MapIcon
};

export default function MarkersLayer() {
  const activeAmenity = useMapStore(state => state.activeAmenity);
  const setActiveAmenity = useMapStore(state => state.setActiveAmenity);
  const isAnimating = useMapStore(state => state.isAnimating);
  const showMarkers = useMapStore(state => state.showMarkers);
  const flyAndDrawRoute = useRouteAnimation();

  if (!showMarkers) return null;

  return (
    <>
      {mockLocations.map(amenity => {
        const isActive = activeAmenity?.id === amenity.id;
        
        // Map string icon names to Lucide components
        const IconComponent = Icons[amenity.icon] || Icons.MapPin;
        
        // Define color based on type or icon
        let markerColor = '#ff3366'; // Default
        if (amenity.icon === 'ShoppingBag') markerColor = '#00ccff';
        if (amenity.icon === 'School') markerColor = '#33ff99';
        if (amenity.icon === 'TreePine') markerColor = '#33cc33';
        if (amenity.icon === 'Hotel') markerColor = '#ff9933';
        if (amenity.icon === 'MapPin') markerColor = '#ff3366';

        return (
          <Marker key={amenity.id} longitude={amenity.lng} latitude={amenity.lat} anchor="bottom">
            <div 
              className={`marker-3d ${isActive ? 'active' : ''}`}
              style={{ 
                '--marker-color': markerColor,
                opacity: isAnimating ? 0.5 : 1,
                pointerEvents: isAnimating ? 'none' : 'auto'
              }}
              onClick={(e) => {
                e.stopPropagation();
                playPing();
                setActiveAmenity(amenity);
                flyAndDrawRoute(amenity);
              }}
            >
              <div className="marker-pulse"></div>
              <div className="marker-pin">
                <IconComponent size={12} color="#fff" strokeWidth={2.5} />
              </div>
            </div>
            
            {isActive && <InfoPopup amenity={amenity} />}
          </Marker>
        );
      })}

      {activeAmenity && activeAmenity.type === 'Searched' && (
        <Marker key={activeAmenity.id} longitude={activeAmenity.lng} latitude={activeAmenity.lat} anchor="bottom">
          <div 
            className="marker-3d active"
            style={{ 
              '--marker-color': activeAmenity.color,
              opacity: isAnimating ? 0.5 : 1,
              pointerEvents: isAnimating ? 'none' : 'auto'
            }}
            onClick={(e) => {
              e.stopPropagation();
              playPing();
              setActiveAmenity(activeAmenity);
              flyAndDrawRoute(activeAmenity);
            }}
          >
            <div className="marker-pulse"></div>
            <div className="marker-pin">
              <Icons.MapPin size={12} color="#fff" strokeWidth={2.5} />
            </div>
          </div>
          
          <InfoPopup amenity={activeAmenity} />
        </Marker>
      )}
    </>
  );
}
