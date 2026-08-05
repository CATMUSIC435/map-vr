import React from 'react';
import useMapStore from '../../store/useMapStore';
import { Sun, Moon } from 'lucide-react';

export default function TimeSlider() {
  const timeOfDay = useMapStore(state => state.timeOfDay);
  const setTimeOfDay = useMapStore(state => state.setTimeOfDay);

  const formatTime = (val) => {
    const hours = Math.floor(val);
    const mins = Math.round((val - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="time-slider-panel">
      <div className="time-header">
        <span className="time-label">Thời gian mô phỏng</span>
        <span className="time-value">{formatTime(timeOfDay)}</span>
      </div>
      <div className="time-slider-container">
        <Moon size={14} color="#666" />
        <input 
          type="range" 
          min="0" 
          max="24" 
          step="0.1" 
          value={timeOfDay} 
          onChange={(e) => setTimeOfDay(parseFloat(e.target.value))}
          className="time-slider-input"
        />
        <Sun size={14} color="#ffcc00" />
      </div>
    </div>
  );
}
