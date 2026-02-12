
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { DialogueHypothesis, DialogueProbeOption, Gift } from '../domain/types';
import { MOCK_DB_GIFTS } from '../api/mock/data';

// --- TYPES ---

interface ProbeData {
    question: string;
    subtitle: string;
    options: DialogueProbeOption[];
}

// --- MOCK DATA LOGIC ---

// Dynamic Root Probe Generator
const GET_ROOT_PROBE = (topic: string): ProbeData => {
    if (topic.includes('Спорт')) {
        return {
            question: 'Так, давай уточним про спорт 🏃‍♂️',
            subtitle: 'Выбери все, что про него (можно несколько):',
            options: [
                { id: 'runner', label: 'Бег / Кардио', icon: '👟', description: 'Марафоны, паркран' },
                { id: 'gym', label: 'Качалка', icon: '🏋️‍♂️', description: 'Железо, кроссфит' },
                { id: 'yoga', label: 'Йога / Растяжка', icon: '🧘‍♀️', description: 'Коврик, дзен' }
            ]
        };
    }
    if (topic.includes('Уют')) {
        return {
            question: 'Поговорим про уют 🏠',
            subtitle: 'Что создает для него атмосферу?',
            options: [
                { id: 'warmth', label: 'Тепло', icon: '🧣', description: 'Пледы, носки' },
                { id: 'light', label: 'Свет / Аромат', icon: '🕯️', description: 'Свечи, лампы' },
                { id: 'tasty', label: 'Вкусняшки', icon: '☕️', description: 'Чай, какао' }
            ]
        };
    }
    // Default Music
    return {
        question: 'Так, давай уточним насчет музыки 🎵',
        subtitle: 'Выбери все, что про него (можно несколько):',
        options: [
            { id: 'listener', label: 'Просто слушает', icon: '🎧', description: 'Винил, стриминг, фон' },
            { id: 'player', label: 'Играет сам', icon: '🎸', description: 'Есть инструмент' },
            { id: 'fan', label: 'Фанатеет', icon: '🤘', description: 'Знает биографии, ходит в мерче' }
        ]
    };
};

const SECONDARY_PROBES: Record<string, ProbeData> = {
    'player': {
        question: 'А на чем он играет?',
        subtitle: 'Выбери инструменты:',
        options: [
            { id: 'guitar', label: 'Гитара', icon: '🎸', description: 'Электро, акустика, бас' },
            { id: 'piano', label: 'Клавишные', icon: '🎹', description: 'Пианино, синтезатор' },
            { id: 'drums', label: 'Ударные', icon: '🥁', description: 'Барабаны, перкуссия' }
        ]
    },
    'listener': {
        question: 'Как он обычно слушает?',
        subtitle: 'Важна атмосфера:',
        options: [
            { id: 'vinyl', label: 'Винил / Hi-Fi', icon: '📀', description: 'Ламповый звук, ритуал' },
            { id: 'streaming', label: 'В наушниках', icon: '📱', description: 'Музыка 24/7' },
            { id: 'live', label: 'Живые концерты', icon: '🎫', description: 'Энергия толпы' }
        ]
    },
    'fan': {
        question: 'От кого он фанатеет?',
        subtitle: 'Выбери стили или группы:',
        options: [
            { id: 'rock_legends', label: 'Рок-легенды', icon: '⚡️', description: 'Queen, Metallica' },
            { id: 'kpop', label: 'K-Pop / Idol', icon: '✨', description: 'BTS, Stray Kids' },
            { id: 'indie', label: 'Андерграунд', icon: '👁️', description: 'Редкое, странное' }
        ]
    },
    'gym': {
        question: 'Какая у него цель?',
        subtitle: 'Ради чего он потеет?',
        options: [
            { id: 'mass', label: 'Набрать массу', icon: '💪', description: 'Протеин, веса' },
            { id: 'health', label: 'Здоровье', icon: '❤️', description: 'Тонус, спина' },
            { id: 'show', label: 'Красота', icon: '🤳', description: 'Фото в зеркале' }
        ]
    }
};

