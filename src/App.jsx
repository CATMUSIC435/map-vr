import React from 'react';
import Map, { MapProvider, Layer, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import useMapStore from './store/useMapStore';
import RouteLayer from './components/Map/RouteLayer';
import MarkersLayer from './components/Map/MarkersLayer';
import BottomCarousel from './components/UI/BottomCarousel';
import TourButton from './components/UI/TourButton';
import MapStyleSwitcher from './components/UI/MapStyleSwitcher';
import AIChatbot from './components/UI/AIChatbot';
import CustomModelLayer from './components/Map/CustomModelLayer';
import ARViewerModal from './components/UI/ARViewerModal';
import GamificationProgress from './components/UI/GamificationProgress';
import StreetViewButton from './components/UI/StreetViewButton';
import CameraControls from './components/UI/CameraControls';


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Initial view state for uncontrolled map
const INITIAL_VIEW_STATE = {
  longitude: 106.7009,
  latitude: 10.7769,
  zoom: 12.5,
  pitch: 45,
  bearing: 0
};

export default function App() {
  const { currentMapStyle, isTouring, timeOfDay } = useMapStore();
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getFogColor = () => {
    if (timeOfDay < 6 || timeOfDay > 18.5) return '#0f0f14'; // Đêm
    if (timeOfDay >= 6 && timeOfDay <= 7) return '#ffe6cc'; // Bình minh
    if (timeOfDay > 16 && timeOfDay <= 18.5) return '#ffccaa'; // Hoàng hôn
    return '#e0dfdf'; // Ban ngày
  };

  return (
    <MapProvider>
      <div className="app-container">
        <Map
          ref={mapRef}
          id="main-map"
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle={currentMapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          maxPitch={85}
          projection="mercator"
          interactive={!isTouring}
          fog={{
            range: [0.8, 8],
            color: getFogColor(),
            'horizon-blend': 0.2
          }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* 3D Buildings Layer */}
          <Layer
            id="3d-buildings"
            source="composite"
            source-layer="building"
            filter={['==', 'extrude', 'true']}
            type="fill-extrusion"
            minzoom={14}
            paint={{
              'fill-extrusion-color': currentMapStyle.includes('dark') ? '#333' : '#ddd',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-base': ['get', 'min_height'],
              'fill-extrusion-opacity': 0.7
            }}
          />

          <RouteLayer />
          <MarkersLayer />
          <CustomModelLayer />
          <NavigationControl position="top-left" />
        </Map>

        <div className="left-toolbar">
          <ARViewerModal />
          <StreetViewButton />
          <TourButton />
        </div>

        <MapStyleSwitcher />
        <GamificationProgress />
        <CameraControls />

        <AIChatbot />
        <BottomCarousel />
      </div>
    </MapProvider>
  );
}
