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
  const flyAndDrawRoute = useRouteAnimation();
  
  const [activeCategory, setActiveCategory] = useState('Tất cả');

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
      {/* Category Tabs */}
      <div className="carousel-categories">
        {categories.map(cat => (
          <button 
            key={cat}
            className={`category-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="embla" ref={emblaRef}>
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
