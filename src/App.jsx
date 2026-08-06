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
import WeatherOverlay from './components/UI/WeatherOverlay';
import WeatherButton from './components/UI/WeatherButton';
import MiniMap from './components/UI/MiniMap';
import MeasurementLayer from './components/Map/MeasurementLayer';
import MeasurementButton from './components/UI/MeasurementButton';


const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Initial view state for uncontrolled map
const INITIAL_VIEW_STATE = {
  longitude: 106.747650,
  latitude: 10.946650,
  zoom: 16,
  pitch: 60,
  bearing: -20
};

export default function App() {
  const { currentMapStyle, isTouring, timeOfDay, isMeasuring, measurementPoints, setMeasurementPoints } = useMapStore();
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

  const handleMapClick = (e) => {
    if (isMeasuring) {
      setMeasurementPoints([...measurementPoints, [e.lngLat.lng, e.lngLat.lat]]);
    }
  };

  return (
    <MapProvider>
      <div className="app-container">
        <WeatherOverlay />
        
        <Map
          ref={mapRef}
          id="main-map"
          initialViewState={INITIAL_VIEW_STATE}
          mapStyle={currentMapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          maxPitch={85}
          projection="mercator"
          interactive={!isTouring}
          onClick={handleMapClick}
          cursor={isMeasuring ? 'crosshair' : 'auto'}
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
          <MeasurementLayer />
          <NavigationControl position="top-left" />
        </Map>

        <MiniMap />

        <div className="left-toolbar">
          <ARViewerModal />
          <MeasurementButton />
          <WeatherButton />
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
