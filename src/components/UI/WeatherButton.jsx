import React from 'react';
import { CloudRain, Snowflake, Sun } from 'lucide-react';
import useMapStore from '../../store/useMapStore';

export default function WeatherButton() {
  const { weatherMode, setWeatherMode } = useMapStore();

  const toggleWeather = () => {
    if (weatherMode === 'none') setWeatherMode('rain');
    else if (weatherMode === 'rain') setWeatherMode('snow');
    else setWeatherMode('none');
  };

  const getIcon = () => {
    if (weatherMode === 'rain') return <CloudRain size={20} color="#fff" />;
    if (weatherMode === 'snow') return <Snowflake size={20} color="#fff" />;
    return <Sun size={20} color="#fff" />;
  };

  return (
    <button 
      className={`weather-btn ${weatherMode !== 'none' ? 'active' : ''}`} 
      onClick={toggleWeather}
      title="Thời tiết (Mưa/Tuyết/Nắng)"
    >
      {getIcon()}
    </button>
  );
}
