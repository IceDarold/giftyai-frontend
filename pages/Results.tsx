import React, { useEffect, useState } from 'react';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { api } from '../api';
import { Gift, QuizAnswers, RecommendationsResponse } from '../domain/types';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { track } from '../utils/analytics';
import { Mascot } from '../components/Mascot';
import { useDevMode } from '../components/DevModeContext';
import { inclineName } from '../utils/stringUtils';
import { createPortal } from 'react-dom';
import { isInWishlist, addToWishlist, removeFromWishlist } from '../utils/storage';
import { AmbientSnow } from '../components/SnowSystem';

const LOADING_MESSAGES = [
    "Анализирую магию...",
    "Советуюсь с эльфами...",
    "Ищу идеальные совпадения...",
    "Спрашиваю у Санты...",
    "Проверяю списки желаний...",
    "Калибрую нейросеть...",
    "Шуршу подарочной бумагой...",
    "Добавляю щепотку волшебства...",
    "Сканирую тренды...",
    "Отсеиваю скучные носки...",
    "Ищу то, что вызовет восторг...",
    "Завариваю какао для вдохновения...",
    "Распутываю гирлянду идей...",
    "Договариваюсь с жабой (про бюджет)...",
    "Изучаю совместимость...",
    "Почти готово, честно...",
    "Генерирую радость...",
    "Смотрю, что дарят звезды...",
    "Подбираю лучшую цену...",
    "Ищу редкие артефакты...",
    "Включаю новогоднее настроение...",
    "Проверяю наличие на Северном полюсе...",
    "Составляю секретный список...",
    "Думаю, как удивить...",
    "Еще одна секундочка...",
    "Связываюсь с базой данных чудес...",
    "Выбираю самое лучшее..."
];

const LoadingScreen: React.FC = () => {
  const [msg, setMsg] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    // Set initial random message
    setMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);

    const interval = setInterval(() => {
        setMsg(prev => {
            const available = LOADING_MESSAGES.filter(m => m !== prev);
            return available[Math.floor(Math.random() * available.length)];
        });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-6 text-center bg-brand-dark overflow-hidden touch-none text-white">
        <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-[100px] animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-purple/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative z-10 animate-float">
            <Mascot className="w-32 h-32 mb-8 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" emotion="thinking" accessory="glasses" />
        </div>
        <h2 className="text-2xl font-black mb-3 animate-pulse text-white transition-all duration-500 min-h-[4rem] flex items-center justify-center">
            {msg}
        </h2>
        <div className="flex gap-2 justify-center mb-8">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-white/50 text-sm max-w-xs font-medium">Ищу идеальные варианты среди тысяч товаров</p>
    </div>,
    document.body
  );
};

// --- Featured Hero Card Component ---