const GET_HYPOTHESES = (selections: string[], topic: string): DialogueHypothesis[] => {
    if (topic.includes('Спорт')) {
        return [
            {
                id: 'h_recovery',
                title: 'Профессиональное восстановление',
                gutgType: 'Optimizer',
                description: 'Спорт — это не только тренировки, но и отдых. Массажер перкуссионный или валик МФР.',
                previewGifts: [{ ...MOCK_DB_GIFTS[32], title: 'Массажер Gun Pro' }]
            },
            {
                id: 'h_gear',
                title: 'Экипировка нового уровня',
                gutgType: 'Catalyst',
                description: 'Вещи, которые повышают эффективность. Умные часы, пульсометр или крутая бутылка.',
                previewGifts: [{ ...MOCK_DB_GIFTS[1] }]
            },
            {
                id: 'h_style_gym',
                title: 'Стиль в зале',
                gutgType: 'Mirror',
                description: 'Чтобы чувствовать себя уверенно. Качественное полотенце, сумка.',
                previewGifts: [MOCK_DB_GIFTS[0]]
            }
        ];
    }

    // Default Music Logic
    if (selections.includes('guitar') || selections.includes('player')) {
        return [
            {
                id: 'h_tone',
                title: 'В поисках того самого звука',
                gutgType: 'Catalyst',
                description: 'Для музыканта звук — это религия. Педали эффектов или крутой процессор — это новые краски для творчества.',
                previewGifts: [MOCK_DB_GIFTS[16], { ...MOCK_DB_GIFTS[1], title: 'Педаль Overdrive', imageUrl: 'https://images.unsplash.com/photo-1519508234439-4f23643125c1?auto=format&fit=crop&w=400&q=60' }]
            },
            {
                id: 'h_care',
                title: 'Забота об инструменте',
                gutgType: 'Optimizer',
                description: 'Инструмент требует ухода. Профессиональный набор для чистки — это проявление уважения к его "подруге".',
                previewGifts: [{ ...MOCK_DB_GIFTS[5], title: 'Набор Dunlop Care', imageUrl: 'https://m.media-amazon.com/images/I/71Jg+Kk7GBL.jpg' }]
            },
            {
                id: 'h_style',
                title: 'Рок-звезда на диване',
                gutgType: 'Mirror',
                description: 'Стильный ремень, медиаторы из кости мамонта или неоновая вывеска в студию.',
                previewGifts: [MOCK_DB_GIFTS[25]]
            }
        ];
    }

    if (selections.includes('vinyl') || selections.includes('listener')) {
        return [
            {
                id: 'h_ritual',
                title: 'Ритуал прослушивания',
                gutgType: 'Mirror',
                description: 'Винил — это не про звук, а про процесс. Красивая щетка, клемп или подставка для конверта "Now Playing".',
                previewGifts: [MOCK_DB_GIFTS[7]]
            },
            {
                id: 'h_storage',
                title: 'Эстетика хранения',
                gutgType: 'Optimizer',
                description: 'Пластинки должны стоять красиво. Ящик из массива дуба или стильные разделители.',
                previewGifts: [MOCK_DB_GIFTS[27]]
            },
            {
                id: 'h_new',
                title: 'Новые бриллианты',
                gutgType: 'Catalyst',
                description: 'Редкие издания любимых альбомов или подарочные бокс-сеты.',
                previewGifts: [MOCK_DB_GIFTS[8]]
            }
        ];
    }

    return [
        {
            id: 'h_generic_1',
            title: 'Музыкальный декор',
            gutgType: 'Mirror',
            description: 'Интерьерные вещи, кричащие о любви к музыке.',
            previewGifts: [MOCK_DB_GIFTS[25]]
        },
        {
            id: 'h_generic_2',
            title: 'Звук без границ',
            gutgType: 'Optimizer',
            description: 'Технологии, чтобы музыка была везде.',
            previewGifts: [MOCK_DB_GIFTS[1]]
        },
        {
            id: 'h_generic_3',
            title: 'История музыки',
            gutgType: 'Anchor',
            description: 'Книги, биографии и постеры.',
            previewGifts: [MOCK_DB_GIFTS[18]]
        }
    ];
};

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
        </div>
    );
};

