
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Gift, QuizAnswers, RecommendationSession } from '../domain/types';
import { api } from '../api';

// --- COMPONENTS ---

const TypingIndicator = () => (
    <div className="flex gap-1.5 p-2 px-4">
        <div className="w-2 h-2 bg-brand-pink/50 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-2 h-2 bg-brand-pink/50 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-2 h-2 bg-brand-pink/50 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
    </div>
);

const ChatBubble: React.FC<{ children: React.ReactNode; isTyping?: boolean }> = ({ children, isTyping }) => (
    <div className="relative bg-white/90 backdrop-blur-xl text-brand-dark rounded-2xl rounded-tl-none p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-w-xl animate-pop border border-white/50">
        <div className="absolute top-0 left-[-8px] w-4 h-4 bg-white/90 transform skew-x-[20deg]"></div>
        <div className="relative z-10 text-lg font-bold leading-snug">
            {isTyping ? <TypingIndicator /> : children}
        </div>
    </div>
);

export const Results: React.FC = () => {
    const navigate = useNavigate();
    
    // Core Session State
    const [session, setSession] = useState<RecommendationSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // UI State for Feed
    const [viewGift, setViewGift] = useState<Gift | null>(null);

    // Initial Load: Create Session
    useEffect(() => {
        const initSession = async () => {
            const stored = localStorage.getItem('gifty_answers');
            if (!stored) {
                navigate('/quiz');
                return;
            }
            
            try {
                const answers: QuizAnswers = JSON.parse(stored);
                // Call GUTG API
                const newSession = await api.gutg.init(answers);
                setSession(newSession);
            } catch (e) {
                console.error("GUTG Init Failed", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        initSession();
    }, [navigate]);

    // Action Handlers
    const handleAnswerProbe = async (value: string) => {
        if (!session) return;
        setLoading(true);
        try {
            const updated = await api.gutg.interact(session.session_id, 'answer_probe', value);
            setSession(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLikeHypothesis = async (id: string) => {
        if (!session) return;
        setLoading(true); // UI transition
        try {
            const updated = await api.gutg.interact(session.session_id, 'like_hypothesis', id);
            setSession(updated);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDislikeHypothesis = async (id: string) => {
        if (!session) return;
        // Optimistic UI update: Remove card locally while waiting
        if (session.current_hypotheses) {
            setSession(prev => prev ? ({
                ...prev,
                current_hypotheses: prev.current_hypotheses?.filter(h => h.id !== id)
            }) : null);
        }

        try {
            const updated = await api.gutg.interact(session.session_id, 'dislike_hypothesis', id);
            setSession(updated);
        } catch (e) {
            console.error(e);
        }
    };

    // --- RENDERERS ---

    const renderBranching = () => {
        const probe = session?.current_probe;
        if (!probe) return null;

        return (
            <div className="w-full max-w-2xl animate-fade-in-up">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                    {probe.options.map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => handleAnswerProbe(opt.label)} // Sending label text as value
                            className="bg-white/80 hover:bg-white border border-white/40 p-4 rounded-2xl text-left transition-all group flex items-center gap-3 shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <span className="text-3xl group-hover:scale-110 transition-transform filter drop-shadow-sm">{opt.icon || '👉'}</span>
                            <div>
                                <div className="font-bold text-brand-dark text-sm">{opt.label}</div>
                                {opt.description && <div className="text-[10px] text-gray-500 font-medium">{opt.description}</div>}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const renderHypotheses = () => {
        const hypotheses = session?.current_hypotheses || [];
        if (hypotheses.length === 0) return null;

        return (
            <div className="w-full max-w-xl animate-fade-in-up space-y-6">
                {hypotheses.map(h => (
                    <div key={h.id} className="bg-white/90 backdrop-blur-md border border-white/50 rounded-[2.5rem] overflow-hidden shadow-xl animate-pop group transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-8 pb-4">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-sm ${
                                    h.gutgType === 'Mirror' ? 'bg-purple-400' : 
                                    h.gutgType === 'Optimizer' ? 'bg-blue-400' : 
                                    h.gutgType === 'Catalyst' ? 'bg-orange-400' : 'bg-green-400'
                                }`}>
                                    {h.gutgType}
                                </span>
                            </div>
                            <h3 className="text-2xl font-black text-brand-dark mb-2 leading-tight">{h.title}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed font-medium">{h.description}</p>
                        </div>

                        {/* Preview Strip */}
                        {h.previewGifts.length > 0 && (
                            <div className="px-8 pb-6 flex gap-3 overflow-hidden">
                                {h.previewGifts.slice(0, 3).map((gift, i) => (
                                    <div key={i} className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden relative border border-white/50 shadow-inner group/img">
                                        <img 
                                            src={gift.imageUrl || `https://placehold.co/150x150/FFF/000?text=${i}`} 
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" 
                                            alt="" 
                                        />
                                    </div>
                                ))}
                                <div className="w-20 h-20 rounded-2xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink font-bold text-xs">
                                    + еще
                                </div>
                            </div>
                        )}
                        
                        <div className="p-8 pt-0 flex gap-3">
                            <button 
                                onClick={() => handleLikeHypothesis(h.id)} 
                                className="flex-1 py-4 bg-brand-dark text-white font-bold rounded-2xl hover:bg-brand-blue transition-all shadow-lg flex items-center justify-center gap-2 group/btn"
                            >
                                <span className="group-hover/btn:scale-125 transition-transform">🎯</span> 
                                Смотреть товары
                            </button>
                            <button 
                                onClick={() => handleDislikeHypothesis(h.id)}
                                className="px-5 py-4 bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderDeadEnd = () => (
        <div className="w-full max-w-md text-center animate-fade-in bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl">
            <h2 className="text-2xl font-black text-brand-dark mb-3">Хм, я зашел в тупик 🛑</h2>
            <p className="text-gray-600 mb-8 font-medium">Мои идеи в этом направлении кончились. Попробуем сменить тему?</p>
            <div className="space-y-3">
                <button onClick={() => handleAnswerProbe('Сменить тему')} className="w-full p-4 bg-brand-blue text-white rounded-2xl font-bold shadow-lg hover:bg-brand-love transition-all">
                    🔄 Начать сначала
                </button>
            </div>
        </div>
    );

    const renderFeed = () => {
        const gifts = session?.deep_dive_products || [];
        return (
            <div className="w-full animate-fade-in-up">
                <button 
                    onClick={() => navigate('/quiz')}
                    className="mb-6 bg-white/50 hover:bg-white text-brand-dark px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-sm"
                >
                    ← Назад к параметрам
                </button>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
                    {gifts.map((g, i) => (
                        <GiftCard key={g.id} gift={g} onClick={setViewGift} rank={i} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden flex flex-col font-sans">
            
            {/* Background (Glass Effect) */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                 {/* No solid bg color, letting index.html gradient shine through */}
                 <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-white/10 to-transparent"></div>
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <button onClick={() => navigate('/quiz')} className="pointer-events-auto bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/20 transition-all shadow-sm text-brand-dark">
                    ← Квиз
                </button>
                <button onClick={() => navigate('/')} className="pointer-events-auto bg-white/80 hover:bg-white backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/20 transition-all shadow-sm text-brand-dark">
                    Домой
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center pt-24 pb-20 px-4 max-w-4xl mx-auto w-full">
                
                {/* --- CONVERSATION HEADER --- */}
                <div className="mb-8 w-full max-w-2xl flex items-end gap-4 min-h-[100px]">
                    <div className="mb-1 relative shrink-0">
                        <Mascot 
                            emotion={session?.state === 'DEAD_END' ? 'surprised' : session?.state === 'DEEP_DIVE' ? 'happy' : 'thinking'} 
                            className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl filter" 
                            accessory="none"
                            variant="cupid" // Pink!
                        />
                    </div>
                    
                    <ChatBubble isTyping={loading}>
                        {loading ? '...' : (
                            <>
                                {error && <p>Упс, мои нейроны запутались. Попробуй обновить страницу.</p>}
                                {session?.state === 'BRANCHING' && session.current_probe && (
                                    <>
                                        <p>{session.current_probe.question}</p>
                                        {session.current_probe.subtitle && <p className="text-sm text-gray-500 mt-1 font-bold opacity-70">{session.current_probe.subtitle}</p>}
                                    </>
                                )}
                                {session?.state === 'SHOWING_HYPOTHESES' && (
                                    <p>Я проанализировал данные. Вот стратегии, которые сработают лучше всего:</p>
                                )}
                                {session?.state === 'DEEP_DIVE' && (
                                    <p>Отлично! Вот подборка товаров для этой стратегии.</p>
                                )}
                                {session?.state === 'DEAD_END' && (
                                    <p>Похоже, мы перебрали все варианты в этой ветке.</p>
                                )}
                            </>
                        )}
                    </ChatBubble>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="w-full flex-grow flex flex-col items-center transition-opacity duration-300">
                    {!loading && !error && (
                        <>
                            {session?.state === 'BRANCHING' && renderBranching()}
                            {session?.state === 'SHOWING_HYPOTHESES' && renderHypotheses()}
                            {session?.state === 'DEEP_DIVE' && renderFeed()}
                            {session?.state === 'DEAD_END' && renderDeadEnd()}
                        </>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {viewGift && (
                <GiftDetailsModal 
                    gift={viewGift} 
                    isOpen={!!viewGift} 
                    onClose={() => setViewGift(null)} 
                    answers={null} 
                    onWishlistChange={() => {}} 
                />
            )}
        </div>
    );
};
