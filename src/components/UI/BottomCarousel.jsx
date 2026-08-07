import React, { useState, useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import useMapStore from '../../store/useMapStore';
import useRouteAnimation from '../../hooks/useRouteAnimation';
import { mockLocations } from '../../mocks/locations';
import * as Icons from 'lucide-react';

export default function BottomCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ dragFree: true });
  const activeAmenity = useMapStore(state => state.activeAmenity);
  const isAnimating = useMapStore(state => state.isAnimating);
  const showMarkers = useMapStore(state => state.showMarkers);
  const toggleMarkers = useMapStore(state => state.toggleMarkers);
  const flyAndDrawRoute = useRouteAnimation();
  
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [isExpanded, setIsExpanded] = useState(true);

  // Extract unique categories
  const categories = ['Tất cả', ...new Set(mockLocations.map(loc => loc.type))];

  // Filter locations by category
  const filteredLocations = activeCategory === 'Tất cả' 
    ? mockLocations 
    : mockLocations.filter(loc => loc.type === activeCategory);

  // Scroll to start when category changes
  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(0);
  }, [activeCategory, emblaApi]);

  const getIconColor = (iconName) => {
    if (iconName === 'ShoppingBag') return '#00ccff';
    if (iconName === 'School') return '#33ff99';
    if (iconName === 'TreePine') return '#33cc33';
    if (iconName === 'Hotel') return '#ff9933';
    if (iconName === 'MapPin') return '#ff3366';
    return '#ff3366';
  };

  return (
    <div className="bottom-carousel-container">
      <div className="carousel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="carousel-categories" style={{ flex: 1, overflowX: 'auto', display: 'flex', paddingRight: '10px' }}>
          {categories.map(cat => (
            <button 
              key={cat}
              className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => {
                setActiveCategory(cat);
                if (!isExpanded) setIsExpanded(true);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="carousel-actions" style={{ display: 'flex', gap: '8px', paddingRight: '10px' }}>
          <button 
            className="category-btn" 
            onClick={toggleMarkers} 
            title={showMarkers ? 'Ẩn Markers' : 'Hiện Markers'}
            style={{ padding: '8px', display: 'flex', alignItems: 'center' }}
          >
            {showMarkers ? <Icons.Eye size={18} /> : <Icons.EyeOff size={18} />}
          </button>
          <button 
            className="category-btn" 
            onClick={() => setIsExpanded(!isExpanded)} 
            title={isExpanded ? 'Thu gọn' : 'Mở rộng'}
            style={{ padding: '8px', display: 'flex', alignItems: 'center' }}
          >
            {isExpanded ? <Icons.ChevronDown size={18} /> : <Icons.ChevronUp size={18} />}
          </button>
        </div>
      </div>

      <div className={`embla ${!isExpanded ? 'hidden' : ''}`} ref={emblaRef} style={{ display: isExpanded ? 'block' : 'none' }}>
        <div className="embla__container">
          {filteredLocations.map(amenity => {
            const IconComponent = Icons[amenity.icon] || Icons.MapPin;
            const iconColor = getIconColor(amenity.icon);
            const isActive = activeAmenity?.id === amenity.id;

            return (
              <div className="embla__slide" key={amenity.id}>
                <div 
                  className={`amenity-card ${isActive ? 'active' : ''}`}
                  onClick={() => flyAndDrawRoute(amenity)}
                  style={{ 
                    borderColor: isActive ? iconColor : undefined,
                    opacity: isAnimating ? 0.5 : 1,
                    pointerEvents: isAnimating ? 'none' : 'auto'
                  }}
                >
                  {/* Render Icon instead of Image */}
                  <div className="amenity-card-icon-wrapper" style={{ backgroundColor: `${iconColor}20` }}>
                    <IconComponent size={18} color={iconColor} strokeWidth={2} />
                  </div>
                  
                  <div className="amenity-card-text">
                    <h3>{amenity.name}</h3>
                    <p>{amenity.dist} - {amenity.time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
