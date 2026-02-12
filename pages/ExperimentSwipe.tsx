import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Gift } from '../domain/types';
import { GiftCard } from '../components/GiftCard';

export const ExperimentSwipe: React.FC = () => {
    const navigate = useNavigate();
    const [cards, setCards] = useState<Gift[]>([]);
    const [liked, setLiked] = useState<Gift[]>([]);
    const [loading, setLoading] = useState(true);
    const [animation, setAnimation] = useState<'none' | 'left' | 'right'>('none');

    useEffect(() => {
        const load = async () => {
            try {
                // Fetch a mix of gifts
                const data = await api.gifts.list({ limit: 20 });
                setCards(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleSwipe = (direction: 'left' | 'right') => {
        if (cards.length === 0) return;
        
        setAnimation(direction);
        const currentCard = cards[0];

        setTimeout(() => {
            if (direction === 'right') {
                setLiked([...liked, currentCard]);
            }
            setCards(prev => prev.slice(1));
            setAnimation('none');
        }, 300);
    };

    // Keyboard support
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') handleSwipe('left');
            if (e.key === 'ArrowRight') handleSwipe('right');
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [cards]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
                <div className="animate-pulse">Loading Deck...</div>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold mb-2">That's a wrap!</h2>
                <p className="text-slate-400 mb-8">You liked {liked.length} items.</p>
                <div className="flex gap-4">
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        Restart
                    </button>
                    <button 
                        onClick={() => navigate('/experiments')}
                        className="px-6 py-3 rounded-full bg-purple-600 hover:bg-purple-500 transition-colors"
                    >
                        Back to Lab
                    </button>
                </div>
            </div>
        );
    }

    const activeCard = cards[0];
    const nextCard = cards[1];

    return (
        <div className="min-h-screen bg-slate-900 overflow-hidden flex flex-col relative">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-slate-900/80 to-transparent">
                <button 
                    onClick={() => navigate('/experiments')}
                    className="text-white/50 hover:text-white text-sm font-mono flex items-center gap-1"
                >
                    ← Back to Lab
                </button>
                <div className="text-purple-400 font-bold tracking-widest text-xs uppercase">Mode: Swipe</div>
            </div>

            {/* Card Stack */}
            <div className="flex-grow flex items-center justify-center relative p-6">
                
                {/* Background Card (Next) */}
                {nextCard && (
                    <div className="absolute w-full max-w-sm aspect-[3/4] bg-white rounded-[2rem] scale-95 opacity-50 translate-y-4 pointer-events-none">
                       {/* Placeholder visual */}
                       <div className="w-full h-full bg-gray-200 rounded-[2rem]"></div>
                    </div>
                )}

                {/* Active Card */}
                <div 
                    className={`w-full max-w-sm relative z-10 transition-all duration-300 ease-out transform ${
                        animation === 'left' ? '-translate-x-[150%] rotate-[-20deg] opacity-0' : 
                        animation === 'right' ? 'translate-x-[150%] rotate-[20deg] opacity-0' : 
                        'translate-x-0 rotate-0 opacity-100'
                    }`}
                >
                    <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden aspect-[3/4] relative group select-none">
                        <img 
                            src={activeCard.imageUrl || ''} 
                            alt={activeCard.title}
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                        
                        <div className="absolute bottom-0 left-0 right-0 p-8 text-white pointer-events-none">
                            <div className="flex justify-between items-end mb-2">
                                <h2 className="text-3xl font-black leading-tight drop-shadow-md">{activeCard.title}</h2>
                                <span className="text-2xl font-bold bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg">
                                    {activeCard.price}₽
                                </span>
                            </div>
                            <p className="text-white/80 line-clamp-2 text-sm">{activeCard.reason || activeCard.description}</p>
                        </div>

                        {/* Overlays */}
                        <div className={`absolute top-8 right-8 border-4 border-green-500 rounded-lg px-4 py-1 text-green-500 font-black text-4xl uppercase tracking-widest transform rotate-12 transition-opacity duration-200 ${animation === 'right' || animation === 'none' ? 'opacity-0' : 'opacity-0'}`}>
                            LIKE
                        </div>
                        <div className={`absolute top-8 left-8 border-4 border-red-500 rounded-lg px-4 py-1 text-red-500 font-black text-4xl uppercase tracking-widest transform -rotate-12 transition-opacity duration-200 ${animation === 'left' || animation === 'none' ? 'opacity-0' : 'opacity-0'}`}>
                            NOPE
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="pb-10 pt-4 flex justify-center items-center gap-8 z-50">
                <button 
                    onClick={() => handleSwipe('left')}
                    className="w-16 h-16 rounded-full bg-slate-800 text-red-500 flex items-center justify-center text-3xl shadow-lg border border-red-500/20 hover:scale-110 hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                    ✕
                </button>
                <div className="text-white/30 text-xs font-mono uppercase tracking-widest">
                    Swipe or Use Arrows
                </div>
                <button 
                    onClick={() => handleSwipe('right')}
                    className="w-16 h-16 rounded-full bg-slate-800 text-green-500 flex items-center justify-center text-3xl shadow-lg border border-green-500/20 hover:scale-110 hover:bg-green-500 hover:text-white transition-all active:scale-95"
                >
                    ♥
                </button>
            </div>
        </div>
    );
};