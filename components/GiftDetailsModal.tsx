import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Gift, QuizAnswers } from '../domain/types';
import { api } from '../api';
import { isInWishlist, addToWishlist, removeFromWishlist } from '../utils/storage'; 
import { track } from '../utils/analytics';
import { Button } from './Button';
import { ReviewsSection } from './ReviewsSection';
import { useDevMode } from './DevModeContext';

interface Props {
  gift: Gift;
  answers: QuizAnswers | null;
  isOpen: boolean;
  onClose: () => void;
  onWishlistChange: () => void;
  onUpdate?: (gift: Gift) => void; // New prop for Dev Mode syncing
}

export const GiftDetailsModal: React.FC<Props> = ({ gift: initialGift, answers, isOpen, onClose, onWishlistChange, onUpdate }) => {
  const [gift, setGift] = useState<Gift>(initialGift);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [matchScore, setMatchScore] = useState(0);
  
  // Dev Mode Edit State
  const { isDevMode } = useDevMode();
  const [isEditing, setIsEditing] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
        setIsEditing(false); // Reset edit mode on close
        return;
    }
    
    // Update local state if the prop changes (e.g. fresh data)
    setGift(initialGift);
    setSaved(isInWishlist(initialGift.id));
    setMatchScore(0);
    if(contentRef.current) contentRef.current.scrollTop = 0;

    if (answers) {
        const targetScore = Math.floor(Math.random() * (99 - 88) + 88);
        setTimeout(() => setMatchScore(targetScore), 400);
    }

    // Still fetch full details if not already present, otherwise use initialGift
    if (!initialGift.description && !initialGift.reviews) {
      setLoading(true);
      api.gifts.getById(initialGift.id)
        .then(fullGift => setGift(fullGift))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [initialGift.id, isOpen, answers, initialGift]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
      window.addEventListener('keydown', handleEsc);
      return () => {
        document.body.style.overflow = 'unset';
        window.removeEventListener('keydown', handleEsc);
      };
    }
  }, [isOpen, onClose]);

  const handleWishlist = () => {
    if (saved) { removeFromWishlist(gift.id); } 
    else { addToWishlist(gift.id); }
    setSaved(!saved);
    onWishlistChange();
  };

  const handleBuyClick = () => {
      track('click_buy', { id: gift.id, merchant: gift.merchant });
      window.open(gift.productUrl, '_blank', 'noopener,noreferrer');
  };

  // --- Edit Handlers ---
  const handleEditChange = (field: keyof Gift, value: any) => {
      const updatedGift = { ...gift, [field]: value };
      setGift(updatedGift);
      // Propagate change to parent immediately for live preview in background list
      if (onUpdate) {
          onUpdate(updatedGift);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              handleEditChange('imageUrl', reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  if (!isOpen) return null;

  const formatPrice = (price: number | null) => {
    if (!price) return '---';
    return new Intl.NumberFormat('ru-RU').format(price) + ' ' + (gift.currency || '₽');
  };

  const giftImage = gift.imageUrl;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
      <div className={`absolute inset-0 bg-[#0B0033]/60 backdrop-blur-xl pointer-events-auto transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`bg-white w-full max-w-2xl h-[96vh] sm:h-[90vh] sm:max-h-[850px] rounded-t-[3rem] sm:rounded-[3rem] relative z-10 flex flex-col pointer-events-auto shadow-2xl transform transition-transform duration-500 overflow-hidden ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Top Controls */}
        <div className="absolute top-6 right-6 z-40 flex gap-2">
            {isDevMode && (
                <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`h-11 px-4 rounded-full flex items-center justify-center font-bold text-sm backdrop-blur-md transition-all ${isEditing ? 'bg-green-500 text-white' : 'bg-black/10 hover:bg-black/20 text-white'}`}
                >
                    {isEditing ? 'Done' : 'Edit'}
                </button>
            )}
            <button onClick={onClose} className="w-11 h-11 bg-black/10 hover:bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>

        <div ref={contentRef} className="flex-grow overflow-y-auto no-scrollbar pb-32 bg-[#FAFAFA]">
           <div className="relative h-[50vh] sm:h-[450px] w-full shrink-0 group/image">
              <img src={giftImage || 'https://placehold.co/400x500/f3f4f6/9ca3af?text=No+Image'} alt={gift.title} className="w-full h-full object-cover" />
              
              {/* Image Edit Overlay */}
              {isEditing && (
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 gap-4">
                      <input 
                        type="text"
                        className="w-full bg-white/90 p-2 rounded text-black text-sm"
                        placeholder="Image URL"
                        value={gift.imageUrl || ''}
                        onChange={e => handleEditChange('imageUrl', e.target.value)}
                      />
                      <span className="text-white font-bold">OR</span>
                      <label className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded cursor-pointer">
                          Upload File
                          <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                  </div>
              )}

              <div className={`absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#FAFAFA] ${isEditing ? 'hidden' : ''}`} />
              
              {answers && matchScore > 0 && !isEditing && (
                <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-xl p-2 pr-4 rounded-2xl shadow-xl flex items-center gap-3">
                    <div className="text-brand-blue font-black">{matchScore}%</div>
                    <div className="text-[10px] uppercase font-bold text-gray-400">Match</div>
                </div>
              )}
           </div>
           
           <div className="px-6 sm:px-10 -mt-6 relative z-10">
              <div className="mb-6">
                 {isEditing ? (
                     <div className="space-y-2">
                         <input 
                            className="w-full text-3xl font-black text-brand-dark bg-white border border-gray-300 rounded p-1"
                            value={gift.title}
                            onChange={e => handleEditChange('title', e.target.value)}
                         />
                         <input 
                            type="number"
                            className="w-full text-2xl font-medium text-gray-400 bg-white border border-gray-300 rounded p-1"
                            value={gift.price || ''}
                            onChange={e => handleEditChange('price', parseInt(e.target.value))}
                            placeholder="Price"
                         />
                     </div>
                 ) : (
                     <>
                        <h2 className="text-3xl sm:text-4xl font-black text-brand-dark leading-[1.1] mb-2 tracking-tight">{gift.title}</h2>
                        <div className="text-2xl font-medium text-gray-400">{formatPrice(gift.price)}</div>
                     </>
                 )}
              </div>

              <div className="relative overflow-hidden rounded-[2rem] p-6 mb-8 shadow-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-100">
                 {isEditing ? (
                     <textarea 
                        className="w-full bg-white/50 border border-gray-300 rounded p-2 text-lg font-medium h-24"
                        value={gift.reason || ''}
                        onChange={e => handleEditChange('reason', e.target.value)}
                        placeholder="AI Reason"
                     />
                 ) : (
                     <p className="text-lg text-brand-dark/80 font-medium italic">"{gift.reason || 'Отличный выбор от ИИ-Санты'}"</p>
                 )}
              </div>

              <div className="mb-10 text-gray-600 leading-relaxed">
                  {isEditing ? (
                      <textarea 
                        className="w-full bg-white border border-gray-300 rounded p-2 h-40"
                        value={gift.description || ''}
                        onChange={e => handleEditChange('description', e.target.value)}
                        placeholder="Description"
                      />
                  ) : (
                      <p>{gift.description || 'Описание подбирается AI-Сантой...'}</p>
                  )}
              </div>
              
              {gift.reviews && <div className="mb-8"><ReviewsSection reviews={gift.reviews} /></div>}
           </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 z-50 p-6 bg-gradient-to-t from-[#FAFAFA] to-transparent">
            <div className="max-w-xl mx-auto flex items-center gap-4">
                 <button onClick={handleWishlist} className={`w-[4.5rem] h-[4.5rem] rounded-[1.5rem] flex items-center justify-center border transition-all ${saved ? 'bg-white border-red-100 text-[#F91155]' : 'bg-white/90 backdrop-blur-xl border-white/40 text-gray-400'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${saved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" fill="none"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                 </button>
                 <Button fullWidth onClick={handleBuyClick} className="h-[4.5rem] rounded-[1.5rem] text-xl">Купить сейчас</Button>
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};