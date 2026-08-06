import React from 'react';
import { Car } from 'lucide-react';
import useMapStore from '../../store/useMapStore';

export default function TrafficButton() {
  const isTrafficActive = useMapStore(state => state.isTrafficActive);
  const toggleTraffic = useMapStore(state => state.toggleTraffic);

  return (
    <button 
      className={`weather-btn ${isTrafficActive ? 'active' : ''}`}
      onClick={toggleTraffic}
      title={isTrafficActive ? "Tắt Mô phỏng Giao thông" : "Bật Mô phỏng Giao thông"}
    >
      <Car size={20} color={isTrafficActive ? "#00ccff" : "#fff"} />
    </button>
  );
}
