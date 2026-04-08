import { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const ProductGallery = ({ media = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (media.length === 0) {
    return (
      <div className="aspect-square bg-light rounded-lg flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  const activeItem = media[activeIndex];

  return (
    <div className="space-y-4">
      {/* Main viewer */}
      <div className="relative aspect-square bg-light rounded-lg overflow-hidden group">
        {activeItem.type === 'video' ? (
          <video
            src={activeItem.url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={activeItem.url}
            alt={activeItem.altText || 'Product image'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        )}

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1))}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1))}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="flex space-x-3 overflow-x-auto pb-2">
          {media.map((item, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 transition-all ${
                index === activeIndex ? 'border-secondary' : 'border-transparent hover:border-gray-300'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs text-gray-500">Video</span>
                </div>
              ) : (
                <img
                  src={item.url}
                  alt={item.altText || `Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
