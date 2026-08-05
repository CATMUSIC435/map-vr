import { useRef } from 'react';
import { useMap } from 'react-map-gl/mapbox';
import * as turf from '@turf/turf';
import useMapStore from '../store/useMapStore';
import { playSwoosh } from '../utils/audioUtils';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function useRouteAnimation() {
  const { 'main-map': mapRef } = useMap();
  const isAnimating = useMapStore(state => state.isAnimating);
  const setIsAnimating = useMapStore(state => state.setIsAnimating);
  const setActiveAmenity = useMapStore(state => state.setActiveAmenity);
  const animationRef = useRef(null);

  const flyAndDrawRoute = async (amenity) => {
    const map = mapRef?.getMap();
    if (isAnimating || !map) return;
    
    playSwoosh();
    
    // Stop tour if it's currently running
    const state = useMapStore.getState();
    if (state.isTouring) {
      state.setIsTouring(false);
    }
    
    setIsAnimating(true);
    setActiveAmenity(null); // Hide info card while moving
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    // Reset route line
    if (map.getSource('route')) {
       map.getSource('route').setData({
         type: 'Feature',
         geometry: { type: 'LineString', coordinates: [] }
       });
    }

    // Always start routing from the project (3D model) location
    const { modelLng: startLng, modelLat: startLat } = useMapStore.getState();
    const endLng = amenity.lng;
    const endLat = amenity.lat;
    
    try {
      // Fetch driving route from Mapbox Directions API
      const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      const json = await query.json();
      const data = json.routes[0];
      
      if (!data) {
        setIsAnimating(false);
        return;
      }
      
      const route = data.geometry; // GeoJSON LineString
      const routeDistance = turf.length(route, { units: 'kilometers' });
      
      // Dynamically calculate duration based on distance (min 3s, max 7s)
      const durationMs = Math.max(3000, Math.min(7000, routeDistance * 800));
      const frames = Math.floor((durationMs / 1000) * 60); // approx 60fps
      let frame = 0;
      
      const animateLine = () => {
        frame++;
        const progress = frame / frames;
        // Ease out cubic
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const currentDistance = routeDistance * easeProgress;
        
        if (currentDistance > 0) {
           try {
             const sliced = turf.lineSliceAlong(route, 0, currentDistance, { units: 'kilometers' });
             if (map.getSource('route')) {
               // Update WebGL directly, bypass React state
               map.getSource('route').setData(sliced);
             }
           } catch (error) {
             console.warn("Turf slicing error (often due to 0 distance):", error);
           }
        }
        
        if (frame < frames) {
          animationRef.current = requestAnimationFrame(animateLine);
        } else {
          // Finish
          if (map.getSource('route')) {
             map.getSource('route').setData({
                type: 'Feature',
                geometry: route
             });
          }
          setActiveAmenity(amenity); // Show info card when arrived
          setIsAnimating(false);
        }
      };

      animateLine();

      map.flyTo({
        center: [endLng, endLat],
        zoom: 15,
        pitch: 65,
        bearing: Math.random() * 60 - 30, // Random bearing
        duration: durationMs,
        essential: true
      });
      
    } catch (error) {
      console.error("Error fetching or animating route", error);
      setIsAnimating(false);
    }
  };

  return flyAndDrawRoute;
}
