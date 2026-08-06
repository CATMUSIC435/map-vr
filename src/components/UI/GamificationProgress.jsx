import React, { useEffect, useState } from 'react';
import useMapStore from '../../store/useMapStore';
import { mockLocations } from '../../mocks/locations';
import confetti from 'canvas-confetti';
import { playSuccess } from '../../utils/audioUtils';
import { Award, ChevronRight } from 'lucide-react';

// Get total count
const totalAmenities = mockLocations.length;

export default function GamificationProgress() {
  const visitedAmenities = useMapStore(state => state.visitedAmenities);
  const visitedCount = visitedAmenities.length;
  const progressPercent = Math.round((visitedCount / totalAmenities) * 100);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (visitedCount > 0 && visitedCount === totalAmenities) {
      playSuccess();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff3366', '#00ccff', '#33ff99', '#ff9933']
      });
    }
  }, [visitedCount]);

  if (isCollapsed) {
    return (
      <button 
        className="gamification-toggle-open" 
        onClick={() => setIsCollapsed(false)}
        title="Tiến độ khám phá"
      >
        <Award size={20} color="#fff" />
      </button>
    );
  }

  return (
    <div className="gamification-panel">
      <button className="gamification-toggle-close" onClick={() => setIsCollapsed(true)}>
        <ChevronRight size={16} color="#aaa" />
      </button>
      <div className="gamification-header">
        <span>Khám phá tiện ích</span>
        <span className="gamification-count">{visitedCount}/{totalAmenities}</span>
      </div>
      <div className="gamification-progress-bar">
        <div 
          className="gamification-progress-fill" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}
