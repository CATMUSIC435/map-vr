import React, { useState } from 'react';
import { useMap } from 'react-map-gl/mapbox';
import { RotateCcw, RotateCw, ChevronUp, ChevronDown, Move, Gamepad2, X } from 'lucide-react';
import useMapStore from '../../store/useMapStore';

export default function CameraControls() {
  const { 'main-map': mapRef } = useMap();
  const isAnimating = useMapStore(state => state.isAnimating);
  const isTouring = useMapStore(state => state.isTouring);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const rotate = (direction) => {
    const map = mapRef?.getMap();
    if (!map || isAnimating || isTouring) return;
    
    const currentBearing = map.getBearing();
    map.easeTo({
      bearing: currentBearing + (direction === 'left' ? -45 : 45),
      duration: 1000
    });
  };

  const tilt = (direction) => {
    const map = mapRef?.getMap();
    if (!map || isAnimating || isTouring) return;
    
    const currentPitch = map.getPitch();
    let newPitch = currentPitch + (direction === 'up' ? 20 : -20);
    // Clamp pitch between 0 and 85
    if (newPitch > 85) newPitch = 85;
    if (newPitch < 0) newPitch = 0;
    
    map.easeTo({
      pitch: newPitch,
      duration: 1000
    });
  };

  if (isCollapsed) {
    return (
      <button 
        className="camera-controls-toggle-open" 
        onClick={() => setIsCollapsed(false)}
        title="Bảng điều khiển Camera"
      >
        <Gamepad2 size={24} color="#fff" />
      </button>
    );
  }

  return (
    <div className="camera-dpad">
      <button className="camera-controls-toggle-close" onClick={() => setIsCollapsed(true)} title="Thu gọn điều khiển">
        <X size={16} color="#aaa" />
      </button>
      <button className="camera-dpad-btn camera-dpad-up" onClick={() => tilt('up')} title="Ngẩng nhìn lên" disabled={isAnimating || isTouring}>
        <ChevronUp size={24} />
      </button>
      <button className="camera-dpad-btn camera-dpad-left" onClick={() => rotate('left')} title="Xoay trái" disabled={isAnimating || isTouring}>
        <RotateCcw size={18} />
      </button>
      <div className="camera-dpad-center">
        <Move size={20} />
      </div>
      <button className="camera-dpad-btn camera-dpad-right" onClick={() => rotate('right')} title="Xoay phải" disabled={isAnimating || isTouring}>
        <RotateCw size={18} />
      </button>
      <button className="camera-dpad-btn camera-dpad-down" onClick={() => tilt('down')} title="Cúi nhìn xuống" disabled={isAnimating || isTouring}>
        <ChevronDown size={24} />
      </button>
    </div>
  );
}
