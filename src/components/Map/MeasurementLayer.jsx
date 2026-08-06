import React, { useMemo } from 'react';
import { Source, Layer } from 'react-map-gl/mapbox';
import useMapStore from '../../store/useMapStore';
import * as turf from '@turf/turf';

export default function MeasurementLayer() {
  const { measurementPoints } = useMapStore();

  const geojson = useMemo(() => {
    if (measurementPoints.length === 0) return null;
    
    const features = [];
    
    // Add points
    measurementPoints.forEach((pt, index) => {
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: pt },
        properties: { id: `point-${index}` }
      });
    });

    // Add line
    if (measurementPoints.length > 1) {
      features.push({
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: measurementPoints },
        properties: { id: 'line' }
      });
    }

    return {
      type: 'FeatureCollection',
      features
    };
  }, [measurementPoints]);

  const distance = useMemo(() => {
    if (measurementPoints.length < 2) return 0;
    const line = turf.lineString(measurementPoints);
    return turf.length(line, { units: 'kilometers' });
  }, [measurementPoints]);

  if (!geojson) return null;

  return (
    <>
      <Source id="measurement-source" type="geojson" data={geojson}>
        <Layer
          id="measurement-line"
          type="line"
          source="measurement-source"
          layout={{
            'line-join': 'round',
            'line-cap': 'round'
          }}
          paint={{
            'line-color': '#00ffcc',
            'line-width': 4,
            'line-opacity': 0.8,
            'line-dasharray': [2, 2]
          }}
        />
        <Layer
          id="measurement-points"
          type="circle"
          source="measurement-source"
          filter={['==', '$type', 'Point']}
          paint={{
            'circle-radius': 6,
            'circle-color': '#ff0055',
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff'
          }}
        />
      </Source>
      
      {measurementPoints.length > 1 && (
        <div className="measurement-tooltip">
          Khoảng cách: <strong>{distance >= 1 ? distance.toFixed(2) + ' km' : (distance * 1000).toFixed(0) + ' m'}</strong>
        </div>
      )}
    </>
  );
}
