import React from 'react';
import { Ruler } from 'lucide-react';
import useMapStore from '../../store/useMapStore';

export default function MeasurementButton() {
  const { isMeasuring, setIsMeasuring, setMeasurementPoints } = useMapStore();

  const toggleMeasure = () => {
    if (isMeasuring) {
      setIsMeasuring(false);
      setMeasurementPoints([]);
    } else {
      setIsMeasuring(true);
      setMeasurementPoints([]);
    }
  };

  return (
    <button 
      className={`measure-btn ${isMeasuring ? 'active' : ''}`} 
      onClick={toggleMeasure}
      title="Đo khoảng cách"
    >
      <Ruler size={20} color="#fff" />
    </button>
  );
}
