
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { DialogueHypothesis, DialogueProbeOption, Gift, RecommendationTrack } from '../domain/types';
import { MOCK_DB_GIFTS } from '../api/mock/data';

// --- TYPES ---

interface ProbeData {
    question: string;
    subtitle: string;
    options: DialogueProbeOption[];
}

// --- MOCK DATA LOGIC (Simulating New API Response) ---

// This replaces the old GET_ROOT_PROBE. It returns Tracks.
const GET_INITIAL_TRACKS = (interestStr: string): RecommendationTrack[] => {
    // Default Tracks
    let tracks: RecommendationTrack[] = [
        {
            topicId: 't_music',
            topicName: 'Музыка',
            title: 'Аудиофил',
            status: 'ready',
            previewText: 'Оборудование и опыт',
            hypotheses: [
                {
                    id: 'h_tone',
                    title: 'В поисках звука',
                    gutgType: 'Catalyst',
                    description: 'Для музыканта звук — это религия. Педали эффектов или крутой процессор.',
                    previewGifts: [MOCK_DB_GIFTS[16]]
                },
                {
                    id: 'h_vinyl',
                    title: 'Виниловый ритуал',
                    gutgType: 'Mirror',
                    description: 'Эстетика прослушивания. Аксессуары для ухода за пластинками.',
                    previewGifts: [MOCK_DB_GIFTS[7]]
                }
            ]
        },
        {
            topicId: 't_cozy',
            topicName: 'Дом',
            title: 'Уютное гнездо',
            status: 'ready',
            previewText: 'Текстиль и свет',
            hypotheses: [
                {
                    id: 'h_warmth',
                    title: 'Тактильное тепло',
                    gutgType: 'Anchor',
                    description: 'Вещи, к которым хочется прикасаться. Пледы, халаты.',
                    previewGifts: [MOCK_DB_GIFTS[4]]
                },
                {
                    id: 'h_light',
                    title: 'Световой сценарий',
                    gutgType: 'Optimizer',
                    description: 'Умный свет для создания атмосферы.',
                    previewGifts: [MOCK_DB_GIFTS[1]]
                }
            ]
        }
    ];

    // If context implies Sport, swap Music for Sport
    if (interestStr.includes('Спорт')) {
        tracks[0] = {
            topicId: 't_sport',
            topicName: 'Спорт',
            title: 'Атлет',
            status: 'ready',
            previewText: 'Эффективность',
            hypotheses: [
                {
                    id: 'h_recovery',
                    title: 'Восстановление',
                    gutgType: 'Optimizer',
                    description: 'Массажеры и релакс после тренировок.',
                    previewGifts: [MOCK_DB_GIFTS[32]]
                }
            ]
        };
    }

    return tracks;
};

// Probe logic remains for "Rescuing" or Deep Diving a track
const GET_PROBE_FOR_TRACK = (topicId: string): ProbeData => {
    if (topicId === 't_sport') {
        return {
            question: 'Какой вид спорта основной?',
            subtitle: 'Чтобы не подарить ласты бегуну:',
            options: [
                { id: 'run', label: 'Бег', icon: '👟' },
                { id: 'gym', label: 'Зал', icon: '🏋️‍♂️' },
                { id: 'yoga', label: 'Йога', icon: '🧘‍♀️' }
            ]
        };
    }
    return {
        question: 'Уточним детали?',
        subtitle: 'Выбери направление:',
        options: [
            { id: 'new', label: 'Новинки', icon: '✨' },
            { id: 'classic', label: 'Классика', icon: '🏛' }
        ]
    };
};

// --- COMPONENTS ---

const TypingIndicator = () => (
    <div className="flex gap-1.5 p-2 px-4">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
    </div>
);

const ChatBubble: React.FC<{ children: React.ReactNode; isTyping?: boolean }> = ({ children, isTyping }) => (
    <div className="relative bg-white text-brand-dark rounded-2xl rounded-tl-none p-5 shadow-xl max-w-xl animate-pop border border-gray-100">
        <div className="absolute top-0 left-[-8px] w-4 h-4 bg-white transform skew-x-[20deg]"></div>
        <div className="relative z-10 text-lg font-bold leading-snug">
            {isTyping ? <TypingIndicator /> : children}
        </div>
    </div>
);

