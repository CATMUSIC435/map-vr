import React from 'react';
import { Flame } from 'lucide-react';
import useMapStore from '../../store/useMapStore';

export default function HeatmapButton() {
  const isHeatmapActive = useMapStore(state => state.isHeatmapActive);
  const toggleHeatmap = useMapStore(state => state.toggleHeatmap);

  return (
    <button 
      className={`weather-btn ${isHeatmapActive ? 'active' : ''}`}
      onClick={toggleHeatmap}
      title={isHeatmapActive ? "Tắt Bản đồ Nhiệt (Heatmap)" : "Bật Bản đồ Nhiệt (Heatmap)"}
    >
      <Flame size={20} color={isHeatmapActive ? "#ff5500" : "#fff"} />
    </button>
  );
}
