import React, { useEffect, useState, useRef } from 'react';

interface Props {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const UGCLightbox: React.FC<Props> = ({ images, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  
  // Swipe State
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, onClose]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null; 
    touchStart.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) next();
    if (isRightSwipe) prev();
  };

  const next = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev + 1) % images.length);
  };

  const prev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div 
        className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center animate-pop touch-none" 
        onClick={onClose}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-20 bg-black/20 rounded-full"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="absolute top-4 left-4 text-white font-bold bg-black/30 px-3 py-1 rounded-full text-sm">
         {index + 1} / {images.length}
      </div>

      <button onClick={prev} className="absolute left-2 md:left-8 p-3 text-white/50 hover:text-white transition-colors z-20 hidden md:block">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="relative max-w-full max-h-full p-2" onClick={(e) => e.stopPropagation()}>
        <img 
            src={images[index]} 
            alt={`Review photo ${index + 1}`} 
            className="max-h-[85vh] max-w-[95vw] object-contain rounded-md shadow-2xl pointer-events-none select-none"
        />
      </div>

      <button onClick={next} className="absolute right-2 md:right-8 p-3 text-white/50 hover:text-white transition-colors z-20 hidden md:block">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      
      {/* Mobile Swipe Hint */}
      <div className="absolute bottom-10 left-0 right-0 text-center text-white/30 text-xs md:hidden pointer-events-none">
          Свайп для переключения
      </div>
    </div>
  );
};