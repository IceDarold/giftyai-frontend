
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Gift, QuizAnswers, RecommendationSession, RecommendationTrack, DialogueHypothesis } from '../domain/types';
import { api } from '../api';
import { useDevMode } from '../components/DevModeContext';
import { MockServer } from '../api/mock/server';

// --- SUB-COMPONENTS ---

const HypothesisInspoCard: React.FC<{ 
    data: DialogueHypothesis; 
    onOpenFeed: () => void;
    onLike: (id: string) => void;
    index: number;
}> = ({ data, onOpenFeed, onLike, index }) => {
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLiked(!isLiked);
        onLike(data.id);
    };

    return (
        <div 
            onClick={onOpenFeed}
            className="group relative w-full aspect-[3/4] rounded-[2rem] overflow-hidden bg-brand-surface border border-white/5 cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Main Background Image */}
            <img 
                src={data.preview_products[0]?.imageUrl || ''} 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80" 
                alt="" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>

            {/* Top Badge */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">AI Pick</span>
                </div>
            </div>

            {/* Favorite Button */}
            <button 
                onClick={handleLike}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isLiked ? 'bg-brand-accent text-brand-dark' : 'bg-black/30 text-white/60 backdrop-blur-md hover:bg-white/10'}`}
            >
                <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </button>

            {/* Bottom Content Panel (Glass) */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#020617] to-transparent">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-black text-lg leading-tight tracking-tight uppercase line-clamp-1">{data.title}</h3>
                    <div className="bg-white/10 backdrop-blur-md text-white border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold">
                        {data.preview_products[0]?.price} ₽
                    </div>
                </div>
                <p className="text-white/60 text-xs font-medium leading-relaxed line-clamp-2 mb-4">
                    {data.description}
                </p>
                <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                        {data.preview_products.slice(1, 4).map((p, i) => (
                            <div key={i} className="w-6 h-6 rounded-full border border-brand-dark overflow-hidden bg-gray-800">
                                <img src={p.imageUrl || ''} className="w-full h-full object-cover" alt="" />
                            </div>
                        ))}
                    </div>
                    <button className="bg-brand-accent text-brand-dark px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">
                        Смотреть
                    </button>
                </div>
            </div>
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
    const [phase, setPhase] = useState<'probe' | 'overview' | 'feed' | 'dead_end'>('probe');
    const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'excited' | 'surprised'>('happy');

    const initialized = useRef(false);

    const updateInternalState = useCallback((res: RecommendationSession) => {
        setSession(prev => {
            const mergedTracks = (res.tracks && res.tracks.length > 0) ? res.tracks : (prev?.tracks || []);
            return { ...res, tracks: mergedTracks };
        });

        if (res.state === 'BRANCHING') setPhase('probe');
        else if (res.state === 'DEAD_END') setPhase('dead_end');
        else if (res.state === 'DEEP_DIVE') setPhase('feed');
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
            setMascotMood('thinking');
            api.gutg.interact(session?.session_id || '', action, value);
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
                else if (action === 'like_hypothesis') res = await MockServer.getGUTGSession('FEED');
                else res = await MockServer.getGUTGSession();
            } else {
                res = await api.gutg.interact(session?.session_id || '', action, value);
            }
            updateInternalState(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const activeTrack = useMemo(() => 
        session?.tracks?.find(t => t.topic_id === activeTrackId), 
        [session, activeTrackId]
    );

    return (
        <div className="relative z-10 w-full min-h-screen overflow-x-hidden flex flex-col font-sans bg-brand-dark">
            
            {/* Background Atmosphere */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className={`absolute top-[-20%] left-[-10%] w-[120vw] h-[120vw] rounded-full blur-[140px] opacity-20 transition-all duration-1000 ${activeTrackId === 't_vibe' ? 'bg-brand-main/60' : 'bg-blue-600/40'}`}></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[100vw] h-[100vw] bg-brand-accent/5 rounded-full blur-[120px] opacity-10"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
            </div>

            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-[60] px-6 py-6 flex justify-between items-center bg-brand-dark/80 backdrop-blur-xl border-b border-white/5">
                <button onClick={() => navigate('/quiz')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-colors border border-white/5">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-white text-lg font-black tracking-tight uppercase italic leading-none">Inspiration</h1>
                    <span className="text-[9px] font-bold text-brand-accent uppercase tracking-[0.3em] mt-1">AI Curated</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white border border-white/5"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg></button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow pt-32 px-4 relative z-10 w-full max-w-2xl mx-auto">
                
                {/* --- PHASE: PROBE --- */}
                {phase === 'probe' && !loading && session?.current_probe && (
                    <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in">
                        <div className="mb-10 relative">
                            <div className="absolute inset-0 bg-brand-main/30 blur-3xl rounded-full scale-150"></div>
                            <Mascot emotion="thinking" variant="default" className="w-24 h-24 relative z-10" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-white text-center mb-12 tracking-tight uppercase italic leading-[1.1]">
                            {session.current_probe.question}
                        </h2>
                        <div className="w-full space-y-3">
                            {session.current_probe.options.map((opt) => (
                                <button 
                                    key={opt.id} 
                                    onClick={() => handleInteract('answer_probe', opt.label)} 
                                    className="w-full group bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-brand-accent/50 p-6 rounded-[2rem] text-left transition-all active:scale-[0.98] flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-5">
                                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{opt.icon || '✨'}</span>
                                        <span className="font-black text-white group-hover:text-brand-accent text-lg uppercase tracking-tight transition-colors">{opt.label}</span>
                                    </div>
                                    <svg className="w-6 h-6 text-white/20 group-hover:text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- PHASE: OVERVIEW (The Inspiration Grid) --- */}
                {phase === 'overview' && (
                    <div className={`transition-all duration-1000 ${loading ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
                        
                        {/* Theme Pills */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-10 pb-2">
                            {session?.tracks?.map(t => {
                                const isActive = t.topic_id === activeTrackId;
                                return (
                                    <button 
                                        key={t.topic_id} 
                                        onClick={() => handleInteract('select_track', t.topic_id)} 
                                        className={`shrink-0 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${isActive ? 'bg-brand-accent text-brand-dark border-brand-accent shadow-[0_0_20px_rgba(190,242,100,0.4)]' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                                    >
                                        {t.topic_name}
                                        {isActive && <span className="ml-2 opacity-50">●</span>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Visual Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-32">
                            {activeTrack && activeTrack.hypotheses.map((h, idx) => (
                                <HypothesisInspoCard 
                                    key={h.id} 
                                    data={h} 
                                    index={idx}
                                    onOpenFeed={() => handleInteract('like_hypothesis', h.id)}
                                    onLike={(id) => api.gutg.react(id, 'like')}
                                />
                            ))}
                            
                            {/* Load More Visual Tile */}
                            <button 
                                onClick={() => handleInteract('load_more_hypotheses', activeTrackId)}
                                className="relative aspect-[3/4] rounded-[2rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 transition-all group"
                            >
                                <div className="text-4xl group-hover:scale-125 transition-transform grayscale group-hover:grayscale-0">🔮</div>
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] group-hover:text-white transition-colors">Больше идей</span>
                            </button>
                        </div>

                        {/* Deep Rescue Footer */}
                        <div className="pb-40 text-center border-t border-white/5 pt-16">
                            <p className="text-white/20 mb-8 text-[10px] font-black uppercase tracking-widest">Не нашли то, что искали?</p>
                            <button 
                                onClick={() => handleInteract('suggest_topics', '')}
                                className="bg-white/5 border border-white/10 text-white hover:bg-brand-main hover:border-brand-main px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-2xl"
                            >
                                Сменить все направления
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PHASE: FEED --- */}
                {phase === 'feed' && (
                    <div className="w-full animate-fade-in-up pb-32">
                        <div className="flex justify-between items-center mb-10 pt-4">
                            <button 
                                onClick={() => setPhase('overview')}
                                className="bg-white/10 text-white/60 hover:text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 transition-colors"
                            >
                                ← Назад
                            </button>
                            <h2 className="text-white text-xl font-black italic tracking-tight uppercase">Selection</h2>
                            <div className="w-10"></div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {session?.deep_dive_products?.map((g, i) => (
                                <div key={g.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                                    <GiftCard gift={g} rank={i} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* --- PHASE: DEAD END --- */}
                {phase === 'dead_end' && (
                    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center text-center animate-pop">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-6xl mb-8 border border-white/10">🕵️‍♂️</div>
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase italic">Пустота</h2>
                        <p className="text-white/40 mb-10 text-base font-medium leading-relaxed max-w-[280px]">Мы обыскали все тайники, но в этой ветке больше нет сокровищ.</p>
                        <button onClick={() => window.location.reload()} className="px-12 py-5 bg-white text-brand-dark rounded-full font-black uppercase tracking-widest shadow-2xl active:scale-95">Начать сначала</button>
                    </div>
                )}
            </div>
        </div>
    );
};
