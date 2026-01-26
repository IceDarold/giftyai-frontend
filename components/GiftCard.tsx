import React, { useState, useEffect } from 'react';
import { Gift } from '../types';
import { addToWishlist, removeFromWishlist, isInWishlist } from '../utils/storage';
import { track } from '../utils/analytics';

interface Props {
  gift: Gift;
  featured?: boolean;
  onToggleWishlist?: () => void;
  onClick?: (gift: Gift) => void;
}

export const GiftCard: React.FC<Props> = ({ gift, featured = false, onToggleWishlist, onClick }) => {
  const [saved, setSaved] = useState(isInWishlist(gift.id));
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setSaved(isInWishlist(gift.id));
  }, [gift.id, onToggleWishlist]);

  const handleWishlist = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (saved) {
      removeFromWishlist(gift.id);
      track('remove_wishlist', { id: gift.id });
    } else {
      addToWishlist(gift.id);
      track('add_wishlist', { id: gift.id });
    }
    setSaved(!saved);
    if (onToggleWishlist) onToggleWishlist();
  };

  const handleCardClick = () => {
    if (onClick) onClick(gift);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
      }
  };

  const formatPrice = (price: number | null) => {
    if (!price) return '---';
    return new Intl.NumberFormat('ru-RU', { style: 'decimal', maximumFractionDigits: 0 }).format(price) + ' ' + (gift.currency || '₽');
  };

  const formatCompactReview = (count: number) => {
      if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
      return count;
  }

  const giftImage = gift.imageUrl;

  return (
    <div 
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      className={`group relative bg-white rounded-[20px] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden border border-gray-100/50 outline-none focus:ring-4 focus:ring-brand-blue/20 ${featured ? 'ring-2 ring-brand-purple ring-offset-2' : ''}`}
    >
      {featured && (
        <div className="absolute top-0 left-0 z-20 bg-brand-purple text-white text-[10px] font-bold px-2 py-1 rounded-br-lg shadow-sm">
          Лидер
        </div>
      )}

      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-50 rounded-t-[20px]">
        <img 
          src={imgError || !giftImage ? 'https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image' : giftImage} 
          alt={gift.title} 
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <button 
          onClick={handleWishlist}
          aria-label={saved ? "Удалить из избранного" : "Добавить в избранное"}
          className={`absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 z-10 shadow-sm outline-none focus:ring-2 focus:ring-brand-purple ${saved ? 'bg-white/95 text-[#F91155]' : 'bg-white/70 hover:bg-white text-gray-400 hover:text-gray-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-transform active:scale-90 ${saved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={saved ? 0 : 2} fill={saved ? "currentColor" : "none"}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {gift.merchant && (
          <div className="absolute bottom-2 right-2 flex justify-end items-end">
                <div className="bg-brand-blue/90 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[6px] shadow-sm flex items-center gap-1">
                    <span>✨</span>
                    {gift.merchant}
                </div>
          </div>
        )}
      </div>
      
      <div className="p-3 flex flex-col flex-grow relative">
        <div className="flex items-baseline gap-2 mb-1">
           <span className="text-lg font-extrabold text-gray-900 leading-none tracking-tight">
              {formatPrice(gift.price)}
           </span>
           {gift.price && (
             <span className="text-xs text-gray-400 line-through decoration-gray-300 font-medium">
                {formatPrice(Math.round(gift.price * 1.2))}
             </span>
           )}
        </div>

        <h3 className="text-[13px] font-medium text-gray-700 leading-snug line-clamp-2 mb-2 h-[2.5em] tracking-tight">
            {gift.title}
        </h3>

        <div className="flex items-center gap-1.5 mt-auto">
            <div className="flex items-center gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-brand-blue fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-xs font-bold text-gray-800 pt-0.5">
                    {gift.reviews ? gift.reviews.rating.toFixed(1) : '5.0'}
                </span>
            </div>
            <span className="text-[10px] text-gray-400 pt-0.5 font-medium">
                • {gift.reviews ? formatCompactReview(gift.reviews.count) : 'New'}
            </span>
        </div>
        
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 lg:block hidden">
            <div className="bg-brand-blue text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md hover:bg-brand-blue/90">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </div>
        </div>
      </div>
    </div>
  );
};