import { create } from 'zustand';

export const MAP_STYLES = [
  { id: 'dark', name: 'Dark', url: 'mapbox://styles/mapbox/dark-v11', icon: '🌙' },
  { id: 'light', name: 'Light', url: 'mapbox://styles/mapbox/light-v11', icon: '☀️' },
  { id: 'satellite', name: 'Satellite', url: 'mapbox://styles/mapbox/satellite-streets-v12', icon: '🌍' },
  { id: 'streets', name: 'Streets', url: 'mapbox://styles/mapbox/streets-v12', icon: '🗺️' }
];

const useMapStore = create((set) => ({
  activeAmenity: null,
  isAnimating: false,
  isTouring: false,
  currentMapStyle: MAP_STYLES[0].url,
  
  // Gamification & Features
  visitedAmenities: [],
  timeOfDay: 12, // 0 - 24
  
  // 3D Model Debug Settings
  modelLng: 106.747650,
  modelLat: 10.946650,
  modelScale: 0.07,
  modelRotX: 90,
  modelRotY: 29,
  modelRotZ: 0,
  modelTransX: -36,
  modelTransY: -73,
  modelTransZ: 0,
  
  setActiveAmenity: (amenity) => set((state) => {
    // Gamification logic
    if (amenity && !state.visitedAmenities.includes(amenity.id)) {
      return { activeAmenity: amenity, visitedAmenities: [...state.visitedAmenities, amenity.id] };
    }
    return { activeAmenity: amenity };
  }),
  setIsAnimating: (animating) => set({ isAnimating: animating }),
  setIsTouring: (touring) => set({ isTouring: touring }),
  setCurrentMapStyle: (styleUrl) => set({ currentMapStyle: styleUrl }),
  setTimeOfDay: (time) => set({ timeOfDay: time }),
  
  setModelProps: (props) => set((state) => ({ ...state, ...props })),
}));

export default useMapStore;
