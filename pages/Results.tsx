
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { Gift, QuizAnswers, RecommendationSession, RecommendationTrack, DialogueHypothesis } from '../domain/types';
import { api, setGlobalLogger } from '../api';
import { useDevMode } from '../components/DevModeContext';
import { MockServer } from '../api/mock/server';

// --- COMPONENTS ---

const ChatBubble: React.FC<{ children: React.ReactNode; isTyping?: boolean }> = ({ children, isTyping }) => (
    <div className="relative bg-white/90 backdrop-blur-xl text-brand-dark rounded-2xl rounded-tl-none p-6 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] max-w-xl animate-pop border border-white/50 transition-all">
        <div className="absolute top-0 left-[-8px] w-4 h-4 bg-white/90 transform skew-x-[20deg]"></div>
        <div className="relative z-10 text-lg font-bold leading-snug">
            {isTyping ? (
                <div className="flex gap-1.5 p-2 px-4">
                    <div className="w-2 h-2 bg-brand-pink/50 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
                    <div className="w-2 h-2 bg-brand-pink/50 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
                    <div className="w-2 h-2 bg-brand-pink/50 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
                </div>
            ) : children}
        </div>
    </div>
);

const HypothesisCard: React.FC<{ 
    data: DialogueHypothesis; 
    onOpenFeed: () => void; 
    onLike: (id: string) => void;
    onDislike: (id: string) => void;
}> = ({ data, onOpenFeed, onLike, onDislike }) => {
    const [status, setStatus] = useState<'none' | 'liked' | 'disliked'>('none');

    const handleLike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStatus('liked');
        onLike(data.id);
    };

    const handleDislike = (e: React.MouseEvent) => {
        e.stopPropagation();
        setStatus('disliked');
        onDislike(data.id);
    };

    const badgeColors: Record<string, string> = {
        'the_mirror': 'bg-purple-400',
        'the_optimizer': 'bg-blue-400',
        'the_catalyst': 'bg-orange-400',
        'the_anchor': 'bg-green-400'
    };

    if (status === 'disliked') return null;

    return (
        <div className={`bg-white/90 backdrop-blur-md border rounded-[2.5rem] overflow-hidden shadow-xl animate-pop group transition-all hover:shadow-2xl ${status === 'liked' ? 'ring-4 ring-brand-pink border-brand-pink scale-[1.01]' : 'border-white/50'}`}>
            <div onClick={onOpenFeed} className="cursor-pointer">
                <div className="p-8 pb-4">
                    <div className="flex justify-between items-start mb-3">
                        <span className={`text-[9px] font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white shadow-sm ${badgeColors[data.primary_gap] || 'bg-gray-400'}`}>
                            {data.primary_gap.replace('the_', '')}
                        </span>
                        {status === 'liked' && <span className="text-xl animate-pop">❤️</span>}
                    </div>
                    <h3 className="text-2xl font-black text-brand-dark mb-2 leading-tight">{data.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">{data.description}</p>
                </div>

                {data.preview_products.length > 0 && (
                    <div className="px-8 pb-6 relative">
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-gradient-right snap-x">
                            {data.preview_products.map((gift, i) => (
                                <div key={i} className="w-24 shrink-0 snap-start">
                                    <div className="aspect-[4/5] rounded-2xl bg-gray-100 overflow-hidden mb-2 border border-white shadow-sm">
                                        <img src={gift.imageUrl || ''} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="text-[10px] font-black text-brand-dark/40 text-center">{gift.price} ₽</div>
                                </div>
                            ))}
                            <div className="w-24 shrink-0 aspect-[4/5] rounded-2xl bg-brand-pink/5 border-2 border-dashed border-brand-pink/20 flex flex-col items-center justify-center text-brand-pink gap-1">
                                <span className="text-xl">✨</span>
                                <span className="text-[9px] font-black uppercase">Еще 10+</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="p-8 pt-0 flex gap-3">
                 <button 
                    onClick={handleDislike}
                    className="flex-1 py-4 bg-gray-100 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-2xl font-bold transition-all active:scale-95"
                >
                    Не то ✕
                </button>
                <button 
                    onClick={handleLike} 
                    className={`flex-[2] py-4 font-black rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 group/btn ${status === 'liked' ? 'bg-brand-love text-white' : 'bg-brand-pink text-white hover:bg-brand-love shadow-brand-pink/20'}`}
                >
                    <span className="group-hover/btn:scale-110 transition-transform">🎯</span> 
                    Это про него!
                </button>
            </div>
        </div>
    );
};

const ProbeOverlay: React.FC<{ probe: RecommendationSession['current_probe'], onAnswer: (val: string) => void, onClose: () => void }> = ({ probe, onAnswer, onClose }) => {
    if (!probe) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-brand-dark/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white rounded-[3rem] p-8 md:p-12 w-full max-w-lg shadow-2xl animate-pop border-4 border-white relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-gray-400 hover:text-brand-dark font-black">✕</button>
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-brand-pink/10 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 animate-bounce-slow">🤔</div>
                    <h2 className="text-2xl md:text-3xl font-black text-brand-dark mb-2 leading-tight">{probe.question}</h2>
                    {probe.subtitle && <p className="text-gray-500 font-bold text-sm">{probe.subtitle}</p>}
                </div>
                <div className="space-y-3">
                    {probe.options.map(opt => (
                        <button 
                            key={opt.id}
                            onClick={() => onAnswer(opt.label)}
                            className="w-full p-5 bg-gray-50 hover:bg-white hover:shadow-xl border border-gray-100 rounded-3xl text-left flex items-center gap-4 transition-all group"
                        >
                            <span className="text-3xl group-hover:scale-110 transition-transform">{opt.icon || '👉'}</span>
                            <div className="font-black text-brand-dark leading-tight">{opt.label}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- DRAGGABLE CONSOLE LOGS ---
const NetworkLog = ({ logs, clear }: { logs: any[], clear: () => void }) => (
    <div className="flex flex-col h-full bg-black/40 rounded-xl overflow-hidden font-mono text-[9px]">
        <div className="flex justify-between items-center p-2 bg-black/20 border-b border-white/5">
            <span className="text-white/40 uppercase tracking-widest font-black">Live Network Events</span>
            <button onClick={clear} className="text-brand-pink hover:underline uppercase">Clear</button>
        </div>
        <div className="flex-grow overflow-y-auto p-2 space-y-2 no-scrollbar">
            {logs.map(log => (
                <div key={log.id} className="border-l-2 border-white/10 pl-2 py-1">
                    <div className="flex justify-between items-center">
                        <span className="text-white/80 font-black">[{log.method}] {log.endpoint}</span>
                        <span className="text-white/20">{log.timestamp}</span>
                    </div>
                    {log.payload && (
                        <div className="text-green-400 mt-1 opacity-60 truncate">
                            Payload: {JSON.stringify(log.payload)}
                        </div>
                    )}
                </div>
            ))}
            {logs.length === 0 && <div className="text-white/20 italic p-4 text-center">Ожидание запросов...</div>}
        </div>
    </div>
);

export const Results: React.FC = () => {
    const navigate = useNavigate();
    const { isDevMode, useMockData, setUseMockData, logs, addLog, clearLogs } = useDevMode();
    
    const [session, setSession] = useState<RecommendationSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [activeTrackId, setActiveTrackId] = useState<string>('');
    const [viewGift, setViewGift] = useState<Gift | null>(null);
    const [customAnswer, setCustomAnswer] = useState('');
    const [phase, setPhase] = useState<'probe' | 'overview' | 'feed' | 'dead_end'>('probe');
    const [consoleTab, setConsoleTab] = useState<'control' | 'network'>('control');
    
    // Console Dragging State
    const [consolePos, setConsolePos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef<{ startX: number, startY: number, initialX: number, initialY: number } | null>(null);

    const initialized = useRef(false);

    useEffect(() => {
        setGlobalLogger(addLog);
    }, [addLog]);

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
            } catch (e) { setError(true); } finally { setLoading(false); }
        };
        init();
    }, [navigate, useMockData]);

    const updateInternalState = (res: RecommendationSession) => {
        setSession(res);
        if (res.state === 'BRANCHING') setPhase('probe');
        else if (res.state === 'DEAD_END') setPhase('dead_end');
        else if (res.state === 'DEEP_DIVE') setPhase('feed');
        else setPhase('overview');

        if (res.tracks && res.tracks.length > 0 && (!activeTrackId || !res.tracks.find(t => t.topic_id === activeTrackId))) {
            setActiveTrackId(res.tracks[0].topic_id);
        }
    };

    const activeTrack = useMemo(() => 
        session?.tracks?.find(t => t.topic_id === activeTrackId), 
        [session, activeTrackId]
    );

    const handleInteract = async (action: string, value: string) => {
        // "Load more" and "select track" shouldn't show heavy loading spinner usually for better UX
        if (action !== 'load_more_hypotheses' && action !== 'select_track') setLoading(true);
        
        try {
            if (useMockData && action === 'refine_topic') {
                const res = await MockServer.getGUTGSession('REFINE');
                updateInternalState(res);
            } else {
                const res = await api.gutg.interact(session?.session_id || '', action, value);
                updateInternalState(res);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const handleDeepDive = async (hId: string) => {
        setLoading(true);
        try {
            const res = await api.gutg.interact(session?.session_id || '', 'like_hypothesis', hId);
            updateInternalState(res);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const forceState = async (variant: 'BRANCHING' | 'TRACKS' | 'FEED' | 'DEAD_END') => {
        setLoading(true);
        updateInternalState(await MockServer.getGUTGSession(variant));
        setLoading(false);
    };

    // --- DRAG HANDLERS ---
    const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        dragRef.current = { startX: clientX, startY: clientY, initialX: consolePos.x, initialY: consolePos.y };
        setIsDragging(true);
    };

    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!isDragging || !dragRef.current) return;
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
            setConsolePos({
                x: dragRef.current.initialX + (clientX - dragRef.current.startX),
                y: dragRef.current.initialY + (clientY - dragRef.current.startY)
            });
        };
        const handleUp = () => setIsDragging(false);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        window.addEventListener('touchmove', handleMove);
        window.addEventListener('touchend', handleUp);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
        };
    }, [isDragging]);

    return (
        <div className="min-h-screen relative overflow-x-hidden flex flex-col font-sans pb-48">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <button onClick={() => navigate('/quiz')} className="pointer-events-auto bg-white/80 hover:bg-white backdrop-blur-md px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all shadow-sm text-brand-dark">← Квиз</button>
                <button onClick={() => navigate('/')} className="pointer-events-auto bg-white/80 hover:bg-white backdrop-blur-md px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all shadow-sm text-brand-dark">Домой</button>
            </div>

            <div className="flex-grow flex flex-col items-center pt-24 px-4 max-w-4xl mx-auto w-full">
                
                <div className="mb-12 w-full max-w-2xl flex items-end gap-5 min-h-[140px]">
                    <div className="mb-3 shrink-0">
                        <Mascot 
                            emotion={loading ? 'thinking' : phase === 'dead_end' ? 'surprised' : phase === 'feed' ? 'excited' : 'happy'} 
                            className="w-24 h-24 md:w-32 md:h-32 drop-shadow-2xl" 
                            variant="cupid"
                        />
                    </div>
                    
                    <ChatBubble isTyping={loading}>
                        {loading ? '...' : (
                            <>
                                {error && <p>Ой, мои нейроны запутались. Попробуйте обновить страницу.</p>}
                                {phase === 'probe' && session?.current_probe && (
                                    <>
                                        <p>{session.current_probe.question}</p>
                                        {session.current_probe.subtitle && <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-widest opacity-50">{session.current_probe.subtitle}</p>}
                                    </>
                                )}
                                {phase === 'overview' && (
                                    <p>Я проанализировал профиль. Нашел несколько крутых векторов в теме «{activeTrack?.topic_name}»:</p>
                                )}
                                {phase === 'feed' && <p>Супер! Вот подборка, которая попадет точно в цель:</p>}
                                {phase === 'dead_end' && <p>Хм, кажется мы перебрали всё. Куда двинемся дальше?</p>}
                            </>
                        )}
                    </ChatBubble>
                </div>

                <div className="w-full flex-grow flex flex-col items-center">
                    {!loading && !error && (
                        <>
                            {phase === 'probe' && session?.current_probe && (
                                <div className="w-full max-w-2xl animate-fade-in-up">
                                    <div className="mb-6 relative group z-10">
                                        <input 
                                            type="text" 
                                            value={customAnswer}
                                            onChange={(e) => setCustomAnswer(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && customAnswer.trim() && handleInteract('answer_probe', customAnswer)}
                                            placeholder="Напишите свой вариант..."
                                            className="w-full relative bg-white/80 hover:bg-white backdrop-blur-xl border border-white/50 rounded-2xl py-4 pl-6 pr-14 text-brand-dark font-bold placeholder-gray-400 outline-none focus:ring-4 focus:ring-brand-pink/20 transition-all shadow-lg text-lg"
                                        />
                                        <button 
                                            onClick={() => customAnswer.trim() && handleInteract('answer_probe', customAnswer)}
                                            disabled={!customAnswer.trim()}
                                            className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-pink text-white rounded-xl flex items-center justify-center shadow-md hover:bg-brand-love transition-all active:scale-90 z-20"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {session.current_probe.options.map((opt) => (
                                            <button key={opt.id} onClick={() => handleInteract('answer_probe', opt.label)} className="bg-white/80 hover:bg-white border border-white/40 p-5 rounded-[2rem] text-left transition-all group flex items-center gap-4 shadow-lg active:scale-[0.98]">
                                                <span className="text-3xl group-hover:scale-110 transition-transform">{opt.icon || '👉'}</span>
                                                <div>
                                                    <div className="font-black text-brand-dark text-sm leading-tight">{opt.label}</div>
                                                    {opt.description && <div className="text-[10px] text-gray-500 font-bold mt-1 opacity-60">{opt.description}</div>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {phase === 'overview' && session?.tracks && (
                                <div className="w-full flex flex-col gap-8 animate-fade-in-up">
                                    {/* Track Switcher */}
                                    <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mask-gradient-right px-2">
                                        {session.tracks.map(t => {
                                            const isActive = t.topic_id === activeTrackId;
                                            return (
                                                <div key={t.topic_id} className="relative shrink-0 flex flex-col gap-1 items-center group">
                                                    <button 
                                                        onClick={() => {
                                                            setActiveTrackId(t.topic_id);
                                                            handleInteract('select_track', t.topic_id);
                                                        }} 
                                                        className={`flex flex-col items-start px-6 py-4 rounded-[2.5rem] border transition-all duration-300 min-w-[150px] relative ${isActive ? 'bg-white text-brand-dark border-white shadow-xl scale-105 z-10' : 'bg-white/30 text-brand-dark/50 border-white/20 hover:bg-white/50'}`}
                                                    >
                                                        <span className="text-[9px] font-black uppercase opacity-60 mb-0.5">{t.topic_name}</span>
                                                        <span className="text-sm font-black truncate w-full">{t.title}</span>
                                                        {isActive && <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-pink rounded-full shadow-[0_0_10px_#F9A8D4]"></div>}
                                                    </button>
                                                    
                                                    {isActive && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleInteract('refine_topic', t.topic_id); }}
                                                            className="mt-2 bg-white/20 hover:bg-white/40 backdrop-blur-sm px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter text-brand-dark transition-all flex items-center gap-1"
                                                        >
                                                            ⚙️ Уточнить тему
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Hypotheses List */}
                                    <div className="w-full max-w-xl mx-auto space-y-6">
                                        {activeTrack && activeTrack.hypotheses.map(h => (
                                            <HypothesisCard 
                                                key={h.id} 
                                                data={h} 
                                                onOpenFeed={() => handleDeepDive(h.id)} 
                                                onLike={(id) => api.gutg.react(id, 'like')}
                                                onDislike={(id) => api.gutg.react(id, 'dislike')}
                                            />
                                        ))}
                                        
                                        <button 
                                            onClick={() => handleInteract('load_more_hypotheses', activeTrackId)}
                                            className="w-full py-10 border-4 border-dashed border-white/30 hover:border-white/50 bg-white/5 rounded-[3rem] text-brand-dark/40 font-black transition-all text-sm flex flex-col items-center gap-3 group active:scale-95"
                                        >
                                            <span className="text-4xl group-hover:rotate-12 transition-transform">➕</span>
                                            ПОКАЗАТЬ ЕЩЕ ГИПОТЕЗЫ
                                        </button>
                                    </div>

                                    {/* Rescue Interaction */}
                                    <div className="mt-12 border-t border-white/20 pt-10 text-center">
                                        <p className="text-[10px] font-black text-brand-dark/30 uppercase tracking-[0.4em] mb-6">Ничего не подошло?</p>
                                        <button 
                                            onClick={() => handleInteract('suggest_topics', '')}
                                            className="py-5 px-10 rounded-[2rem] bg-white/40 border border-white/40 text-brand-dark font-black hover:bg-white transition-all shadow-md active:scale-95"
                                        >
                                            ПОПРОБОВАТЬ ДРУГИЕ НАПРАВЛЕНИЯ
                                        </button>
                                    </div>
                                </div>
                            )}

                            {phase === 'feed' && (
                                <div className="w-full animate-fade-in-up px-2">
                                    <button 
                                        onClick={() => setPhase('overview')}
                                        className="mb-8 bg-white/80 hover:bg-white text-brand-dark px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-md border border-white/50 active:scale-95"
                                    >
                                        ← Назад к гипотезам
                                    </button>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
                                        {session?.deep_dive_products?.map((g, i) => <GiftCard key={g.id} gift={g} onClick={setViewGift} rank={i} />)}
                                    </div>
                                </div>
                            )}

                            {phase === 'dead_end' && (
                                <div className="w-full max-w-md text-center animate-pop bg-white/90 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white/50">
                                    <h2 className="text-3xl font-black text-brand-dark mb-4">Тут пусто 🛑</h2>
                                    <p className="text-gray-600 mb-10 font-bold leading-relaxed opacity-70">Мои алгоритмы зашли в тупик в этом направлении. Давайте сменим стратегию?</p>
                                    <button onClick={() => window.location.reload()} className="w-full py-5 bg-brand-pink text-white rounded-2xl font-black shadow-xl hover:bg-brand-love transition-all active:scale-95">Начать сначала</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Probe Overlay handling (from Refine action) */}
            {session?.current_probe && (
                <ProbeOverlay 
                    probe={session.current_probe} 
                    onAnswer={(val) => handleInteract('answer_probe', val)} 
                    onClose={() => setSession(prev => prev ? ({ ...prev, current_probe: undefined }) : null)}
                />
            )}

            {/* --- GIFTY ENGINE CONSOLE 4.0 (DRAGGABLE & LIVE LOGS) --- */}
            {isDevMode && (
                <div 
                    className="fixed z-[100] w-[95%] max-w-lg select-none"
                    style={{ 
                        transform: `translate(${consolePos.x}px, ${consolePos.y}px)`,
                        bottom: '2rem',
                        left: '50%',
                        marginLeft: '-237.5px' 
                    }}
                >
                    <div className="bg-[#0F172A]/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden h-[360px] flex flex-col">
                        
                        {/* Drag Handle & Header */}
                        <div 
                            onMouseDown={startDrag}
                            onTouchStart={startDrag}
                            className="p-4 border-b border-white/5 cursor-move active:bg-white/5 flex items-center justify-between"
                        >
                            <div className="flex gap-4">
                                <button onMouseDown={e => e.stopPropagation()} onClick={() => setConsoleTab('control')} className={`text-[10px] font-black uppercase tracking-widest ${consoleTab === 'control' ? 'text-brand-pink' : 'text-white/30'}`}>Engine Control</button>
                                <button onMouseDown={e => e.stopPropagation()} onClick={() => setConsoleTab('network')} className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${consoleTab === 'network' ? 'text-green-400' : 'text-white/30'}`}>
                                    Network Log {logs.length > 0 && <span className="bg-green-500 text-black px-1 rounded-sm text-[8px]">{logs.length}</span>}
                                </button>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                        
                        <div className="flex-grow overflow-hidden relative p-6">
                            {consoleTab === 'control' ? (
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[8px] font-bold text-white/40 uppercase mb-2 block">State Forcing</label>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {['BRANCHING', 'TRACKS', 'FEED', 'DEAD_END'].map(v => (
                                                <button 
                                                    key={v}
                                                    onClick={() => forceState(v as any)} 
                                                    className={`py-2.5 rounded-xl text-[9px] font-black transition-all border ${session?.state === v ? 'bg-brand-pink border-brand-pink text-white' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setUseMockData(!useMockData)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border transition-all ${useMockData ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-white/5 text-white/30 border-white/5'}`}>
                                                Mock Mode: {useMockData ? 'ON' : 'OFF'}
                                            </button>
                                            <button onClick={() => window.location.reload()} className="px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase border border-white/5 text-white/30">Reset Session</button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <NetworkLog logs={logs} clear={clearLogs} />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {viewGift && (
                <GiftDetailsModal gift={viewGift} isOpen={!!viewGift} onClose={() => setViewGift(null)} answers={null} onWishlistChange={() => {}} />
            )}
        </div>
    );
};