// --- HYPOTHESIS CARD ---
const HypothesisCard: React.FC<{ 
    data: DialogueHypothesis; 
    onExpand: () => void;
    onSelect: () => void;
    onReject: (reason: string) => void;
}> = ({ data, onExpand, onSelect, onReject }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    const [reason, setReason] = useState('');

    const handleRejectSubmit = () => {
        onReject(reason);
        setIsRejecting(false);
        setReason('');
    };

    return (
        <div className="bg-slate-800 border border-white/10 rounded-[2rem] overflow-hidden mb-6 last:mb-0 shadow-lg animate-pop group transition-all hover:border-white/20">
            <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-2">
                     <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-black ${
                        data.gutgType === 'Mirror' ? 'bg-purple-300' : 
                        data.gutgType === 'Optimizer' ? 'bg-blue-300' : 
                        data.gutgType === 'Catalyst' ? 'bg-orange-300' : 'bg-green-300'
                    }`}>
                        {data.gutgType}
                    </span>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">{data.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{data.description}</p>
            </div>

            {data.previewGifts.length > 0 && (
                <div className="px-6 pb-4 overflow-x-auto no-scrollbar flex gap-3">
                    {data.previewGifts.map((gift, i) => (
                        <div key={gift.id || i} className="w-24 shrink-0 cursor-pointer" onClick={onExpand}>
                            <div className="aspect-square rounded-xl overflow-hidden mb-1.5 bg-slate-900 border border-white/5 relative group/img">
                                <img src={gift.imageUrl || ''} className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" alt="" />
                            </div>
                            <div className="text-[9px] font-bold text-white/40 truncate">{gift.price} ₽</div>
                        </div>
                    ))}
                    <button onClick={onExpand} className="w-24 shrink-0 aspect-square rounded-xl border border-white/10 hover:bg-white/5 flex flex-col items-center justify-center gap-1 transition-colors">
                        <span className="text-xl">👀</span>
                        <span className="text-[10px] font-bold text-white/50">Еще +5</span>
                    </button>
                </div>
            )}
            
            <div className="p-4 pt-0">
                {isRejecting ? (
                    <div className="bg-white/5 rounded-xl p-4 animate-fade-in border border-white/10">
                        <h4 className="text-white text-sm font-bold mb-2">Что именно не так?</h4>
                        <textarea 
                            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-sm outline-none focus:border-red-400 mb-3 h-20 resize-none placeholder-white/20"
                            placeholder="Например: слишком дорого..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setIsRejecting(false)} className="flex-1 py-2.5 rounded-lg font-bold text-white/50 hover:bg-white/5 transition-colors text-xs">Отмена</button>
                            <button onClick={handleRejectSubmit} className="flex-1 py-2.5 bg-red-500 text-white hover:bg-red-600 rounded-lg font-bold transition-all text-xs">Скрыть</button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <button onClick={onSelect} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-cyan-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                            <span>🎯</span> Это про него!
                        </button>
                        <div className="flex gap-2">
                            <button onClick={() => setIsRejecting(true)} className="flex-1 py-3 bg-white/5 hover:bg-red-500/10 hover:text-red-300 text-white/40 hover:border-red-500/30 border border-transparent font-bold rounded-xl text-xs transition-all">Не про него</button>
                            <button onClick={onExpand} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 font-bold rounded-xl text-xs transition-colors">Раскрыть</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- PROBE VIEW ---
const ProbeView: React.FC<{ 
    data: ProbeData; 
    onConfirm: (ids: string[]) => void; 
}> = ({ data, onConfirm }) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());

    const toggleSelection = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.options.map(opt => {
                    const isSelected = selected.has(opt.id);
                    return (
                        <button 
                            key={opt.id}
                            onClick={() => toggleSelection(opt.id)}
                            className={`p-4 text-left transition-all duration-300 group flex items-center gap-3 rounded-2xl border ${
                                isSelected 
                                ? 'bg-brand-blue/20 border-brand-blue text-white' 
                                : 'bg-slate-800/50 border-white/10 text-white/60 hover:bg-slate-700'
                            }`}
                        >
                            <span className="text-2xl">{opt.icon}</span>
                            <div className="flex-grow">
                                <div className="font-bold text-sm leading-tight">{opt.label}</div>
                            </div>
                            {isSelected && <span>✓</span>}
                        </button>
                    );
                })}
            </div>
            {selected.size > 0 && (
                <div className="mt-6 flex justify-end">
                    <button 
                        onClick={() => onConfirm(Array.from(selected))}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm shadow-lg hover:scale-105 transition-transform"
                    >
                        Продолжить →
                    </button>
                </div>
            )}
        </div>
    );
};

// --- TRACK TABS COMPONENT ---
const TrackTabs: React.FC<{ 
    tracks: RecommendationTrack[]; 
    activeId: string; 
    onSelect: (id: string) => void; 
}> = ({ tracks, activeId, onSelect }) => (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6 w-full max-w-2xl mx-auto px-1">
        {tracks.map(track => {
            const isActive = track.topicId === activeId;
            return (
                <button
                    key={track.topicId}
                    onClick={() => onSelect(track.topicId)}
                    className={`flex-shrink-0 px-5 py-3 rounded-2xl font-bold text-sm transition-all duration-300 border flex flex-col items-start min-w-[140px] ${
                        isActive 
                        ? 'bg-white text-brand-dark border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105 z-10' 
                        : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                    }`}
                >
                    <span className="text-xs opacity-70 uppercase tracking-wider mb-1">{track.topicName}</span>
                    <span className="text-lg leading-none">{track.title}</span>
                </button>
            );
        })}
    </div>
);

// --- MAIN CONTAINER ---

export const ExperimentDialogue: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [state, setState] = useState<'init' | 'analyzing' | 'tracks' | 'feed'>('init');
    const [tracks, setTracks] = useState<RecommendationTrack[]>([]);
    const [activeTrackId, setActiveTrackId] = useState<string>('');
    const [probeMode, setProbeMode] = useState(false);
    
    // Derived Active Track
    const activeTrack = tracks.find(t => t.topicId === activeTrackId);

    // Initial Load
    useEffect(() => {
        const stored = localStorage.getItem('gifty_answers');
        let initialInterests = '';
        
        if (stored) {
            const parsed = JSON.parse(stored);
            initialInterests = parsed.interests || '';
        }
        
        // Simulate API call to get tracks
        const loadedTracks = GET_INITIAL_TRACKS(initialInterests);
        setTracks(loadedTracks);
        if (loadedTracks.length > 0) {
            setActiveTrackId(loadedTracks[0].topicId);
        }
        
        const timer = setTimeout(() => {
            setState('tracks');
        }, 1200); // Fake "Analyzing" delay
        return () => clearTimeout(timer);
    }, []);

    const handleTrackSelect = (id: string) => {
        setActiveTrackId(id);
        setProbeMode(false); // Reset probe mode when switching tracks
    };

    const handleExpand = () => setState('feed');

    const handleDislikeHypothesis = (id: string) => {
        // Remove from current track
        setTracks(prev => prev.map(t => {
            if (t.topicId === activeTrackId) {
                return {
                    ...t,
                    hypotheses: t.hypotheses.filter(h => h.id !== id)
                };
            }
            return t;
        }));
    };

    const handleProbeSubmit = (ids: string[]) => {
        // Simulate updating hypotheses after probe
        setProbeMode(false);
        // (In real app, fetch new hypotheses here)
    };

    const triggerRescue = () => {
        setProbeMode(true);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans relative overflow-x-hidden flex flex-col">
            
            {/* Navigation */}
            <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <button onClick={() => navigate('/experiments')} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition-colors">
                    ← Lab
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center pt-20 pb-20 px-4 max-w-4xl mx-auto w-full">
                
                {/* --- CONVERSATION HEADER --- */}
                <div className="mb-6 w-full max-w-2xl flex items-end gap-4 min-h-[100px]">
                    <div className="mb-1 relative shrink-0">
                        <Mascot 
                            emotion={state === 'init' ? 'thinking' : 'happy'} 
                            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" 
                            accessory="none"
                            variant="default"
                        />
                    </div>
                    
                    <ChatBubble isTyping={state === 'init'}>
                        {state === 'init' ? '...' : (
                            <>
                                {probeMode ? (
                                    <p>Уточним пару деталей, чтобы попасть точно в цель.</p>
                                ) : (
                                    <p>Я нашел несколько интересных направлений. Выбирай трек, и посмотрим, что внутри!</p>
                                )}
                            </>
                        )}
                    </ChatBubble>
                </div>

                {/* --- TRACKS UI --- */}
                {state === 'tracks' && (
                    <div className="w-full flex flex-col items-center transition-opacity duration-500 animate-fade-in-up">
                        
                        {/* Track Switcher (Tabs/Windows) */}
                        <TrackTabs 
                            tracks={tracks} 
                            activeId={activeTrackId} 
                            onSelect={handleTrackSelect} 
                        />

                        {/* Active Track Content */}
                        {activeTrack && (
                            <div className="w-full max-w-xl animate-pop">
                                {probeMode ? (
                                    <ProbeView 
                                        data={GET_PROBE_FOR_TRACK(activeTrack.topicId)}
                                        onConfirm={handleProbeSubmit}
                                    />
                                ) : (
                                    <>
                                        {activeTrack.hypotheses.length > 0 ? (
                                            <>
                                                {activeTrack.hypotheses.map(h => (
                                                    <HypothesisCard 
                                                        key={h.id}
                                                        data={h}
                                                        onExpand={handleExpand}
                                                        onSelect={handleExpand}
                                                        onReject={(r) => handleDislikeHypothesis(h.id)}
                                                    />
                                                ))}
                                                
                                                <button 
                                                    onClick={triggerRescue}
                                                    className="w-full mt-4 py-4 border-2 border-dashed border-white/10 rounded-2xl text-white/40 font-bold hover:text-white hover:border-white/30 transition-all text-sm"
                                                >
                                                    Ничего не подошло в теме "{activeTrack.topicName}"?
                                                </button>
                                            </>
                                        ) : (
                                            <div className="text-center py-12 border border-white/10 rounded-[2rem] bg-slate-800/50">
                                                <p className="text-white/50 mb-4">Гипотезы закончились.</p>
                                                <button onClick={triggerRescue} className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm">Искать еще</button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* --- FEED (DEEP DIVE) --- */}
                {state === 'feed' && (
                    <div className="w-full animate-fade-in-up">
                        <button 
                            onClick={() => setState('tracks')}
                            className="mb-6 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all border border-white/10"
                        >
                            ← Назад к трекам
                        </button>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {MOCK_DB_GIFTS.slice(0, 8).map((g, i) => (
                                <GiftCard key={g.id} gift={g} />
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};
