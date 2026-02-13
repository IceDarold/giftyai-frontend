
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Gift, QuizAnswers, RecommendationSession, RecommendationTrack, DialogueHypothesis } from '../domain/types';
import { api, setGlobalLogger } from '../api';
import { useDevMode } from '../components/DevModeContext';
import { MockServer } from '../api/mock/server';

// --- SUB-COMPONENTS ---

const VisionCard: React.FC<{ 
    data: DialogueHypothesis; 
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
    index: number;
    isActive: boolean;
}> = ({ data, onLike, onDislike, index, isActive }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [reaction, setReaction] = useState<'none' | 'liked' | 'disliked'>('none');
    const [viewGift, setViewGift] = useState<Gift | null>(null);

    const handleToggleExpand = (e: React.MouseEvent) => {
        // Don't expand if clicking on reaction buttons
        if ((e.target as HTMLElement).closest('button')) return;
        setIsExpanded(!isExpanded);
    };

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newState = reaction === 'liked' ? 'none' : 'liked';
        setReaction(newState);
        onLike(data.id);
    };

    const badgeColors: Record<string, string> = {
        'the_mirror': 'from-purple-500 to-indigo-600',
        'the_optimizer': 'from-blue-500 to-cyan-600',
        'the_catalyst': 'from-orange-500 to-amber-600',
        'the_anchor': 'from-emerald-500 to-teal-600'
    };

    if (reaction === 'disliked') return null;

    return (
        <div 
            className={`shrink-0 w-[85vw] md:w-[600px] snap-center transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                isActive ? 'scale-100 opacity-100' : 'scale-90 opacity-40 blur-sm'
            }`}
        >
            <div 
                onClick={handleToggleExpand}
                className={`relative bg-white/5 backdrop-blur-3xl rounded-[3rem] border-2 transition-all duration-500 overflow-hidden shadow-2xl ${
                    isExpanded ? 'ring-4 ring-white/20 border-white/20' : 'border-white/10'
                }`}
            >
                {/* Image Stack Preview (Hidden when expanded) */}
                {!isExpanded && (
                    <div className="relative h-64 md:h-80 flex items-center justify-center p-6 overflow-hidden">
                         <div className={`absolute inset-0 bg-gradient-to-br ${badgeColors[data.primary_gap] || 'from-gray-500'} opacity-10`}></div>
                        {data.preview_products.slice(0, 3).map((gift, i) => (
                            <div 
                                key={gift.id} 
                                className="absolute transition-all duration-1000 ease-out shadow-2xl"
                                style={{
                                    width: '160px',
                                    height: '210px',
                                    left: `${50 + (i - 1) * 22}%`,
                                    transform: `translate(-50%, -10%) rotate(${(i - 1) * 12}deg) scale(${i === 1 ? 1.1 : 0.9})`,
                                    zIndex: i === 1 ? 10 : 5,
                                }}
                            >
                                <img src={gift.imageUrl || ''} className="w-full h-full object-cover rounded-2xl border-2 border-white/10" alt="" />
                            </div>
                        ))}
                    </div>
                )}

                {/* Content Overlay */}
                <div className={`p-8 md:p-12 transition-all duration-500 ${isExpanded ? 'bg-black/40' : ''}`}>
                    <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${badgeColors[data.primary_gap]}`}>
                            {data.primary_gap.replace('the_', '')}
                        </span>
                        {isExpanded && <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">● Нажмите для сворачивания</span>}
                    </div>
                    
                    <h3 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight tracking-tighter uppercase italic">
                        {data.title}
                    </h3>
                    <p className="text-white/60 text-base md:text-xl font-medium leading-relaxed mb-8">
                        «{data.description}»
                    </p>

                    {/* Catalog Expansion Area */}
                    <div className={`grid transition-all duration-700 ease-in-out ${isExpanded ? 'grid-rows-[1fr] opacity-100 mt-10' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                            <div className="grid grid-cols-2 gap-4 pb-10">
                                {data.preview_products.map((g, i) => (
                                    <div key={g.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                                        <GiftCard gift={g} onClick={setViewGift} rank={i} />
                                    </div>
                                ))}
                                <div className="col-span-2 py-10 bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2">
                                    <span className="text-2xl">✨</span>
                                    <span className="text-[10px] font-black text-white/30 uppercase">И еще 12 вариантов</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {!isExpanded && (
                        <div className="flex gap-3">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleExpand(e); }}
                                className="flex-grow py-4 rounded-2xl bg-brand-pink text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-brand-pink/20 active:scale-95 transition-all"
                            >
                                Посмотреть подборку
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDislike(data.id); }}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 hover:text-red-400 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {viewGift && (
                <GiftDetailsModal gift={viewGift} isOpen={!!viewGift} onClose={() => setViewGift(null)} answers={null} onWishlistChange={() => {}} />
            )}
        </div>
    );
};

