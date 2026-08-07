import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';
import useMapStore from '../../store/useMapStore';
import useRouteAnimation from '../../hooks/useRouteAnimation';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const modelLng = useMapStore(state => state.modelLng);
  const modelLat = useMapStore(state => state.modelLat);
  const flyAndDrawRoute = useRouteAnimation();
  
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        let searchQuery = query.trim();
        const lowerQuery = searchQuery.toLowerCase();
        
        // Tối ưu hoá query cho khu vực VN/HCM để Mapbox API trả về kết quả chính xác hơn
        if (!lowerQuery.includes('việt nam') && !lowerQuery.includes('viet nam') && !lowerQuery.includes('hồ chí minh') && !lowerQuery.includes('ho chi minh')) {
          if (lowerQuery.startsWith('quận') || lowerQuery.startsWith('q.') || lowerQuery.startsWith('q ')) {
            searchQuery += ', Hồ Chí Minh';
          } else {
            searchQuery += ', Việt Nam';
          }
        }

        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&proximity=${modelLng},${modelLat}&language=vi&country=vn`
        );
        const data = await response.json();
        setSuggestions(data.features || []);
        setIsOpen(true);
      } catch (error) {
        console.error('Error fetching geocoding data:', error);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query, modelLng, modelLat]);

  const handleSelect = (feature) => {
    setIsOpen(false);
    setQuery(feature.place_name);
    
    const [lng, lat] = feature.center;
    
    // Create a mock amenity object for routing and popup
    const searchedAmenity = {
      id: feature.id,
      name: feature.text,
      desc: feature.place_name,
      type: 'Searched',
      icon: 'MapPin',
      lng: lng,
      lat: lat,
      color: '#00ccff'
    };
    
    flyAndDrawRoute(searchedAmenity);
  };

  return (
    <div ref={wrapperRef} className="search-container">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Tìm kiếm địa điểm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (suggestions.length > 0) setIsOpen(true); }}
        />
        {isLoading && <Loader className="search-spinner" size={18} />}
      </div>
      
      {isOpen && suggestions.length > 0 && (
        <div className="search-dropdown">
          {suggestions.map((feature) => (
            <div 
              key={feature.id} 
              className="search-suggestion-item"
              onClick={() => handleSelect(feature)}
            >
              <MapPin size={16} className="suggestion-icon" />
              <div className="suggestion-text">
                <div className="suggestion-title">{feature.text}</div>
                <div className="suggestion-address">{feature.place_name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
