import React from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';

export default function RouteLayer() {
  const initialGeojson = {
    type: 'Feature',
    geometry: { type: 'LineString', coordinates: [] }
  };

  return (
    <Source id="route" type="geojson" data={initialGeojson}>
      <Layer
        id="route-line"
        type="line"
        paint={{
          'line-color': '#00ffcc',
          'line-width': 6,
          'line-opacity': 0.8
        }}
        layout={{
          'line-cap': 'round',
          'line-join': 'round'
        }}
      />
      
      {/* Glow effect layer */}
      <Layer
        id="route-glow"
        type="line"
        paint={{
          'line-color': '#0088ff',
          'line-width': 14,
          'line-opacity': 0.3,
          'line-blur': 8
        }}
        layout={{
          'line-cap': 'round',
          'line-join': 'round'
        }}
      />
    </Source>
  );
}
