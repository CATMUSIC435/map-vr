import React, { useEffect } from 'react';
import useMapStore from '../../store/useMapStore';
import { Leva, useControls, button, folder } from 'leva';

export default function ModelDebugPanel() {
  const modelLng = useMapStore(state => state.modelLng);
  const modelLat = useMapStore(state => state.modelLat);
  const modelScale = useMapStore(state => state.modelScale);
  const modelRotX = useMapStore(state => state.modelRotX);
  const modelRotY = useMapStore(state => state.modelRotY);
  const modelRotZ = useMapStore(state => state.modelRotZ);
  const modelTransX = useMapStore(state => state.modelTransX);
  const modelTransY = useMapStore(state => state.modelTransY);
  const modelTransZ = useMapStore(state => state.modelTransZ);
  const setModelProps = useMapStore(state => state.setModelProps);

  const [controls, set] = useControls(() => ({
    'Mapbox Model': folder({
      scale: { value: modelScale, min: 0.0001, max: 1, step: 0.0001 },
      rotX: { value: modelRotX, min: -180, max: 180, step: 1 },
      rotY: { value: modelRotY, min: -180, max: 180, step: 1 },
      rotZ: { value: modelRotZ, min: -180, max: 180, step: 1 },
      transX: { value: modelTransX, min: -10000, max: 10000, step: 1 },
      transY: { value: modelTransY, min: -10000, max: 10000, step: 1 },
      transZ: { value: modelTransZ, min: -1000, max: 1000, step: 1 },
    }),
    'Copy Thông Số': button(() => {
      const { modelLng, modelLat } = useMapStore.getState();
      // Need to use state from store because closure inside Leva might be stale
      // if not careful, but we can also just use the current values in Leva
      const data = `Lng: ${modelLng}\nLat: ${modelLat}\nScale: ${controls.scale}\nRotX: ${controls.rotX}\nRotY: ${controls.rotY}\nRotZ: ${controls.rotZ}\nTransX: ${controls.transX}\nTransY: ${controls.transY}\nTransZ: ${controls.transZ}`;
      navigator.clipboard.writeText(data);
      alert("Đã copy tọa độ và thông số 3D!");
    })
  }), [modelLng, modelLat]);

  // Sync Leva controls back to Zustand
  useEffect(() => {
    setModelProps({
      modelScale: controls.scale,
      modelRotX: controls.rotX,
      modelRotY: controls.rotY,
      modelRotZ: controls.rotZ,
      modelTransX: controls.transX,
      modelTransY: controls.transY,
      modelTransZ: controls.transZ,
    });
  }, [controls, setModelProps]);

  // Sync Zustand back to Leva if changed externally (e.g. dragging marker)
  useEffect(() => {
    set({
      scale: modelScale,
      rotX: modelRotX,
      rotY: modelRotY,
      rotZ: modelRotZ,
      transX: modelTransX,
      transY: modelTransY,
      transZ: modelTransZ,
    });
  }, [modelScale, modelRotX, modelRotY, modelRotZ, modelTransX, modelTransY, modelTransZ, set]);

  return null;
}