// --- MAIN PAGE ---

export const Dialogue: React.FC = () => {
    const navigate = useNavigate();
    const { useMockData } = useDevMode();
    
    const [session, setSession] = useState<RecommendationSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTrackId, setActiveTrackId] = useState<string>('');
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [phase, setPhase] = useState<'probe' | 'overview' | 'dead_end'>('probe');
    const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'excited' | 'surprised'>('happy');

    const scrollRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    const updateInternalState = useCallback((res: RecommendationSession) => {
        setSession(prev => {
            const mergedTracks = (res.tracks && res.tracks.length > 0) ? res.tracks : (prev?.tracks || []);
            return { ...res, tracks: mergedTracks };
        });

        if (res.state === 'BRANCHING') setPhase('probe');
        else if (res.state === 'DEAD_END') setPhase('dead_end');
        else setPhase('overview');

        if (res.tracks && res.tracks.length > 0) {
            if (!activeTrackId || !res.tracks.find(t => t.topic_id === activeTrackId)) {
                setActiveTrackId(res.tracks[0].topic_id);
            }
        }
    }, [activeTrackId]);

    useEffect(() => {
        const init = async () => {
            if (initialized.current) return;
            const stored = localStorage.getItem('gifty_answers');
            if (!stored && !useMockData) { navigate('/quiz'); return; }
            initialized.current = true;
            try {
                const answers: QuizAnswers = stored ? JSON.parse(stored) : {};
                const res = await api.gutg.init(answers);
                updateInternalState(res);
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        init();
    }, [navigate, useMockData, updateInternalState]);

    const handleInteract = async (action: string, value: string) => {
        if (action === 'select_track') {
            setLoading(true);
            setActiveTrackId(value);
            setActiveCardIndex(0);
            setMascotMood('thinking');
            setTimeout(() => {
                setLoading(false);
                setMascotMood('happy');
            }, 600);
            return;
        }

        setLoading(true);
        setMascotMood('thinking');
        
        try {
            let res: RecommendationSession;
            if (useMockData) {
                if (action === 'answer_probe') res = await MockServer.getGUTGSession('TRACKS');
                else res = await MockServer.getGUTGSession();
            } else {
                res = await api.gutg.interact(session?.session_id || '', action, value);
            }
            updateInternalState(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    // Card scroll tracking for Mascot reactions
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (!scrollRef.current) return;
        const scrollLeft = e.currentTarget.scrollLeft;
        const itemWidth = e.currentTarget.offsetWidth * 0.85; // Roughly the snap width
        const index = Math.round(scrollLeft / itemWidth);
        if (index !== activeCardIndex) {
            setActiveCardIndex(index);
            setMascotMood(index % 2 === 0 ? 'happy' : 'excited');
        }
    };

    const activeTrack = useMemo(() => 
        session?.tracks?.find(t => t.topic_id === activeTrackId), 
        [session, activeTrackId]
    );

    return (
        <div className="min-h-screen bg-[#1A050D] relative overflow-x-hidden flex flex-col font-sans pb-32">
            
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[100vw] h-[100vw] rounded-full blur-[120px] opacity-20 transition-all duration-1000 ${activeTrackId === 't_vibe' ? 'bg-purple-600' : 'bg-cyan-600'}`}></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[80vw] h-[80vw] bg-brand-pink/20 rounded-full blur-[140px] opacity-10"></div>
            </div>

            {/* Header / Nav */}
            <div className="fixed top-0 left-0 right-0 z-[60] p-4 flex justify-between items-center bg-[#1A050D]/60 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => navigate('/quiz')} className="bg-white/5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/5">← Назад</button>
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">AI Concierge</span>
                </div>
                <button onClick={() => navigate('/')} className="bg-white/5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white border border-white/5">Домой</button>
            </div>

            {/* Content Area */}
            <div className="flex-grow flex flex-col pt-24 px-0 relative z-10 w-full overflow-hidden">
                
                {/* AI Concierge Focus Unit */}
                <div className="w-full flex flex-col items-center text-center mb-8 px-6">
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-brand-pink/40 blur-3xl rounded-full scale-125"></div>
                        <Mascot emotion={mascotMood} className="w-24 h-24 md:w-32 md:h-32 relative z-10" variant="cupid" />
                    </div>
                    
                    <h1 className="text-white text-2xl md:text-3xl font-black leading-tight tracking-tight mb-2 max-w-lg">
                        {loading ? 'Настраиваю видения...' : (
                            phase === 'overview' ? `Тема: «${activeTrack?.topic_name}»` :
                            session?.current_probe?.question
                        )}
                    </h1>
                    {phase === 'overview' && !loading && (
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Листайте вбок</p>
                    )}
                </div>

                {/* --- PHASE: PROBE (Vertical Options) --- */}
                {phase === 'probe' && !loading && session?.current_probe && (
                    <div className="w-full max-w-2xl mx-auto px-6 animate-fade-in-up space-y-4">
                        {session.current_probe.options.map((opt) => (
                            <button key={opt.id} onClick={() => handleInteract('answer_probe', opt.label)} className="group bg-white/5 hover:bg-white backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-left transition-all active:scale-[0.98] flex items-center gap-5 w-full">
                                <span className="text-4xl transition-transform group-hover:scale-110">{opt.icon || '✨'}</span>
                                <div>
                                    <div className="font-black text-white group-hover:text-brand-dark text-lg leading-tight mb-1">{opt.label}</div>
                                    <div className="text-white/30 group-hover:text-slate-500 text-[10px] font-bold uppercase tracking-widest">{opt.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* --- PHASE: OVERVIEW (Horizontal Cards) --- */}
                {phase === 'overview' && (
                    <div className={`transition-all duration-700 w-full ${loading ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
                        
                        {/* Track Switcher (Horizontal Pills) */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 mb-8">
                            {session?.tracks?.map(t => {
                                const isActive = t.topic_id === activeTrackId;
                                return (
                                    <button 
                                        key={t.topic_id} 
                                        onClick={() => handleInteract('select_track', t.topic_id)} 
                                        className={`shrink-0 flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300 ${isActive ? 'bg-white text-brand-dark border-white shadow-xl' : 'bg-white/5 text-white/30 border-white/5'}`}
                                    >
                                        <span className="text-[10px] font-black uppercase tracking-wider">{t.topic_name}</span>
                                        {isActive && <div className="w-1.5 h-1.5 bg-brand-pink rounded-full"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* The Snapping Slider */}
                        <div 
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar px-[7.5vw] md:px-[calc(50vw-300px)] pb-20 items-start h-full scroll-smooth"
                        >
                            {activeTrack && activeTrack.hypotheses.map((h, idx) => (
                                <VisionCard 
                                    key={h.id} 
                                    data={h} 
                                    index={idx}
                                    isActive={idx === activeCardIndex}
                                    onLike={(id) => api.gutg.react(id, 'like')}
                                    onDislike={(id) => {
                                        api.gutg.react(id, 'dislike');
                                        // Simple removal logic for mock/demo
                                        setSession(prev => prev ? ({
                                            ...prev,
                                            tracks: prev.tracks?.map(t => t.topic_id === activeTrackId ? { ...t, hypotheses: t.hypotheses.filter(hyp => hyp.id !== id) } : t)
                                        }) : null);
                                    }}
                                />
                            ))}

                            {/* Load More as a terminal card */}
                            <div className="shrink-0 w-[85vw] md:w-[600px] snap-center">
                                <button 
                                    onClick={() => handleInteract('load_more_hypotheses', activeTrackId)}
                                    className="w-full h-full min-h-[300px] bg-white/5 border-2 border-dashed border-white/10 rounded-[3rem] transition-all flex flex-col items-center justify-center gap-6 active:scale-95"
                                >
                                    <div className="text-5xl opacity-20 grayscale group-hover:grayscale-0 transition-all">🔮</div>
                                    <span className="text-white/20 font-black tracking-[0.4em] text-[10px] uppercase">Больше видений</span>
                                </button>
                            </div>
                        </div>

                        {/* Navigation Dot Indicators */}
                        <div className="flex justify-center gap-2 mb-10">
                            {activeTrack && activeTrack.hypotheses.map((_, i) => (
                                <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i === activeCardIndex ? 'w-8 bg-brand-pink' : 'w-1.5 bg-white/10'}`}></div>
                            ))}
                        </div>

                        {/* Rescue Loop Footer */}
                        <div className="px-6 pb-20 text-center border-t border-white/5 pt-12">
                             <p className="text-white/20 mb-6 text-sm font-medium">Ничего не откликнулось?</p>
                             <button 
                                onClick={() => handleInteract('suggest_topics', '')}
                                className="py-5 px-10 rounded-full bg-white text-brand-dark font-black active:scale-95 text-lg shadow-2xl"
                             >
                                Сменить направления
                             </button>
                        </div>
                    </div>
                )}

                {/* --- PHASE: DEAD END --- */}
                {phase === 'dead_end' && (
                    <div className="w-full max-w-md mx-auto px-6 text-center animate-pop bg-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden">
                        <h2 className="text-5xl font-black text-brand-dark mb-6 tracking-tighter">Упс.</h2>
                        <p className="text-slate-500 mb-10 text-lg font-medium leading-relaxed opacity-80">В этой ветке идеи закончились. Давай попробуем зайти с другой стороны?</p>
                        <button onClick={() => window.location.reload()} className="w-full py-6 bg-brand-pink text-white rounded-2xl font-black shadow-xl active:scale-95 uppercase tracking-widest text-base">Перезагрузить</button>
                    </div>
                )}
            </div>
        </div>
    );
};
