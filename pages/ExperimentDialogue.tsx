
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { DialogueHypothesis, Gift, RecommendationTrack, RecommendationSession } from '../domain/types';
import { MOCK_DB_GIFTS } from '../api/mock/data';
import { useDevMode } from '../components/DevModeContext';
import { api } from '../api';

// --- MOCK STATE GENERATORS ---

const getMockProbe = (): RecommendationSession => ({
    session_id: 'mock_probe',
    state: 'BRANCHING',
    current_probe: {
        question: 'Что для получателя важнее всего в вещах?',
        subtitle: 'Это поможет мне выбрать правильный вектор поиска',
        options: [
            { id: 'opt_util', label: 'Польза и удобство', icon: '⚙️', description: 'Главное чтобы работало' },
            { id: 'opt_aest', label: 'Эстетика и стиль', icon: '🎨', description: 'Важно как выглядит' },
            { id: 'opt_wow', label: 'Вау-эффект', icon: '✨', description: 'Хочу удивить' }
        ]
    }
} as any);

const getMockTracks = (): RecommendationSession => {
    // Fix: Using correct property names from domain types
    const tracks: RecommendationTrack[] = [
        {
            topic_id: 't_music',
            topic_name: 'Музыка',
            title: 'Аудиофил',
            status: 'ready',
            hypotheses: [
                { id: 'h_tone', title: 'В поисках звука', primary_gap: 'the_catalyst', description: 'Оборудование для тех, кто не просто слушает, а создает. Педали, процессоры, кабели.', preview_products: [MOCK_DB_GIFTS[16], MOCK_DB_GIFTS[17], MOCK_DB_GIFTS[8]] },
                { id: 'h_vinyl', title: 'Виниловый ритуал', primary_gap: 'the_mirror', description: 'Эстетика аналогового звука. Аксессуары для ухода и хранения пластинок.', preview_products: [MOCK_DB_GIFTS[7], MOCK_DB_GIFTS[19], MOCK_DB_GIFTS[31]] },
                { id: 'h_acoustic', title: 'Акустический уют', primary_gap: 'the_anchor', description: 'Компактные девайсы для создания атмосферы дома через звук.', preview_products: [MOCK_DB_GIFTS[30], MOCK_DB_GIFTS[2], MOCK_DB_GIFTS[6]] }
            ]
        },
        {
            topic_id: 't_cozy',
            topic_name: 'Дом',
            title: 'Уютное гнездо',
            status: 'ready',
            hypotheses: [
                { id: 'h_warmth', title: 'Тактильное тепло', primary_gap: 'the_anchor', description: 'Вещи, к которым хочется прикасаться. Пледы, халаты, шелк.', preview_products: [MOCK_DB_GIFTS[4], MOCK_DB_GIFTS[12], MOCK_DB_GIFTS[8]] },
                { id: 'h_light', title: 'Световой сценарий', primary_gap: 'the_optimizer', description: 'Умный свет и биокамины для изменения пространства под настроение.', preview_products: [MOCK_DB_GIFTS[1], MOCK_DB_GIFTS[13], MOCK_DB_GIFTS[18]] },
                { id: 'h_garden', title: 'Зеленый оазис', primary_gap: 'the_catalyst', description: 'Наборы для выращивания и умные горшки для тех, кто любит жизнь.', preview_products: [MOCK_DB_GIFTS[11], MOCK_DB_GIFTS[20], MOCK_DB_GIFTS[5]] }
            ]
        }
    ];
    return {
        session_id: 'mock_tracks',
        state: 'SHOWING_HYPOTHESES',
        tracks,
        topic_hints: [
            { id: 'h_travel', title: 'Путешествия', description: 'Может он часто бывает в дороге?' },
            { id: 'h_sport', title: 'Спорт и ЗОЖ', description: 'Следит за здоровьем?' }
        ]
    } as any;
};

// --- COMPONENTS ---

const ChatBubble: React.FC<{ children: React.ReactNode; isTyping?: boolean }> = ({ children, isTyping }) => (
    <div className="relative bg-white text-brand-dark rounded-2xl rounded-tl-none p-5 shadow-xl max-w-xl animate-pop border border-gray-100 transition-all">
        <div className="absolute top-0 left-[-8px] w-4 h-4 bg-white transform skew-x-[20deg]"></div>
        <div className="relative z-10 text-lg font-bold leading-snug">
            {isTyping ? <div className="flex gap-1.5 p-1"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-75"></div><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce delay-150"></div></div> : children}
        </div>
    </div>
);

