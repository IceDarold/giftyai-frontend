
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { DialogueHypothesis, DialogueProbeOption, Gift, RecommendationSession, QuizAnswers } from '../domain/types';
import { api } from '../api';

// --- TYPES ---

interface ProbeData {
    question: string;
    subtitle?: string;
    options: DialogueProbeOption[];
}

// --- COMPONENTS ---

// Typing Animation
const TypingIndicator = () => (
    <div className="flex gap-1.5 p-2 px-4">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
    </div>
);

// Chat Bubble
const ChatBubble: React.FC<{ children: React.ReactNode; isTyping?: boolean }> = ({ children, isTyping }) => (
    <div className="relative bg-white text-brand-dark rounded-2xl rounded-tl-none p-5 shadow-xl max-w-xl animate-pop border border-gray-100">
        <div className="absolute top-0 left-[-8px] w-4 h-4 bg-white transform skew-x-[20deg]"></div>
        <div className="relative z-10 text-lg font-bold leading-snug">
            {isTyping ? <TypingIndicator /> : children}
        </div>
    </div>
);

// 1. PROBE INTERFACE (Chat Style & Multi-Select)
const ProbeView: React.FC<{ 
    data: ProbeData; 
    onConfirm: (ids: string[], custom?: string) => void; 
}> = ({ data, onConfirm }) => {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [customValue, setCustomValue] = useState('');

    const toggleSelection = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelected(next);
    };

    const handleSend = () => {
        if (selected.size > 0 || customValue.trim()) {
            onConfirm(Array.from(selected), customValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
            
            {/* Input Area (Your turn) */}
            <div className="mb-8">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Напиши свой вариант..."
                        className="w-full bg-slate-800/50 border border-white/10 rounded-2xl py-4 pl-5 pr-14 text-white placeholder-white/30 outline-none focus:border-cyan-400 focus:bg-slate-800 transition-all"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {customValue && (
                        <button onClick={handleSend} className="absolute right-2 top-2 bottom-2 aspect-square bg-cyan-500 rounded-xl flex items-center justify-center hover:bg-cyan-400 text-white transition-colors">
                            ↑
                        </button>
                    )}
                </div>
            </div>
            
            {/* Options Area (Gifty's Suggestions) */}
            {data.options && data.options.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4 ml-2">Подсказки (можно несколько):</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {data.options.map(opt => {
                            const isSelected = selected.has(opt.id);
                            const isMulti = selected.size > 1;
                            
                            return (
                                <button 
                                    key={opt.id}
                                    onClick={() => toggleSelection(opt.id)}
                                    className={`relative p-4 text-left transition-all duration-300 group flex items-center gap-3 rounded-2xl border ${
                                        isSelected 
                                        ? 'bg-gradient-to-r from-brand-blue/20 to-brand-purple/20 border-brand-blue/50 shadow-[0_0_20px_rgba(255,77,109,0.2)]' 
                                        : 'bg-slate-800/50 border-white/10 hover:bg-slate-700 hover:border-white/20'
                                    }`}
                                >
                                    {/* Connection Line Effect */}
                                    {isSelected && isMulti && (
                                        <div className="absolute inset-0 border-2 border-brand-blue/30 rounded-2xl animate-pulse"></div>
                                    )}
                                    
                                    <span className={`text-2xl transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>{opt.icon}</span>
                                    <div className="flex-grow">
                                        <div className={`font-bold text-sm leading-tight ${isSelected ? 'text-white' : 'text-white/80'}`}>{opt.label}</div>
                                        <div className="text-[10px] text-white/40 leading-tight mt-0.5">{opt.description}</div>
                                    </div>

                                    {/* Checkmark / Connection Icon */}
                                    {isSelected && (
                                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-blue rounded-full flex items-center justify-center text-white shadow-md text-xs border-2 border-[#0F172A]">
                                            {isMulti ? '🔗' : '✓'}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Confirm Button (Only if items selected and no custom text) */}
                    {selected.size > 0 && !customValue && (
                        <div className="mt-6 flex justify-end animate-fade-in-up">
                            <button 
                                onClick={handleSend}
                                className="bg-white text-black px-8 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform flex items-center gap-2"
                            >
                                {selected.size > 1 ? 'Объединить и продолжить' : 'Выбрать'} →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// 2. HYPOTHESIS CARD
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

            <div className="px-6 pb-4 overflow-x-auto no-scrollbar flex gap-3">
                {data.previewGifts && data.previewGifts.map((gift, i) => (
                    <div key={gift.id || i} className="w-24 shrink-0 cursor-pointer" onClick={onExpand}>
                        <div className="aspect-square rounded-xl overflow-hidden mb-1.5 bg-slate-900 border border-white/5 relative group/img">
                            <img src={gift.imageUrl || 'https://placehold.co/100x100?text=Gift'} className="w-full h-full object-cover opacity-80 group-hover/img:opacity-100 transition-opacity" alt="" />
                        </div>
                        <div className="text-[9px] font-bold text-white/40 truncate">{gift.price} {gift.currency}</div>
                    </div>
                ))}
            </div>
            
            <div className="p-4 pt-0">
                {isRejecting ? (
                    <div className="bg-white/5 rounded-xl p-4 animate-fade-in border border-white/10">
                        <h4 className="text-white text-sm font-bold mb-2">Что именно не так? Я исправлюсь.</h4>
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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// 3. RESCUE INTERFACE (Pivot)
const RescueView: React.FC<{ onPivot: (mode: 'topic' | 'gutg') => void }> = ({ onPivot }) => (
    <div className="w-full max-w-md text-center animate-fade-in">
        <h2 className="text-2xl font-black text-white mb-3">Хм, кажется я зашел в тупик 🛑</h2>
        <p className="text-white/60 mb-8 font-medium">Вижу, что варианты тебе не зашли. Давай попробуем зайти с другой стороны?</p>
        <div className="space-y-3">
            <button onClick={() => onPivot('topic')} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl text-left transition-all group">
                <div className="font-bold text-white mb-1">🔍 Сменим тему</div>
                <div className="text-xs text-white/40">Назови его любимую вещь в доме, и я оттолкнусь от неё.</div>
            </button>
            <button onClick={() => onPivot('gutg')} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-2xl text-left transition-all group">
                <div className="font-bold text-white mb-1">🧠 Зайдем через психологию</div>
                <div className="text-xs text-white/40">Чего ему сейчас не хватает: драйва или покоя?</div>
            </button>
        </div>
    </div>
);

// --- MAIN CONTAINER ---

export const ExperimentDialogue: React.FC = () => {
    const navigate = useNavigate();
    
    // API State
    const [session, setSession] = useState<RecommendationSession | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Initial Load - Init Session
    useEffect(() => {
        const init = async () => {
            const stored = localStorage.getItem('gifty_answers');
            if (!stored) {
                // Mock answers if none exist (for direct page access)
                const mockAnswers: QuizAnswers = {
                    name: 'User', ageGroup: '30', recipientGender: 'unisex',
                    interests: 'Музыка', budget: '5000', city: 'Moscow',
                    relationship: 'partner', occasion: 'birthday', vibe: 'cool',
                    roles: [], roleConfidence: 'guessing', archetype: '', selfWorth: '',
                    conversationTopics: '', topicDuration: 'long_term', painPoints: [], painStyle: 'endurer', riskyTopics: false
                };
                await startSession(mockAnswers);
            } else {
                await startSession(JSON.parse(stored));
            }
        };
        init();
    }, []);

    const startSession = async (answers: QuizAnswers) => {
        setLoading(true);
        try {
            const newSession = await api.gutg.init(answers);
            setSession(newSession);
        } catch (e) {
            setError('Failed to start session');
        } finally {
            setLoading(false);
        }
    };

    const handleProbeSubmit = async (ids: string[], custom?: string) => {
        if (!session) return;
        setLoading(true);
        const val = custom ? custom : ids.join(', ');
        try {
            const updated = await api.gutg.interact(session.session_id, 'answer_probe', val);
            setSession(updated);
        } catch (e) {
            setError('Error interacting');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (id: string) => {
        if (!session) return;
        setLoading(true);
        try {
            const updated = await api.gutg.interact(session.session_id, 'like_hypothesis', id);
            setSession(updated);
        } catch (e) {
            setError('Error liking');
        } finally {
            setLoading(false);
        }
    };

    const handleDislike = async (id: string, reason?: string) => {
        if (!session) return;
        // Optimistic UI update could go here
        setLoading(true);
        try {
            const updated = await api.gutg.interact(session.session_id, 'dislike_hypothesis', id);
            setSession(updated);
        } catch (e) {
            setError('Error disliking');
        } finally {
            setLoading(false);
        }
    };

    const handleRescue = async (mode: 'topic' | 'gutg') => {
        if (!session) return;
        setLoading(true);
        try {
            // Sending special rescue pivot signal
            const updated = await api.gutg.interact(session.session_id, 'answer_probe', `Rescue Pivot: ${mode}`);
            setSession(updated);
        } catch (e) {
            setError('Rescue failed');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        window.location.reload();
    };

    if (!session && !loading) return <div className="p-10 text-white text-center">Initializing...</div>;

    const currentState = session?.state || 'BRANCHING';

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans relative overflow-x-hidden flex flex-col">
            
            {/* Dev Controls */}
            <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <button onClick={() => navigate('/experiments')} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition-colors">
                    ← Exit Lab
                </button>
                <div className="pointer-events-auto flex flex-col gap-2 items-end">
                    <div className="text-[10px] font-mono text-cyan-500 uppercase">
                        State: {currentState}
                    </div>
                    <button onClick={handleReset} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] border border-white/10">Reset</button>
                </div>
            </div>

            <div className="flex-grow flex flex-col items-center pt-24 pb-20 px-4 max-w-4xl mx-auto w-full">
                
                {/* --- CONVERSATION HEADER --- */}
                <div className="mb-8 w-full max-w-2xl flex items-end gap-4 min-h-[100px]">
                    <div className="mb-1 relative shrink-0">
                        <Mascot 
                            emotion={currentState === 'DEAD_END' ? 'surprised' : currentState === 'SHOWING_HYPOTHESES' ? 'happy' : 'thinking'} 
                            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" 
                            accessory="none"
                            variant="default"
                        />
                    </div>
                    
                    {loading ? (
                        <ChatBubble isTyping={true}>...</ChatBubble>
                    ) : (
                        <ChatBubble>
                            {currentState === 'BRANCHING' && session?.current_probe && (
                                <>
                                    <p>{session.current_probe.question}</p>
                                    {session.current_probe.subtitle && <p className="text-sm text-gray-400 mt-1 font-normal">{session.current_probe.subtitle}</p>}
                                </>
                            )}
                            {currentState === 'SHOWING_HYPOTHESES' && <p>Я проанализировал данные. Вот несколько стратегий, которые сработают лучше всего:</p>}
                            {currentState === 'DEAD_END' && <p>Хм, кажется я зашел в тупик. Попробуем зайти с другой стороны?</p>}
                            {currentState === 'DEEP_DIVE' && <p>Отличный выбор! Вот подборка товаров в этой стратегии.</p>}
                        </ChatBubble>
                    )}
                </div>

                {/* --- INTERACTIVE CONTENT AREA --- */}
                <div className="w-full flex-grow flex flex-col items-center justify-center transition-opacity duration-300">
                    
                    {loading && (
                        <div className="h-32"></div> // Spacer
                    )}

                    {!loading && currentState === 'BRANCHING' && session?.current_probe && (
                        <ProbeView 
                            data={session.current_probe}
                            onConfirm={handleProbeSubmit} 
                        />
                    )}

                    {!loading && currentState === 'SHOWING_HYPOTHESES' && session?.current_hypotheses && (
                        <div className="w-full max-w-xl animate-fade-in-up">
                            {session.current_hypotheses.map(h => (
                                <HypothesisCard 
                                    key={h.id} 
                                    data={h} 
                                    onExpand={() => handleLike(h.id)} 
                                    onSelect={() => handleLike(h.id)}
                                    onReject={(reason) => handleDislike(h.id, reason)} 
                                />
                            ))}
                            {session.current_hypotheses.length === 0 && (
                                <div className="text-center text-white/50">Гипотезы закончились...</div>
                            )}
                        </div>
                    )}

                    {!loading && currentState === 'DEEP_DIVE' && session?.deep_dive_products && (
                        <div className="w-full animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-8">
                                <button onClick={handleReset} className="text-white/50 hover:text-white font-bold bg-white/10 px-4 py-2 rounded-full transition-colors">← Начать заново</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {session.deep_dive_products.map((g, i) => (
                                    <GiftCard key={g.id} gift={g} />
                                ))}
                            </div>
                        </div>
                    )}

                    {!loading && currentState === 'DEAD_END' && (
                        <RescueView onPivot={handleRescue} />
                    )}
                </div>

            </div>
        </div>
    );
};