// 2. HYPOTHESIS CARD (Same as before)
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
                            <button onClick={onExpand} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white/60 font-bold rounded-xl text-xs transition-colors">Раскрыть</button>
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
    
    // State
    const [state, setState] = useState<'init' | 'analyzing' | 'probing' | 'hypothesizing' | 'feed' | 'rescue'>('init');
    const [topic, setTopic] = useState<string>('Music');
    const [currentProbe, setCurrentProbe] = useState<ProbeData | null>(null);
    const [hypotheses, setHypotheses] = useState<DialogueHypothesis[]>([]);
    
    // Initial Load
    useEffect(() => {
        const stored = localStorage.getItem('gifty_answers');
        let initialTopic = 'Music';
        
        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.interests) {
                // Heuristic to detect topic
                if (parsed.interests.includes('Спорт')) initialTopic = 'Спорт';
                if (parsed.interests.includes('Уют')) initialTopic = 'Уют';
            }
        }
        
        setTopic(initialTopic);
        setCurrentProbe(GET_ROOT_PROBE(initialTopic));
        
        const timer = setTimeout(() => {
            setState('probing');
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleProbeSubmit = (ids: string[], custom?: string) => {
        // Switch to "thinking" state
        setState('analyzing');

        // Logic branching (Mock)
        const primaryId = ids[0];

        if (!custom && ids.length === 1 && SECONDARY_PROBES[primaryId]) {
            setTimeout(() => {
                setCurrentProbe(SECONDARY_PROBES[primaryId]);
                setState('probing');
            }, 1500); 
        } else {
            // Generate hypotheses based on selection
            setTimeout(() => {
                const results = GET_HYPOTHESES(ids, topic);
                setHypotheses(results);
                setState('hypothesizing');
            }, 2000); 
        }
    };

    const handleDislike = (id: string, reason?: string) => {
        setHypotheses(prev => prev.filter(h => h.id !== id));
        if (hypotheses.length <= 1) {
            setState('analyzing');
            setTimeout(() => setState('rescue'), 1000);
        }
    };

    const handleExpand = (id: string) => {
        setState('feed');
    };

    const handleReset = () => {
        setHypotheses([]);
        setCurrentProbe(GET_ROOT_PROBE(topic));
        setState('analyzing');
        setTimeout(() => setState('probing'), 1000);
    };

    const handleTopicChange = (newTopic: string) => {
        setTopic(newTopic);
        setCurrentProbe(GET_ROOT_PROBE(newTopic));
        setHypotheses([]);
        setState('analyzing');
        setTimeout(() => setState('probing'), 1000);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans relative overflow-x-hidden flex flex-col">
            
            {/* Dev Controls */}
            <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <button onClick={() => navigate('/experiments')} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition-colors">
                    ← Exit Lab
                </button>
                <div className="pointer-events-auto flex flex-col gap-2 items-end">
                    <div className="text-[10px] font-mono text-cyan-500 uppercase">State: {state}</div>
                    <div className="flex gap-1">
                        <button onClick={handleReset} className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded text-[10px] border border-white/10">Reset</button>
                        <button onClick={() => setState('rescue')} className="px-2 py-1 bg-red-500/20 hover:bg-red-500/40 text-red-300 rounded text-[10px] border border-red-500/30">Rescue</button>
                    </div>
                    {/* Quick Topic Switch for Testing */}
                    <div className="flex gap-1">
                        <button onClick={() => handleTopicChange('Music')} className="px-2 py-1 bg-blue-500/20 text-blue-200 rounded text-[10px]">🎵 Music</button>
                        <button onClick={() => handleTopicChange('Спорт')} className="px-2 py-1 bg-green-500/20 text-green-200 rounded text-[10px]">🏃 Sport</button>
                        <button onClick={() => handleTopicChange('Уют')} className="px-2 py-1 bg-orange-500/20 text-orange-200 rounded text-[10px]">🏠 Cozy</button>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col items-center pt-24 pb-20 px-4 max-w-4xl mx-auto w-full">
                
                {/* --- CONVERSATION HEADER --- */}
                <div className="mb-8 w-full max-w-2xl flex items-end gap-4 min-h-[100px]">
                    <div className="mb-1 relative shrink-0">
                        <Mascot 
                            emotion={state === 'rescue' ? 'surprised' : state === 'hypothesizing' ? 'happy' : 'thinking'} 
                            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" 
                            accessory="none"
                            variant="default"
                        />
                    </div>
                    
                    {state === 'analyzing' || state === 'init' ? (
                        <ChatBubble isTyping={true}>...</ChatBubble>
                    ) : (
                        <ChatBubble>
                            {state === 'probing' && currentProbe && (
                                <>
                                    <p>{currentProbe.question}</p>
                                    <p className="text-sm text-gray-400 mt-1 font-normal">{currentProbe.subtitle}</p>
                                </>
                            )}
                            {state === 'hypothesizing' && <p>Я проанализировал данные. Вот 3 направления, которые сработают лучше всего:</p>}
                            {state === 'rescue' && <p>Хм, кажется я зашел в тупик. Попробуем зайти с другой стороны?</p>}
                            {state === 'feed' && <p>Вот подборка товаров по этому направлению.</p>}
                        </ChatBubble>
                    )}
                </div>

                {/* --- INTERACTIVE CONTENT AREA --- */}
                <div className="w-full flex-grow flex flex-col items-center justify-center transition-opacity duration-300">
                    
                    {(state === 'analyzing' || state === 'init') && (
                        <div className="h-32"></div> // Spacer
                    )}

                    {state === 'probing' && currentProbe && (
                        <ProbeView 
                            data={currentProbe}
                            onConfirm={handleProbeSubmit} 
                        />
                    )}

                    {state === 'hypothesizing' && (
                        <div className="w-full max-w-xl animate-fade-in-up">
                            {hypotheses.map(h => (
                                <HypothesisCard 
                                    key={h.id} 
                                    data={h} 
                                    onExpand={() => handleExpand(h.id)} 
                                    onSelect={() => handleExpand(h.id)}
                                    onReject={(reason) => handleDislike(h.id, reason)} 
                                />
                            ))}
                            <button onClick={() => setState('rescue')} className="w-full py-4 rounded-xl border-2 border-dashed border-white/10 text-white/40 font-bold hover:text-white hover:border-white/30 transition-all mt-4 mb-12">
                                Всё не то, попробуем что-то другое?
                            </button>
                        </div>
                    )}

                    {state === 'feed' && (
                        <div className="w-full animate-fade-in-up">
                            <div className="flex items-center gap-2 mb-8">
                                <button onClick={() => setState('hypothesizing')} className="text-white/50 hover:text-white font-bold bg-white/10 px-4 py-2 rounded-full transition-colors">← Назад к гипотезам</button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {MOCK_DB_GIFTS.slice(0, 8).map((g, i) => (
                                    <GiftCard key={g.id} gift={g} />
                                ))}
                            </div>
                        </div>
                    )}

                    {state === 'rescue' && (
                        <RescueView onPivot={(mode) => {
                            setState('analyzing');
                            setTimeout(() => {
                                handleTopicChange(mode === 'topic' ? 'Уют' : 'Спорт');
                            }, 1500);
                        }} />
                    )}
                </div>

            </div>
        </div>
    );
};
