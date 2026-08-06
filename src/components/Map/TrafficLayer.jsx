import React, { useEffect, useRef, useMemo } from 'react';
import { useMap, Source, Layer } from 'react-map-gl/mapbox';
import useMapStore from '../../store/useMapStore';
import { trafficRoads } from '../../mocks/trafficRoads';
import * as turf from '@turf/turf';

export default function TrafficLayer() {
  const { 'main-map': mapRef } = useMap();
  const isTrafficActive = useMapStore(state => state.isTrafficActive);
  const animationRef = useRef(null);

  // We keep track of the moving cars in a ref so we don't trigger React renders
  const carsRef = useRef([]);

  // Initialize cars
  useEffect(() => {
    const cars = [];
    trafficRoads.features.forEach(road => {
      const line = road;
      const length = turf.length(line);
      const speed = road.properties.speed || 0.0005; // km per frame roughly
      const color = road.properties.color || '#00ccff';

      // Create a few cars per road spaced out
      const numCars = 5;
      for (let i = 0; i < numCars; i++) {
        cars.push({
          line,
          length,
          speed,
          color,
          distance: (length / numCars) * i // start at different points
        });
      }
    });
    carsRef.current = cars;
  }, [trafficRoads]);

  useEffect(() => {
    if (!isTrafficActive || !mapRef) return;
    const map = mapRef.getMap();

    const animate = () => {
      // Update car positions
      const features = carsRef.current.map(car => {
        car.distance += car.speed;
        
        // Loop back to start if reached the end
        if (car.distance >= car.length) {
          car.distance = 0;
        }

        // Get point along line
        const point = turf.along(car.line, car.distance);
        point.properties = { color: car.color };
        return point;
      });

      const geojson = {
        type: 'FeatureCollection',
        features
      };

      // Directly update the Mapbox source for 60fps performance without React re-renders
      const source = map.getSource('traffic-cars');
      if (source) {
        source.setData(geojson);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isTrafficActive, mapRef]);

  // Define layers to render
  const roadGlowLayer = useMemo(() => ({
    id: 'traffic-roads-glow',
    type: 'line',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 12,
      'line-blur': 6,
      'line-opacity': 0.3
    }
  }), []);

  const roadLayer = useMemo(() => ({
    id: 'traffic-roads',
    type: 'line',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 4,
      'line-opacity': 0.6
    }
  }), []);

  const carLayer = useMemo(() => ({
    id: 'traffic-cars',
    type: 'circle',
    paint: {
      'circle-radius': 5,
      'circle-color': '#fff',
      'circle-stroke-width': 2,
      'circle-stroke-color': ['get', 'color'],
      'circle-pitch-alignment': 'map',
      'circle-opacity': 1,
      'circle-stroke-opacity': 1
    }
  }), []);

  const carGlowLayer = useMemo(() => ({
    id: 'traffic-cars-glow',
    type: 'circle',
    paint: {
      'circle-radius': 18,
      'circle-color': ['get', 'color'],
      'circle-blur': 1.5,
      'circle-opacity': 0.6,
      'circle-pitch-alignment': 'map'
    }
  }), []);

  if (!isTrafficActive) return null;

  return (
    <>
      {/* Background roads */}
      <Source id="traffic-roads" type="geojson" data={trafficRoads}>
        <Layer {...roadGlowLayer} />
        <Layer {...roadLayer} />
      </Source>

      {/* Moving cars */}
      <Source id="traffic-cars" type="geojson" data={{ type: 'FeatureCollection', features: [] }}>
        <Layer {...carGlowLayer} />
        <Layer {...carLayer} />
      </Source>
    </>
  );
}