const HypothesisCard: React.FC<{ 
    data: DialogueHypothesis; 
    onSelect: () => void; 
    onReject: (id: string) => void;
    onReact: (id: string, type: 'like' | 'dislike') => void;
}> = ({ data, onSelect, onReject, onReact }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    
    return (
        <div className="bg-slate-800/80 backdrop-blur-md border border-white/10 rounded-[2rem] overflow-hidden mb-4 shadow-lg animate-pop transition-all hover:border-white/20">
            <div className="p-6 pb-4">
                <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-black mb-2 inline-block ${
                    data.primary_gap === 'the_mirror' ? 'bg-purple-300' : 
                    data.primary_gap === 'the_optimizer' ? 'bg-blue-300' : 
                    data.primary_gap === 'the_catalyst' ? 'bg-orange-300' : 'bg-green-300'
                }`}>{data.primary_gap.replace('the_', '')}</span>
                <h3 className="text-xl font-black text-white mb-2">{data.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{data.description}</p>
            </div>
            {/* Fix: Property name changed from previewGifts to preview_products */}
            {data.preview_products.length > 0 && (
                <div className="px-6 pb-4 flex gap-3 overflow-x-auto no-scrollbar" onClick={onSelect}>
                    {data.preview_products.map((gift, i) => (
                        <div key={gift.id || i} className="w-20 shrink-0 cursor-pointer">
                            <div className="aspect-square rounded-xl overflow-hidden mb-1.5 bg-slate-900 border border-white/5">
                                <img src={gift.imageUrl || ''} className="w-full h-full object-cover opacity-80" alt="" />
                            </div>
                            <div className="text-[8px] font-bold text-white/40 truncate">{gift.price} ₽</div>
                        </div>
                    ))}
                    <div className="w-20 shrink-0 h-20 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-white/20 font-bold text-[10px]">
                        + еще
                    </div>
                </div>
            )}
            <div className="p-4 pt-0">
                {isRejecting ? (
                    <div className="bg-white/5 rounded-xl p-4 animate-fade-in border border-white/10">
                        <textarea className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm outline-none mb-3 h-16 resize-none" placeholder="Почему не подходит?" autoFocus />
                        <div className="flex gap-2">
                            <button onClick={() => setIsRejecting(false)} className="flex-1 py-2 text-white/50 text-xs font-bold">Отмена</button>
                            <button onClick={() => { onReject(data.id); onReact(data.id, 'dislike'); }} className="flex-1 py-2 bg-red-500/80 text-white rounded-lg font-bold text-xs">Скрыть</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <button onClick={() => { onSelect(); onReact(data.id, 'like'); }} className="w-full py-3 bg-white text-black font-bold rounded-xl text-sm shadow-lg active:scale-95 transition-transform">🎯 Посмотреть варианты</button>
                        <div className="flex gap-2">
                            <button onClick={() => setIsRejecting(true)} className="flex-1 py-2 bg-white/5 text-white/40 font-bold rounded-xl text-[10px] hover:bg-white/10">Не про него</button>
                            <button onClick={() => onReact(data.id, 'like')} className="flex-1 py-2 bg-white/5 text-white/40 font-bold rounded-xl text-[10px] hover:bg-white/10">❤️ В избранное</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

export const ExperimentDialogue: React.FC = () => {
    const navigate = useNavigate();
    const { isDevMode, useMockData } = useDevMode();
    
    // Core Session State
    const [session, setSession] = useState<RecommendationSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTrackId, setActiveTrackId] = useState<string>('');
    const [viewProducts, setViewProducts] = useState<Gift[]>([]);
    const [phase, setPhase] = useState<'dialogue' | 'overview' | 'feed' | 'dead_end'>('dialogue');

    // Init Session
    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const stored = localStorage.getItem('gifty_answers');
                const answers = stored ? JSON.parse(stored) : {};
                const res = await api.gutg.init(answers);
                setSession(res);
                
                // Fix: Access topic_id instead of topicId
                if (res.tracks && res.tracks.length > 0) {
                    setActiveTrackId(res.tracks[0].topic_id);
                }

                // Initial phase mapping
                if (res.state === 'BRANCHING') setPhase('dialogue');
                else if (res.state === 'DEAD_END') setPhase('dead_end');
                else setPhase('overview');
                
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

    const activeTrack = useMemo(() => 
        // Fix: Use topic_id instead of topicId
        session?.tracks?.find(t => t.topic_id === activeTrackId), 
        [session, activeTrackId]
    );

    const handleInteract = async (action: string, value: string) => {
        setLoading(true);
        try {
            if (useMockData && action === 'answer_probe') {
                // Simulate state transition in mock mode
                await new Promise(r => setTimeout(r, 800));
                const next = getMockTracks();
                setSession(next);
                setPhase('overview');
                // Fix: Use topic_id instead of topicId
                if (next.tracks && next.tracks.length > 0) setActiveTrackId(next.tracks[0].topic_id);
            } else {
                const res = await api.gutg.interact(session?.session_id || '', action, value);
                setSession(res);
                if (res.state === 'BRANCHING') setPhase('dialogue');
                else if (res.state === 'DEEP_DIVE') setPhase('feed');
                else if (res.state === 'DEAD_END') setPhase('dead_end');
                else setPhase('overview');
                
                // Fix: Use topic_id instead of topicId
                if (res.tracks && res.tracks.length > 0 && !activeTrackId) {
                    setActiveTrackId(res.tracks[0].topic_id);
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDeepDive = async (hId: string) => {
        setLoading(true);
        try {
            const products = await api.gutg.getProducts(hId);
            setViewProducts(products);
            setPhase('feed');
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // --- Dev Helpers for Design testing ---
    const forceState = (p: typeof phase, s?: RecommendationSession) => {
        setPhase(p);
        if (s) {
            setSession(s);
            // Fix: Use topic_id instead of topicId
            if (s.tracks && s.tracks.length > 0) setActiveTrackId(s.tracks[0].topic_id);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans relative flex flex-col">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-slate-900/60 backdrop-blur-md border-b border-white/5">
                <button onClick={() => navigate('/experiments')} className="bg-white/5 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10">← Lab</button>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`}></div>
                    <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        {useMockData ? 'MOCK ENGINE V2' : 'LIVE ENGINE V2'}
                    </span>
                </div>
            </div>

            <div className="flex-grow flex flex-col items-center pt-24 pb-32 px-4 max-w-2xl mx-auto w-full">
                
                {/* Mascot & Dialogue */}
                <div className="w-full flex items-start gap-4 mb-8">
                    <Mascot 
                        emotion={loading ? 'thinking' : phase === 'feed' ? 'excited' : phase === 'dead_end' ? 'surprised' : 'happy'} 
                        variant="default" 
                        className="w-16 h-16 drop-shadow-xl" 
                    />
                    <ChatBubble isTyping={loading}>
                        {loading ? 'Изучаю контекст...' : (
                            phase === 'dialogue' ? session?.current_probe?.question :
                            phase === 'feed' ? 'Отличная стратегия. Вот подходящие товары:' :
                            phase === 'dead_end' ? 'Ой! Кажется, мы зашли в тупик в этой ветке.' :
                            // Fix: Use topic_name instead of topicName
                            `Я нашел несколько векторов в теме «${activeTrack?.topic_name}». Как тебе?`
                        )}
                    </ChatBubble>
                </div>

                {/* --- PHASE: DIALOGUE --- */}
                {phase === 'dialogue' && !loading && session?.current_probe && (
                    <div className="w-full grid grid-cols-1 gap-3 animate-fade-in-up">
                        {session.current_probe.options.map((opt, i) => (
                            <button 
                                key={i}
                                onClick={() => handleInteract('answer_probe', typeof opt === 'string' ? opt : opt.label)}
                                className="p-5 text-left bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all active:scale-[0.98] group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{typeof opt === 'string' ? '👉' : opt.icon || '👉'}</span>
                                        <span>{typeof opt === 'string' ? opt : opt.label}</span>
                                    </div>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </div>
                            </button>
                        ))}
                    </div>
                )}

                {/* --- PHASE: OVERVIEW --- */}
                {phase === 'overview' && !loading && session && (
                    <div className="w-full flex flex-col gap-6 animate-fade-in-up">
                        {/* Track Switcher */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {session.tracks?.map(t => {
                                // Fix: Use topic_id and topic_name
                                const isActive = t.topic_id === activeTrackId;
                                return (
                                    <button 
                                        key={t.topic_id} 
                                        onClick={() => setActiveTrackId(t.topic_id)} 
                                        className={`shrink-0 flex flex-col items-start px-5 py-3 rounded-[1.5rem] border transition-all duration-300 min-w-[140px] relative ${isActive ? 'bg-white text-slate-900 border-white shadow-2xl scale-105 z-10' : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'}`}
                                    >
                                        <span className="text-[9px] font-black uppercase opacity-60 mb-0.5">{t.topic_name}</span>
                                        <span className="text-sm font-bold truncate w-full">{t.title}</span>
                                        {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"></div>}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Active Hypotheses */}
                        <div className="relative min-h-[400px] w-full">
                            {activeTrack && (
                                // Fix: Use topic_id
                                <div key={activeTrack.topic_id} className="animate-pop">
                                    <div className="space-y-4">
                                        {activeTrack.hypotheses.map(h => (
                                            <HypothesisCard 
                                                key={h.id} 
                                                data={h} 
                                                onSelect={() => handleDeepDive(h.id)} 
                                                onReject={(id) => {}} 
                                                onReact={(id, t) => api.gutg.react(id, t as any)}
                                            />
                                        ))}
                                        
                                        <button 
                                            onClick={() => handleInteract('refine_topic', activeTrackId)}
                                            className="w-full py-6 border-2 border-dashed border-white/5 hover:border-white/20 rounded-[2rem] text-white/30 font-bold transition-all text-sm flex flex-col items-center gap-2"
                                        >
                                            <span className="text-2xl">🆘</span>
                                            Ничего не подошло? Попробуем уточнить.
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Topic Hints */}
                        {session.topic_hints && session.topic_hints.length > 0 && (
                            <div className="mt-8 border-t border-white/5 pt-8">
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] mb-4">Другие темы</p>
                                <div className="grid grid-cols-1 gap-3">
                                    {session.topic_hints.map(hint => (
                                        <button 
                                            key={hint.id}
                                            onClick={() => handleInteract('answer_probe', hint.title)}
                                            className="p-4 rounded-2xl bg-white/5 border border-white/5 text-left hover:bg-white/10 transition-colors"
                                        >
                                            <div className="font-bold text-sm text-cyan-400">{hint.title}</div>
                                            <div className="text-xs text-white/40">{hint.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* --- PHASE: FEED --- */}
                {phase === 'feed' && !loading && (
                    <div className="w-full animate-fade-in-up">
                        <button 
                            onClick={() => setPhase('overview')} 
                            className="mb-8 bg-white/10 text-white px-5 py-2 rounded-full text-xs font-bold border border-white/10 hover:bg-white hover:text-slate-900 transition-all"
                        >
                            ← Назад к гипотезам
                        </button>
                        <div className="grid grid-cols-2 gap-4">
                            {viewProducts.map(g => <GiftCard key={g.id} gift={g} onClick={() => {}} />)}
                        </div>
                    </div>
                )}

                {/* --- PHASE: DEAD END --- */}
                {phase === 'dead_end' && !loading && (
                    <div className="w-full flex flex-col items-center text-center animate-pop bg-white/5 p-10 rounded-[3rem] border border-white/10">
                        <h2 className="text-2xl font-black mb-4">Тут пусто 🛑</h2>
                        <p className="text-white/50 mb-8 max-w-xs">Я не нашел достойных идей в этом направлении. Давайте сменим тему?</p>
                        <button 
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 bg-white text-black font-black rounded-2xl shadow-xl active:scale-95 transition-all"
                        >
                            Начать сначала
                        </button>
                    </div>
                )}
            </div>

            {/* Dev Controls Overlay */}
            {isDevMode && (
                <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2">
                    <div className="bg-black/90 backdrop-blur px-3 py-2 rounded-lg border border-green-500/30 text-[9px] font-mono text-green-400">
                        [SID]: {session?.session_id?.slice(0, 8) || 'NULL'}<br/>
                        [STATE]: {session?.state || 'NULL'}
                    </div>
                    {useMockData && (
                        <div className="flex gap-1">
                            <button onClick={() => forceState('dialogue', getMockProbe())} className="px-2 py-1 bg-slate-800 text-[8px] font-bold rounded border border-white/10 hover:bg-slate-700">Probe</button>
                            <button onClick={() => forceState('overview', getMockTracks())} className="px-2 py-1 bg-slate-800 text-[8px] font-bold rounded border border-white/10 hover:bg-slate-700">Tracks</button>
                            <button onClick={() => setPhase('feed')} className="px-2 py-1 bg-slate-800 text-[8px] font-bold rounded border border-white/10 hover:bg-slate-700">Feed</button>
                            <button onClick={() => setPhase('dead_end')} className="px-2 py-1 bg-slate-800 text-[8px] font-bold rounded border border-white/10 hover:bg-slate-700">Dead End</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
