
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Logo } from '../components/Logo';
import { api } from '../api';
import { Gift } from '../domain/types';
import { analytics } from '../utils/analytics';
import { useAuth } from '../components/AuthContext';
import { ShootingStars } from '../components/ui/shooting-stars';
import { StarsBackground } from '../components/ui/stars-background';

// --- Icons ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-brand-main" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BoltIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const SparklesIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
const PaletteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.343 1.414 1.414-1.657 1.343m0 2.657l1.657 1.343 1.414-1.414-1.657-1.343" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;

// --- Decorative Components (Cyber Celebration) ---

const MagicSearchBar: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div className="w-full max-w-2xl mx-auto px-4 mb-10 relative z-20">
      <div 
        onClick={onClick}
        className="relative bg-white rounded-full p-2 pl-6 pr-2 flex items-center gap-4 shadow-[0_10px_30px_rgba(0,0,0,0.05)] cursor-pointer group hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] transition-all ring-1 ring-gray-100 hover:ring-brand-main/30"
      >
          {/* Badge */}
          <div className="absolute -top-3 right-8 bg-brand-main text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-lg uppercase tracking-widest transform rotate-3 border border-white/20">
              AI Powered
          </div>

          <div className="flex-grow flex flex-col justify-center h-full">
              <span className="text-brand-main/60 text-xs font-bold uppercase tracking-widest mb-0.5 group-hover:text-brand-main transition-colors">
                  Спроси Gifty...
              </span>
              <span className="text-brand-dark text-lg font-bold truncate">
                  "Подарок для фаната технологий"
              </span>
          </div>

          {/* Right Button */}
          <div className="w-12 h-12 bg-brand-main text-brand-dark rounded-full flex items-center justify-center shadow-[0_5px_15px_rgba(249,217,73,0.3)] group-hover:scale-110 transition-transform">
              <SearchIcon />
          </div>
      </div>
  </div>
);