const FeaturedCard: React.FC<{ 
  gift: Gift; 
  onClick: (g: Gift) => void;
  onToggleWishlist: () => void; 
}> = ({ gift, onClick, onToggleWishlist }) => {
  const [saved, setSaved] = useState(isInWishlist(gift.id));

  useEffect(() => {
      setSaved(isInWishlist(gift.id));
  }, [gift.id]);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) {
      removeFromWishlist(gift.id);
      track('remove_wishlist', { id: gift.id });
    } else {
      addToWishlist(gift.id);
      track('add_wishlist', { id: gift.id });
    }
    setSaved(!saved);
    onToggleWishlist();
  };

  const formattedPrice = gift.price ? new Intl.NumberFormat('ru-RU').format(gift.price) + ' ' + (gift.currency === 'USD' ? '$' : '₽') : '---';

  return (
    <div 
        onClick={() => onClick(gift)}
        className="group relative w-full bg-white rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-[0_0_50px_rgba(124,58,237,0.3)] transition-all duration-500 cursor-pointer border border-white/20 transform hover:-translate-y-1"
    >
        <div className="flex flex-col md:flex-row h-auto md:min-h-[28rem]">
            {/* Image Side */}
            <div className="relative w-full md:w-5/12 h-96 md:h-auto overflow-hidden bg-gray-100">
                <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-brand-blue to-brand-purple text-white text-[10px] font-black px-3 py-1.5 rounded-lg shadow-lg uppercase tracking-wider flex items-center gap-1">
                    <span>✨</span> Выбор №1
                </div>
                
                {/* Wishlist Button */}
                <button 
                    onClick={handleWishlist}
                    className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${saved ? 'bg-white text-[#F91155]' : 'bg-white/80 hover:bg-white text-gray-400'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={saved ? 0 : 2} fill={saved ? "currentColor" : "none"}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>

                <img 
                    src={gift.imageUrl || 'https://placehold.co/600x600/f3f4f6/9ca3af?text=No+Image'} 
                    alt={gift.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Mobile Gradient & Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent md:hidden" />
                <div className="absolute bottom-4 left-4 right-4 md:hidden text-white pb-2">
                     <h2 className="text-xl font-bold leading-tight mb-1 line-clamp-2 drop-shadow-md">{gift.title}</h2>
                     <p className="font-black text-2xl drop-shadow-md">{formattedPrice}</p>
                </div>
            </div>

            {/* Content Side (Desktop) */}
            <div className="relative w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-center bg-white">
                
                {/* Desktop Header */}
                <div className="hidden md:block mb-6">
                    <h2 className="text-3xl lg:text-4xl font-black text-brand-dark leading-[1.1] mb-3 group-hover:text-brand-blue transition-colors line-clamp-2">
                        {gift.title}
                    </h2>
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
                        {formattedPrice}
                    </div>
                </div>

                {/* AI Reason Bubble */}
                <div className="relative bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-3xl p-5 mb-8 shadow-sm">
                    <div className="absolute -top-4 -left-2 bg-white p-1.5 rounded-full shadow-sm border border-indigo-50 rotate-[-10deg]">
                        <span className="text-2xl">🤖</span>
                    </div>
                    <p className="text-indigo-900/80 font-medium text-sm md:text-lg leading-relaxed pl-2">
                        "{gift.reason || 'Этот подарок идеально подходит под выбранные параметры.'}"
                    </p>
                </div>

                {/* Tags */}
                {gift.tags && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {gift.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="px-3 py-1 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wide">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        {gift.merchant && (
                            <>
                                <span>{gift.merchant}</span>
                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                            </>
                        )}
                        <span>{gift.category || 'Gift'}</span>
                    </div>
                    
                    <div className="hidden md:flex h-12 px-8 rounded-xl bg-brand-dark text-white font-bold items-center justify-center group-hover:bg-brand-blue transition-all shadow-lg group-hover:shadow-brand-blue/30">
                        Смотреть
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- Dev Mode Components ---

const DevAddGiftModal: React.FC<{ isOpen: boolean; onClose: () => void; onAdd: (g: Partial<Gift>) => void }> = ({ isOpen, onClose, onAdd }) => {
    const [form, setForm] = useState({
        title: '',
        price: '',
        description: '',
        imageUrl: '',
        reason: ''
    });

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            title: form.title || 'Новый товар',
            price: parseInt(form.price) || 0,
            description: form.description,
            imageUrl: form.imageUrl || 'https://placehold.co/400x500/png?text=Mock+Gift',
            reason: form.reason || 'Добавлено вручную разработчиком',
            currency: 'RUB',
            merchant: 'DevMock'
        });
        onClose();
        setForm({ title: '', price: '', description: '', imageUrl: '', reason: '' });
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#1e1e1e] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl text-white" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-green-400">🛠 Add Mock Gift</h3>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        placeholder="Title"
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                        autoFocus
                    />
                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        placeholder="Price (RUB)"
                        type="number"
                        value={form.price}
                        onChange={e => setForm({...form, price: e.target.value})}
                    />
                    
                    {/* Image URL + File Upload */}
                    <div className="flex gap-2">
                        <input 
                            className="flex-grow bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                            placeholder="Image URL"
                            value={form.imageUrl}
                            onChange={e => setForm({...form, imageUrl: e.target.value})}
                        />
                        <label className="flex-shrink-0 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg px-3 py-2 cursor-pointer flex items-center justify-center">
                            <span className="text-xs font-bold">📂</span>
                            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        </label>
                    </div>
                    {form.imageUrl && (
                        <div className="w-full h-20 bg-black/50 rounded-lg overflow-hidden border border-white/5">
                            <img src={form.imageUrl} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                    )}

                    <input 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
                        placeholder="AI Reason (Short)"
                        value={form.reason}
                        onChange={e => setForm({...form, reason: e.target.value})}
                    />
                    <textarea 
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 h-20 resize-none"
                        placeholder="Description"
                        value={form.description}
                        onChange={e => setForm({...form, description: e.target.value})}
                    />
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-bold">Cancel</button>
                        <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded-lg text-sm font-bold text-white">Add Gift</button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
};

// --- Main Component ---

export const Results: React.FC = () => {
  const [response, setResponse] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const { isDevMode } = useDevMode();
  
  // Pagination State - Multiples of 2, 3, 4 (LCM is 12) to avoid gaps
  const [visibleCount, setVisibleCount] = useState(12);
  
  // Dev Mode State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  
  // Modal State
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [wishlistVersion, setWishlistVersion] = useState(0);

  const navigate = useNavigate();

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const stored = localStorage.getItem('gifty_answers');
      if (!stored) {
        navigate('/quiz');
        return;
      }
      
      const parsedAnswers: QuizAnswers = JSON.parse(stored);
      setAnswers(parsedAnswers);
      
      // Use the new generate endpoint which returns full Gift objects
      const recResponse = await api.recommendations.create(parsedAnswers);
      setResponse(recResponse);
      track('results_shown', { count: recResponse.gifts.length });
    } catch (err) {
      console.error(err);
      setError("Не удалось подобрать подарки.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleGiftClick = (gift: Gift) => {
    track('view_gift_details', { id: gift.id });
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedGift(null), 300);
  };

  const handleLoadMore = () => {
      setVisibleCount(prev => prev + 12);
      track('results_load_more');
  };

  // --- Dev Mode Actions ---

  const handleDevDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!response) return;
      
      const newGifts = response.gifts.filter(g => g.id !== id);
      let newFeatured = response.featuredGift;
      
      // If we deleted the featured gift, promote the first from the remaining list
      if (response.featuredGift.id === id) {
          newFeatured = newGifts.length > 0 ? newGifts[0] : null as any;
      }

      setResponse({
          ...response,
          gifts: newGifts,
          featuredGift: newFeatured
      });
  };

  const handleDevAdd = (data: Partial<Gift>) => {
      if (!response) return;
      const newGift: Gift = {
          id: `mock-${Date.now()}`,
          title: data.title || 'No Title',
          description: data.description || null,
          price: data.price || 0,
          currency: 'RUB',
          imageUrl: data.imageUrl || null,
          productUrl: '#',
          merchant: 'Dev',
          category: 'Mock',
          reason: data.reason,
          ...data
      } as Gift;

      setResponse({
          ...response,
          gifts: [newGift, ...response.gifts]
      });
  };

  const handleGiftUpdate = (updatedGift: Gift) => {
      if (!response) return;
      
      setResponse({
          ...response,
          featuredGift: response.featuredGift.id === updatedGift.id ? updatedGift : response.featuredGift,
          gifts: response.gifts.map(g => g.id === updatedGift.id ? updatedGift : g)
      });
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, id: string) => {
      if (!isDevMode) return;
      setDraggedId(id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id); // Firefox hack
  };

  const handleDragOver = (e: React.DragEvent) => {
      if (!isDevMode) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      if (!isDevMode || !response || !draggedId || draggedId === targetId) return;

      const currentFeaturedId = response.featuredGift?.id;
      const isSourceFeatured = draggedId === currentFeaturedId;
      const isTargetFeatured = targetId === currentFeaturedId;

      let newGifts = [...response.gifts];
      let newFeatured = response.featuredGift;

      if (isSourceFeatured && !isTargetFeatured) {
          // Featured -> Grid: Swap
          const targetGift = newGifts.find(g => g.id === targetId);
          if (targetGift) newFeatured = targetGift;
      } else if (!isSourceFeatured && isTargetFeatured) {
          // Grid -> Featured: Swap
          const sourceGift = newGifts.find(g => g.id === draggedId);
          if (sourceGift) newFeatured = sourceGift;
      } else {
          // Grid -> Grid: Reorder
          const fromIndex = newGifts.findIndex(g => g.id === draggedId);
          const toIndex = newGifts.findIndex(g => g.id === targetId);
          if (fromIndex !== -1 && toIndex !== -1) {
              const [item] = newGifts.splice(fromIndex, 1);
              newGifts.splice(toIndex, 0, item);
          }
      }

      setResponse({ ...response, gifts: newGifts, featuredGift: newFeatured });
      setDraggedId(null);
  };

  if (loading) return <LoadingScreen />;

  if (error || !response) {
    return (
       <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-brand-dark text-white relative overflow-hidden">
          {/* Ambience for error screen too */}
          <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]"></div>
          </div>
          
          <div className="relative z-10 animate-pop">
              <Mascot emotion="surprised" accessory="none" className="w-40 h-40 mb-6 drop-shadow-2xl mx-auto" />
              <h2 className="text-2xl font-black mb-2">Возникла непредвиденная ошибка</h2>
              <p className="text-white/60 text-sm max-w-xs mx-auto mb-8 font-medium leading-relaxed">
                  Наши инженеры уже ищут решение. Попробуйте повторить запрос чуть позже.
              </p>
              
              <div className="flex flex-col gap-4 items-center">
                  <Button onClick={fetchResults} className="shadow-lg shadow-brand-blue/30 px-10">
                      Попробовать еще раз
                  </Button>
                  <button onClick={() => navigate('/quiz')} className="text-white/40 hover:text-white text-xs font-bold transition-colors">
                      Вернуться к параметрам
                  </button>
              </div>
          </div>
       </div>
    );
  }

  const featured = response.featuredGift;
  const others = featured ? response.gifts.filter(g => g.id !== featured.id) : response.gifts;
  const visibleOthers = others.slice(0, visibleCount);

  return (
    <div className="min-h-screen pt-24 pb-20 overflow-x-hidden relative">
      
      {/* Background Ambience & Snow */}
      <AmbientSnow />
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] right-[-20%] w-[800px] h-[800px] bg-brand-blue/20 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex justify-between items-end mb-10 animate-fade-in-up">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                        AI Подборка
                    </span>
                    {answers?.name && (
                        <span className="text-white/60 text-sm font-bold">для {inclineName(answers.name, 'genitive')}</span>
                    )}
                </div>
                <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">
                    Идеальные <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">совпадения</span>
                </h1>
            </div>
            
            {/* Debug Button - Only in Dev Mode */}
            {isDevMode && (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setShowDebug(!showDebug)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showDebug ? 'bg-green-500 text-white' : 'bg-white/5 hover:bg-white/10 text-white/50'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </button>
                </div>
            )}
        </div>

        {isDevMode && showDebug && (
            <div className="bg-gray-900 rounded-2xl p-6 mb-8 text-[10px] font-mono text-green-400 border border-gray-800 overflow-hidden shadow-2xl animate-pop w-full">
                <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-4">
                    <div>
                        <p className="font-bold text-lg mb-2">🛠 Debug Console</p>
                        <p>Engine: {response.engineVersion}</p>
                        <p>Run ID: {response.quizRunId}</p>
                    </div>
                    <div className="text-right">
                        <p>Gifts: {response.gifts.length}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Request Payload */}
                    {response.requestPayload && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="font-bold text-blue-300 mb-2 uppercase tracking-widest text-[9px]">📤 Request Payload</p>
                            <pre className="overflow-x-auto whitespace-pre-wrap break-words max-h-60 text-white/70">
                                {JSON.stringify(response.requestPayload, null, 2)}
                            </pre>
                        </div>
                    )}

                    {/* Server Error (if exists) */}
                    {response.serverError && (
                        <div className="bg-red-900/20 p-4 rounded-xl border border-red-500/30">
                            <p className="font-bold text-red-400 mb-2 uppercase tracking-widest text-[9px]">🔥 Server Error</p>
                            <pre className="overflow-x-auto whitespace-pre-wrap break-words max-h-60 text-red-200">
                                {typeof response.serverError === 'string' ? response.serverError : JSON.stringify(response.serverError, null, 2)}
                            </pre>
                        </div>
                    )}
                </div>

                {/* Response Data */}
                <div className="mt-4 bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="font-bold text-green-300 mb-2 uppercase tracking-widest text-[9px]">📥 Response Payload (Partial)</p>
                    <pre className="overflow-x-auto whitespace-pre-wrap break-words max-h-60 text-white/50">
                        {JSON.stringify({ ...response, gifts: `Array(${response.gifts.length})`, featuredGift: 'Object' }, null, 2)}
                    </pre>
                </div>
            </div>
        )}

        <div className="space-y-12">
            {/* Featured Section */}
            {featured && (
                <div 
                    draggable={isDevMode}
                    onDragStart={(e) => handleDragStart(e, featured.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, featured.id)}
                    className={`relative animate-fade-in-up ${draggedId === featured.id ? 'opacity-50 scale-95' : ''}`} 
                    style={{ animationDelay: '0.1s' }}
                >
                    {/* Dev Delete Button for Featured */}
                    {isDevMode && (
                        <button 
                            onClick={(e) => handleDevDelete(e, featured.id)}
                            className="absolute top-4 right-16 z-50 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 transition-transform hover:scale-110"
                            title="Remove item (Dev Mode)"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}

                    <FeaturedCard 
                        gift={featured} 
                        onClick={handleGiftClick} 
                        onToggleWishlist={() => setWishlistVersion(v => v + 1)}
                    />
                </div>
            )}

            {/* Grid Section */}
            <div>
                {/* Separator */}
                <div className="flex items-center gap-4 mb-8 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <div className="h-px bg-white/20 flex-grow rounded-full"></div>
                    <h3 className="text-white/40 font-bold uppercase tracking-[0.2em] text-xs">Другие варианты</h3>
                    <div className="h-px bg-white/20 flex-grow rounded-full"></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {visibleOthers.map((gift, idx) => (
                        <div 
                            key={gift.id} 
                            draggable={isDevMode}
                            onDragStart={(e) => handleDragStart(e, gift.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, gift.id)}
                            className={`relative animate-fade-in-up ${draggedId === gift.id ? 'opacity-50 scale-95' : ''}`} 
                            style={{ animationDelay: `${0.2 + (idx % 12) * 0.05}s` }}
                        >
                            {/* Dev Delete Button for Grid Items */}
                            {isDevMode && (
                                <button 
                                    onClick={(e) => handleDevDelete(e, gift.id)}
                                    className="absolute top-2 left-2 z-50 bg-red-500 hover:bg-red-600 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg border border-white/20 transition-transform hover:scale-110"
                                    title="Remove item"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                            <GiftCard 
                                gift={gift} 
                                onClick={handleGiftClick}
                                onToggleWishlist={() => setWishlistVersion(v => v + 1)}
                            />
                        </div>
                    ))}
                </div>
                
                {/* Load More Button */}
                {visibleCount < others.length && (
                    <div className="flex justify-center mt-12 animate-fade-in-up">
                        <button 
                            onClick={handleLoadMore}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-10 rounded-2xl transition-all active:scale-95 shadow-lg flex items-center gap-2 group text-sm"
                        >
                            <span>Показать больше</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-y-1 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
        
        {/* Footer Action */}
        <div className="mt-16 text-center pb-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-gray-100 shadow-xl inline-block w-full max-w-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
                <div className="relative z-10">
                    <Mascot emotion="happy" className="w-24 h-24 mx-auto mb-4" />
                    <h3 className="text-2xl font-black text-brand-dark mb-2">Не нашли то самое?</h3>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto font-medium">Попробуйте уточнить запрос или изменить параметры поиска.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button variant="secondary" onClick={() => navigate('/quiz')}>
                            Попробовать еще раз
                        </Button>
                        <button 
                            onClick={() => navigate('/')}
                            className="px-8 py-3.5 rounded-2xl font-bold text-gray-500 hover:text-brand-dark hover:bg-gray-100 transition-all border border-gray-200 bg-white"
                        >
                            На главную
                        </button>
                    </div>
                </div>
            </div>
        </div>

        {selectedGift && (
            <GiftDetailsModal 
            gift={selectedGift} 
            isOpen={isModalOpen} 
            onClose={handleCloseModal}
            answers={answers}
            onWishlistChange={() => setWishlistVersion(v => v + 1)}
            onUpdate={handleGiftUpdate}
            />
        )}

        {/* Dev Mode Add Button */}
        {isDevMode && (
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="fixed bottom-24 right-6 z-[60] bg-green-500 hover:bg-green-400 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 border-4 border-white/20 animate-pop"
                title="Add Mock Gift"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                </svg>
            </button>
        )}

        {/* Dev Mode Modal */}
        {isDevMode && (
            <DevAddGiftModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onAdd={handleDevAdd} 
            />
        )}

      </div>
      
      <style>{`
        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0; 
        }
      `}</style>
    </div>
  );
};