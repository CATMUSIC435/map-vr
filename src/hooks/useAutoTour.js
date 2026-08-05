import { useEffect, useRef } from 'react';
import { useMap } from 'react-map-gl/mapbox';
import useMapStore from '../store/useMapStore';
import { mockLocations } from '../mocks/locations';

export default function useAutoTour() {
  const { 'main-map': mapRef } = useMap();
  const isTouring = useMapStore(state => state.isTouring);
  const setIsTouring = useMapStore(state => state.setIsTouring);
  const setActiveAmenity = useMapStore(state => state.setActiveAmenity);
  const tourRef = useRef(false);

  useEffect(() => {
    tourRef.current = isTouring;
  }, [isTouring]);

  const toggleTour = async () => {
    if (isTouring) {
      setIsTouring(false);
      tourRef.current = false;
      return;
    }
    
    // Do not start tour if a route animation is currently playing
    if (useMapStore.getState().isAnimating) return;
    
    setIsTouring(true);
    tourRef.current = true;
    setActiveAmenity(null);
    
    // Auto tour loop (first 10 locations to keep it reasonable)
    for (let i = 0; i < Math.min(10, mockLocations.length); i++) {
      if (!tourRef.current) break; // Exit if user stopped the tour
      const amenity = mockLocations[i];
      
      let targetBearing = Math.random() * 180 - 90;
      
      const map = mapRef?.getMap();
      
      if (map) {
        map.flyTo({
          center: [amenity.lng, amenity.lat],
          zoom: 15.5,
          pitch: 70,
          bearing: targetBearing,
          duration: 4000,
          essential: true
        });
      }
      
      // Wait for flight to finish, then show popup
      await new Promise(resolve => setTimeout(resolve, 4000));
      if (!tourRef.current) break;
      setActiveAmenity(amenity);
      
      // Orbit slowly while showing popup (linger for 6 seconds)
      if (map) {
         map.easeTo({
            bearing: targetBearing + 30, // Rotate 30 degrees
            duration: 6000,
            easing: (t) => t, // Linear easing for smooth orbit
            essential: true
         });
      }
      await new Promise(resolve => setTimeout(resolve, 6000));
      setActiveAmenity(null);
    }
    
    setIsTouring(false);
  };

  return toggleTour;
}