const CategoryPills: React.FC<{ onSelect: (tag: string) => void }> = ({ onSelect }) => {
  // Fresh Nature Palette
  const categories = [
    { id: 'tech', label: 'ГАДЖЕТЫ', icon: <BoltIcon />, color: 'text-yellow-600 border-yellow-100 bg-yellow-50 hover:bg-yellow-100' },
    { id: 'home', label: 'ЭСТЕТИКА', icon: <SparklesIcon />, color: 'text-green-600 border-green-100 bg-green-50 hover:bg-green-100' },
    { id: 'art', label: 'ТВОРЧЕСТВО', icon: <PaletteIcon />, color: 'text-blue-600 border-blue-100 bg-blue-50 hover:bg-blue-100' },
    { id: 'sport', label: 'WELLNESS', icon: <HeartIcon />, color: 'text-teal-600 border-teal-100 bg-teal-50 hover:bg-teal-100' },
    { id: 'fun', label: 'ФАН', icon: <GiftIcon />, color: 'text-sky-600 border-sky-100 bg-sky-50 hover:bg-sky-100' },
  ];

  return (
    <div className="flex overflow-x-auto no-scrollbar justify-start md:justify-center gap-3 px-6 pb-6 mb-2 snap-x">
      {categories.map((cat, i) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.label)}
          className={`shrink-0 px-5 py-3 rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest transition-all border ${cat.color} hover:scale-105 active:scale-95 snap-start shadow-sm flex items-center gap-2`}
        >
          {cat.icon}
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
  
  if (gifts.length === 0) return null;

  return (
    <div id={id} className="mb-24 relative z-10 scroll-mt-32 group/section">
      <div className="px-6 mb-8 flex items-end justify-between">
         <div>
             <h2 className="text-2xl md:text-3xl font-black text-brand-dark leading-tight tracking-tight mb-2">
                {title}
             </h2>
             {subtitle && <p className="text-brand-dark/50 text-sm font-medium">{subtitle}</p>}
         </div>
         <div className="hidden md:flex gap-2">
             <button onClick={() => scrollRef.current?.scrollBy({left: -300, behavior: 'smooth'})} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">←</button>
             <button onClick={() => scrollRef.current?.scrollBy({left: 300, behavior: 'smooth'})} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">→</button>
         </div>
      </div>
      
      <div className="relative w-full overflow-visible">
         <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar pb-10 px-6 snap-x snap-mandatory"
         >
            {gifts.map((gift, index) => (
              <div 
                key={`${gift.id}-${index}`} 
                className="w-[200px] md:w-[240px] shrink-0 transform-gpu transition-all duration-500 hover:-translate-y-2 snap-start"
              >
                 <GiftCard gift={gift} onClick={onGiftClick} rank={index} />
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
  const [aestheticGifts, setAestheticGifts] = useState<Gift[]>([]);
  
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [feed, aes] = await Promise.all([
          api.gifts.list({ limit: 12 }), 
          api.gifts.list({ limit: 8, tag: 'эстетика' }),
        ]);
        setFeedGifts(feed);
        setAestheticGifts(aes);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, []);

  const startQuiz = (entryPoint: string) => {
    analytics.quizStarted(entryPoint);
    navigate('/quiz');
  };

  const openGift = (gift: Gift) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden pb-12 bg-brand-surface">
      
      {/* --- DECORATIVE BACKGROUND (FRESH EDITION) --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,217,73,0.05)_0%,rgba(251,251,251,0)_60%)]" />
        
        {/* Twinkling Small Stars (Subtle for light mode) */}
        <StarsBackground 
            starDensity={0.0001} 
            allStarsTwinkle={true} 
            twinkleProbability={0.5} 
            minTwinkleSpeed={0.5} 
            maxTwinkleSpeed={1.5}
            className="opacity-20"
            starColor="#F9D949"
        />

        {/* Layer 1: Soft Yellow/Green */}
        <ShootingStars
          starColor="#F9D949"
          trailColor="#86C8BC"
          minSpeed={15}
          maxSpeed={30}
          minDelay={1200}
          maxDelay={3000}
        />
      </div>
      
      {/* Header */}
      <div className="fixed top-6 left-6 z-50">
          <div className="bg-white/80 backdrop-blur-md rounded-full px-5 py-2 hover:scale-105 transition-transform cursor-pointer shadow-[0_5px_15px_rgba(0,0,0,0.05)] border border-gray-100">
            <Logo onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} />
          </div>
      </div>
      <div className="fixed top-6 right-6 z-50">
         {user ? (
             <Link to="/profile" className="bg-white/80 backdrop-blur-md px-5 py-2 rounded-full text-brand-dark font-bold text-xs uppercase tracking-wider hover:bg-white transition-colors border border-gray-100 shadow-sm">Профиль</Link>
         ) : (
             <Link to="/login" className="bg-brand-main text-brand-dark px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-wider shadow-[0_5px_15px_rgba(249,217,73,0.3)] hover:scale-105 transition-transform">Войти</Link>
         )}
      </div>

      <div className="max-w-7xl mx-auto relative pt-40 z-10">
        
        {/* HERO SECTION */}
        <div className="text-center mb-16 px-4">
            <div className="relative inline-block mb-6">
                <Mascot 
                    className="w-32 h-32 md:w-48 md:h-48 mx-auto drop-shadow-[0_10px_30px_rgba(249,217,73,0.2)] transition-all duration-500 hover:scale-105" 
                    eyesX={0} 
                    eyesY={0} 
                    variant="default"
                    accessory="none"
                    emotion="happy" 
                />
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black text-brand-dark mb-6 leading-[0.9] tracking-tighter">
                AI THAT KNOWS <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-main via-brand-accent to-brand-main animate-gradient-x">THE PERFECT GIFT.</span>
            </h1>
            
            <p className="text-brand-dark/60 text-sm md:text-lg max-w-md mx-auto mb-10 font-medium leading-relaxed tracking-wide">
                Технологии встречаются с щедростью. <br/>
                Найди то, что вызовет настоящий восторг.
            </p>
            
            <MagicSearchBar onClick={() => startQuiz('home_hero_search')} />
            <CategoryPills onSelect={() => startQuiz('home_hero_pills')} />
        </div>

        {/* CONTENT SECTIONS */}
        <HorizontalSection 
            title={<span>Smart Selection <span className="text-brand-main">.01</span></span>} 
            subtitle="Подарки, подобранные алгоритмом" 
            gifts={aestheticGifts} 
            onGiftClick={openGift} 
        />

        <div className="px-6 mt-12 pb-24 relative z-10">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-brand-dark tracking-tight">Trending Now</h2>
                <div className="text-[10px] font-bold uppercase tracking-widest text-brand-main border border-brand-main/20 px-3 py-1 rounded-full shadow-sm bg-brand-main/5">New Drop</div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Promo Card */}
                <div onClick={() => startQuiz('home_promo_card')} className="col-span-2 relative overflow-hidden rounded-[2.5rem] p-8 min-h-[340px] bg-gradient-to-br from-brand-main/10 via-white to-brand-surface cursor-pointer group border border-gray-100 flex flex-col justify-center items-center text-center shadow-xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-main/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                    
                    <div className="relative z-20">
                        <div className="text-7xl mb-4 group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_5px_15px_rgba(0,0,0,0.1)]">🔮</div>
                        <h3 className="text-brand-dark font-black text-4xl leading-[0.9] mb-4 tracking-tighter">Magic <br/>Match</h3>
                        <p className="text-brand-dark/40 font-bold text-sm mb-8 uppercase tracking-widest">Пройди тест на совместимость</p>
                        <button className="bg-brand-main text-brand-dark px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_10px_25px_rgba(249,217,73,0.3)]">
                            Start
                        </button>
                    </div>
                </div>
                {/* Gift Grid */}
                {feedGifts.map((g, i) => <GiftCard key={g.id} gift={g} onClick={openGift} rank={i} />)}
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
