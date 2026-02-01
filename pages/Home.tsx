import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Logo } from '../components/Logo';
import { api } from '../api';
import { Gift } from '../domain/types';
import { track } from '../utils/analytics';
import { useAuth } from '../components/AuthContext';

// --- Decorative Components ---

const ValentineGarland: React.FC = React.memo(() => (
  <div className="fixed top-0 left-0 right-0 h-16 z-40 pointer-events-none flex justify-around overflow-visible">
     <div className="absolute top-[-20px] left-[-5%] right-[-5%] h-12 border-b-2 border-white/40 rounded-[100%]"></div>
     {Array.from({ length: 8 }).map((_, i) => (
         <div 
           key={i} 
           className="relative mt-2 animate-swing origin-top"
           style={{ animationDelay: `${i * 0.3}s`, animationDuration: '4s' }}
         >
            <div className="w-0.5 h-6 bg-white/40 mx-auto"></div>
            {i % 2 === 0 ? (
               // Envelope
               <div className="w-8 h-6 bg-white rounded-sm shadow-md flex items-center justify-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full border-2 border-red-200"></div>
                  <div className="text-[10px]">💌</div>
               </div>
            ) : (
               // Heart
               <div className="w-8 h-8 flex items-center justify-center drop-shadow-md">
                  <svg viewBox="0 0 32 32" className="w-full h-full fill-brand-pink stroke-white stroke-2">
                     <path d="M16 28 C16 28 3 18 3 10 A7 7 0 0 1 17 6 A7 7 0 0 1 31 10 C31 18 16 28 16 28 Z" />
                  </svg>
               </div>
            )}
         </div>
     ))}
  </div>
));

const FloatingHearts: React.FC = React.memo(() => {
  const hearts = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 10 + Math.random() * 10,
    size: 20 + Math.random() * 40
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
       {hearts.map((heart) => (
          <div 
            key={heart.id}
            className="absolute text-brand-pink/20 animate-hearts"
            style={{
                left: `${heart.left}%`,
                animationDelay: `${heart.delay}s`,
                animationDuration: `${heart.duration}s`,
                fontSize: `${heart.size}px`
            }}
          >
             ♥
          </div>
       ))}
       <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-rose-500/20 rounded-full blur-[140px] mix-blend-screen animate-pulse-slow"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] bg-pink-500/20 rounded-full blur-[140px] mix-blend-screen animate-pulse-slow" style={{animationDelay: '2s'}}></div>
    </div>
  );
});

const CupidSearchBar: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="w-full max-w-2xl mx-auto px-4 mb-10 relative z-20">
      {/* Container */}
      <div 
        onClick={onClick}
        className="relative bg-white/20 backdrop-blur-xl border border-white/40 rounded-full p-2 pl-4 pr-2 flex items-center gap-4 shadow-[0_8px_32px_rgba(190,24,93,0.2)] cursor-pointer group hover:bg-white/30 transition-all ring-4 ring-white/10"
      >
          {/* Badge */}
          <div className="absolute -top-3 left-14 bg-white text-brand-pink text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-widest border border-brand-pink/20 transform -rotate-2">
              AI-КУПИДОН
          </div>

          {/* Left Icon (Cupid Bow) */}
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shrink-0 shadow-md text-brand-pink text-2xl group-hover:scale-110 transition-transform">
              🏹
          </div>

          {/* Text Area */}
          <div className="flex-grow flex flex-col justify-center h-full">
              <span className="text-white text-lg font-bold drop-shadow-sm placeholder-white/70">
                  Что подарить любимой?!
              </span>
          </div>

          {/* Right Button (Search) */}
          <div className="w-12 h-12 bg-brand-pink text-white rounded-full flex items-center justify-center shadow-lg group-hover:bg-brand-love transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
          </div>
      </div>
  </div>
);

