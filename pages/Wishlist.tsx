import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GiftCard } from '../components/GiftCard';
import { Gift } from '../domain/types';
import { api } from '../api';
import { Mascot } from '../components/Mascot';
import { Button } from '../components/Button';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { track } from '../utils/analytics';

export const Wishlist: React.FC = () => {
   const navigate = useNavigate();
   const [items, setItems] = useState<Gift[]>([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState('');
   
   // Selection Mode State
   const [isSelectionMode, setIsSelectionMode] = useState(false);
   const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
   
   // Modal
   const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
   const [isModalOpen, setIsModalOpen] = useState(false);

  const loadItems = async () => {
    try {
        setLoading(true);
        const ids = await api.wishlist.getAll();
        if (ids.length > 0) {
            const gifts = await api.gifts.getMany(ids);
            setItems(gifts);
        } else {
            setItems([]);
        }
    } catch (e) {
        console.error("Failed to load wishlist", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      searchQuery === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  const totalPrice = useMemo(() => {
    return filteredItems.reduce((sum, item) => sum + item.price, 0);
  }, [filteredItems]);

  const formatPrice = (price: number) => new Intl.NumberFormat('ru-RU').format(price);

  const toggleSelectionMode = () => {
      setIsSelectionMode(!isSelectionMode);
      setSelectedItems(new Set());
  };

  const toggleItemSelection = (id: string) => {
      const newSet = new Set(selectedItems);
      if (newSet.has(id)) {
          newSet.delete(id);
      } else {
          newSet.add(id);
      }
      setSelectedItems(newSet);
  };

  const handleBulkRemove = async () => {
      if (selectedItems.size === 0) return;
      if (!confirm(`Удалить ${selectedItems.size} желаний?`)) return;

      for (const id of selectedItems) {
          await api.wishlist.remove(id);
      }
      track('bulk_remove_wishlist', { count: selectedItems.size });
      setIsSelectionMode(false);
      setSelectedItems(new Set());
      loadItems();
  };

  const handleShare = () => {
      const shareData = {
          title: 'Мой вишлист Gifty',
          text: `Я нашел подарков на ${formatPrice(totalPrice)} ₽! Посмотри:`,
          url: window.location.href // In real app: generate a shared link
      };

      if (navigator.share) {
          navigator.share(shareData).catch(console.error);
      } else {
          alert('Ссылка скопирована! (имитация)');
      }
      track('share_wishlist');
  };

  const handleCardClick = (gift: Gift) => {
      if (isSelectionMode) {
          toggleItemSelection(gift.id);
      } else {
          setSelectedGift(gift);
          setIsModalOpen(true);
      }
  };

  const handleGiftUpdate = (updatedGift: Gift) => {
      setItems(prev => prev.map(g => g.id === updatedGift.id ? updatedGift : g));
  };

  return (
    <div className="min-h-screen pt-24 pb-32 px-4 bg-[#F8F9FE] relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-blue/10 to-transparent -z-10" />
      <div className="fixed top-20 right-[-50px] w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -z-10 animate-pulse-slow" />

      <div className="max-w-4xl mx-auto">
        
        {/* --- 1. IMMERSIVE HEADER (Wallet Card) --- */}
        <div className="relative mb-8 group perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue to-brand-purple blur-2xl opacity-40 rounded-[2.5rem] transform translate-y-4 scale-90 transition-all group-hover:scale-95 group-hover:opacity-50"></div>
            
            <div className="relative bg-gradient-to-br from-[#1e40af] via-[#3b82f6] to-[#7c3aed] rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl overflow-hidden border border-white/10">
                {/* Texture */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 blur-[60px] rounded-full mix-blend-overlay"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-1 opacity-80">Стоимость желаний</p>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight drop-shadow-sm flex items-baseline gap-2">
                            {formatPrice(totalPrice)}
                            <span className="text-2xl md:text-3xl opacity-60 font-medium">₽</span>
                        </h1>
                        <p className="text-blue-100/70 text-sm mt-2 font-medium">
                            {filteredItems.length} {filteredItems.length === 1 ? 'подарок' : (filteredItems.length > 1 && filteredItems.length < 5) ? 'подарка' : 'подарков'} в списке
                        </p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={handleShare}
                            className="flex-1 md:flex-none bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            Поделиться
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {/* --- 2. STICKY CONTROL BAR --- */}
        <div className="sticky top-6 z-40 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-[1.5rem] p-2 pl-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] border border-white/50 flex items-center gap-2">
                
                {/* Search */}
                <div className="flex-grow flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input 
                        type="text" 
                        placeholder="Найти в списке..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent outline-none text-brand-dark font-bold placeholder-gray-400 h-10"
                    />
                </div>

                {/* Edit Toggle */}
                <button 
                    onClick={toggleSelectionMode}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${isSelectionMode ? 'bg-brand-dark text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                    {isSelectionMode ? 'Готово' : 'Выбрать'}
                </button>
            </div>
        </div>

        {/* --- 3. CONTENT GRID --- */}
        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium animate-pulse">Загружаем желания...</p>
            </div>
        ) : items.length === 0 ? (
            // EMPTY STATE
            <div className="flex flex-col items-center text-center py-10 animate-pop">
                <div className="relative mb-6">
                    <div className="absolute inset-0 bg-yellow-400/30 blur-[60px] rounded-full"></div>
                    <Mascot emotion="thinking" className="w-40 h-40 relative z-10" />
                </div>
                <h2 className="text-2xl font-black text-brand-dark mb-2">Вишлист пуст</h2>
                <p className="text-gray-500 max-w-xs mx-auto mb-8 font-medium">
                    Пока здесь тихо. Давайте найдем что-нибудь невероятное с помощью магии!
                </p>
                <Button onClick={() => navigate('/quiz')} className="shadow-xl animate-pulse-slow">
                    Начать поиск подарков
                </Button>
            </div>
        ) : (
            // GRID
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 pb-24">
                {filteredItems.map((gift) => {
                    const isSelected = selectedItems.has(gift.id);
                    
                    return (
                        <div 
                            key={gift.id} 
                            className={`relative transition-all duration-300 ${isSelectionMode ? 'cursor-pointer' : ''} ${isSelected ? 'transform scale-[0.98]' : 'hover:-translate-y-1'}`}
                            onClick={() => handleCardClick(gift)}
                        >
                            <GiftCard 
                                gift={gift} 
                                // Disable internal wishlist toggle in selection mode to prevent conflicts
                                onToggleWishlist={isSelectionMode ? () => {} : loadItems}
                            />
                            
                            {/* Selection Overlay */}
                            {isSelectionMode && (
                                <div className={`absolute inset-0 z-20 rounded-[20px] transition-all duration-200 border-[3px] flex items-start justify-end p-3 ${isSelected ? 'bg-brand-blue/10 border-brand-blue' : 'bg-white/50 border-transparent hover:bg-white/30'}`}>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-brand-blue border-brand-blue scale-110' : 'bg-white border-gray-300'}`}>
                                        {isSelected && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        )}

      </div>

      {/* --- 4. FLOATING ACTION BAR (Selection Mode) --- */}
      <div className={`fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:max-w-md z-50 transition-all duration-500 ${isSelectionMode && selectedItems.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'}`}>
          <div className="bg-brand-dark text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between border border-white/10">
              <div className="font-bold pl-2">
                  Выбрано: {selectedItems.size}
              </div>
              <div className="flex gap-2">
                  <button 
                    onClick={handleBulkRemove}
                    className="bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-white px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                  >
                      Удалить
                  </button>
                  <button 
                    onClick={handleShare}
                    className="bg-white text-brand-dark hover:bg-gray-100 px-4 py-2 rounded-xl font-bold text-sm transition-colors"
                  >
                      Поделиться
                  </button>
              </div>
          </div>
      </div>

      {/* Details Modal */}
      {selectedGift && (
        <GiftDetailsModal 
          gift={selectedGift} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          answers={null}
          onWishlistChange={loadItems}
          onUpdate={handleGiftUpdate}
        />
      )}
    </div>
  );
};