import React, { useState, useMemo } from 'react';
import { GiftReviews } from '../types';
import { UGCLightbox } from './UGCLightbox';

interface Props {
  reviews: GiftReviews;
}

export const ReviewsSection: React.FC<Props> = ({ reviews }) => {
  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const allPhotos = useMemo(() => {
    return reviews.items.reduce((acc: string[], item) => {
      if (item.photos) return [...acc, ...item.photos];
      return acc;
    }, []);
  }, [reviews]);

  const visibleItems = expanded ? reviews.items : reviews.items.slice(0, 2);

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5 text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 ${i < rating ? 'fill-current' : 'text-gray-200 fill-current'}`} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
         Отзывы 
         <span className="text-gray-400 font-medium text-sm">({reviews.count})</span>
      </h3>

      {/* Highlights */}
      {reviews.highlights && (
        <div className="flex flex-wrap gap-2 mb-6">
             {reviews.highlights.map(h => (
               <span key={h} className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-indigo-100">
                 👍 {h}
               </span>
             ))}
        </div>
      )}

      {/* Photo Grid */}
      {allPhotos.length > 0 && (
         <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 mb-2">
            {allPhotos.map((photo, i) => (
                <button 
                key={i} 
                onClick={() => setLightboxIndex(i)}
                className="shrink-0 w-24 h-24 rounded-2xl overflow-hidden shadow-sm relative group"
                >
                <img src={photo} alt="UGC" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </button>
            ))}
         </div>
      )}

      {/* List */}
      <div className="space-y-4">
          {visibleItems.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100/50">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                        {item.author[0]}
                     </div>
                     <div>
                        <div className="font-bold text-sm text-gray-900 leading-none">{item.author}</div>
                        <div className="mt-1">{renderStars(item.rating)}</div>
                     </div>
                  </div>
                  <span className="text-[10px] text-gray-400">{item.date}</span>
               </div>
               <p className="text-sm text-gray-600 leading-relaxed pl-10">{item.text}</p>
            </div>
          ))}
      </div>

      {reviews.items.length > 2 && (
        <button 
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-4 py-3 text-sm font-bold text-gray-500 hover:text-brand-blue bg-white border border-gray-200 rounded-2xl transition-all active:scale-[0.98]"
        >
          {expanded ? 'Свернуть' : `Показать все (${reviews.items.length})`}
        </button>
      )}

      {lightboxIndex !== null && allPhotos.length > 0 && (
         <UGCLightbox 
            images={allPhotos} 
            initialIndex={lightboxIndex} 
            onClose={() => setLightboxIndex(null)} 
         />
      )}
    </div>
  );
};