const CategoryPills: React.FC<{ onSelect: (tag: string) => void }> = ({ onSelect }) => {
  const categories = [
    { id: '14feb', label: '💘 14 февраля', active: true },
    { id: 'date', label: '🔥 Свидание', active: false },
    { id: 'her', label: '👩 Для неё', active: false },
    { id: 'him', label: '👨 Для него', active: false },
    { id: 'romance', label: '🌹 Романтика', active: false },
    { id: 'cute', label: '🧸 Милота', active: false },
    { id: 'passion', label: '🔞 Страсть', active: false },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-3 px-4 pb-4 mb-4">
      {categories.map((cat, i) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.label)}
          className={`px-5 py-2.5 rounded-2xl font-bold text-sm whitespace-nowrap transition-all shadow-sm backdrop-blur-md border ${
              cat.active 
              ? 'bg-brand-pink text-white border-brand-pink hover:bg-brand-love transform scale-105 shadow-brand-pink/40' 
              : 'bg-white/20 text-white border-white/30 hover:bg-white/40'
          }`}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
};

const HorizontalSection: React.FC<{ 
  title: React.ReactNode; 
  subtitle?: string; 
  gifts: Gift[]; 
  onGiftClick: (g: Gift) => void;
  id?: string;
}> = ({ title, subtitle, gifts, onGiftClick, id }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const loopedGifts = [...gifts, ...gifts];

  if (gifts.length === 0) return null;

  return (
    <div id={id} className="mb-20 relative z-10 scroll-mt-32 group/section">
      <div className="px-6 mb-6">
         <h2 className="text-3xl font-black text-white leading-tight tracking-tight mb-1 flex items-center gap-2">
            {title}
         </h2>
         {subtitle && <p className="text-white/70 text-sm font-medium">{subtitle}</p>}
      </div>
      
      <div className="relative w-full overflow-visible">
         <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-10 px-6 snap-x snap-mandatory"
         >
            {loopedGifts.map((gift, index) => (
              <div 
                key={`${gift.id}-${index}`} 
                className="w-[180px] md:w-[220px] shrink-0 transform-gpu transition-all duration-500 hover:scale-[1.02] snap-start"
              >
                 <GiftCard gift={gift} onClick={onGiftClick} />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [feedGifts, setFeedGifts] = useState<Gift[]>([]);
  const [romanticGifts, setRomanticGifts] = useState<Gift[]>([]);
  
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feed, rom] = await Promise.all([
          api.gifts.list({ limit: 12 }), 
          api.gifts.list({ limit: 8, tag: 'уют' }),
        ]);
        setFeedGifts(feed);
        setRomanticGifts(rom);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const openGift = (gift: Gift) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-12">
      <FloatingHearts />
      <ValentineGarland />
      
      {/* Header */}
      <div className="fixed top-6 left-6 z-50">
          <div className="bg-white/95 backdrop-blur-xl border border-white/50 rounded-2xl px-4 py-2 shadow-md hover:scale-105 transition-transform cursor-pointer">
            <Logo onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} />
          </div>
      </div>
      <div className="fixed top-6 right-6 z-50">
         {user ? (
             <Link to="/profile" className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-full text-white font-bold text-sm hover:bg-white/30 transition-colors">Профиль</Link>
         ) : (
             <Link to="/login" className="bg-white text-brand-pink px-5 py-2.5 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform">Войти</Link>
         )}
      </div>

      <div className="max-w-7xl mx-auto relative pt-32">
        
        {/* HERO SECTION */}
        <div className="text-center mb-10 px-4">
            <div className="relative inline-block">
                <Mascot 
                    className="w-40 h-40 mx-auto mb-4 drop-shadow-2xl" 
                    eyesX={0} 
                    eyesY={0} 
                    variant="cupid" 
                    emotion="happy" 
                />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-white mb-4 leading-[0.9] tracking-[-0.03em] drop-shadow-sm">
                Дарите <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-pink-100">любовь</span>
            </h1>
            
            <p className="text-white/80 text-base md:text-lg max-w-md mx-auto mb-10 font-medium leading-relaxed">
                Твой персональный AI-Купидон.<br/>
                Найдет путь к сердцу за 30 секунд.
            </p>
            
            <CupidSearchBar onClick={() => navigate('/quiz')} />
            <CategoryPills onSelect={() => navigate('/quiz')} />
        </div>

        {/* CONTENT SECTIONS */}
        <HorizontalSection 
            title={<span>Чистая романтика 🌹</span>} 
            subtitle="Для самых нежных чувств" 
            gifts={romanticGifts} 
            onGiftClick={openGift} 
        />

        <div className="px-6 mt-12 pb-24">
            <h2 className="text-3xl font-black text-white tracking-tight mb-8">Вдохновение для свиданий</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Promo Card */}
                <div onClick={() => navigate('/quiz')} className="col-span-2 relative overflow-hidden rounded-[2.5rem] p-8 min-h-[300px] bg-white cursor-pointer group shadow-2xl flex flex-col justify-center items-center text-center border-4 border-white/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-pink to-brand-love opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative z-20">
                        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-500">🔮</div>
                        <h3 className="text-brand-dark font-black text-3xl leading-tight mb-2">Не знаешь что подарить?</h3>
                        <p className="text-gray-500 font-bold text-sm mb-6">Пройди тест на совместимость подарка</p>
                        <button className="bg-brand-pink text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-pink/30 group-hover:shadow-brand-pink/50 transition-all">
                            Начать тест
                        </button>
                    </div>
                </div>
                {/* Gift Grid */}
                {feedGifts.map(g => <GiftCard key={g.id} gift={g} onClick={openGift} />)}
            </div>
        </div>
      </div>

      {selectedGift && (
          <GiftDetailsModal 
            gift={selectedGift} 
            answers={null} 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onWishlistChange={() => {}} 
          />
      )}
    </div>
  );
};