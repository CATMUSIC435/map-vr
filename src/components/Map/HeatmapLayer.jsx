import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import useMapStore from '../../store/useMapStore';
import { heatmapData } from '../../mocks/heatmapData';

export default function HeatmapLayer() {
  const isHeatmapActive = useMapStore(state => state.isHeatmapActive);

  const heatmapPaint = useMemo(() => ({
    // Increase the heatmap weight based on frequency and property weight
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'weight'],
      0, 0,
      10, 1
    ],
    // Increase the heatmap color weight weight by zoom level
    // heatmap-intensity is a multiplier on top of heatmap-weight
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      11, 1,
      15, 3
    ],
    // Color ramp from blue to red
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    // Adjust the heatmap radius by zoom level
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      11, 15,
      15, 50,
      20, 150
    ],
    // Transition from heatmap to circle layer by zoom level
    'heatmap-opacity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      14, 0.8,
      18, 0.3
    ]
  }), []);

  if (!isHeatmapActive) return null;

  return (
    <Source id="heatmap-data" type="geojson" data={heatmapData}>
      <Layer 
        id="heatmap-layer" 
        type="heatmap" 
        paint={heatmapPaint} 
      />
    </Source>
  );
}
