
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Mascot } from '../components/Mascot';
import { GiftCard } from '../components/GiftCard';
import { GiftDetailsModal } from '../components/GiftDetailsModal';
import { DialogueHypothesis, Gift, QuizAnswers } from '../domain/types';
import { MOCK_DB_GIFTS } from '../api/mock/data';
import { api } from '../api';

// --- CONFIG ---
const AI_API_KEY = process.env.API_KEY || '';

const SYSTEM_INSTRUCTION = `
Ты — Gifty, эмпатичный AI-помощник.
Твоя задача: на основе профиля пользователя предложить 3 креативные ГИПОТЕЗЫ подарка.
Гипотеза — это стратегия, направление мысли (например, "Уютный вечер", "Новые впечатления").
Используй методологию GUTG: Mirror (отражение личности), Optimizer (улучшение быта), Catalyst (вдохновение).
Ответ должен быть строго в JSON формате.
`;

const HYPOTHESES_SCHEMA: Schema = {
    type: Type.OBJECT,
    properties: {
        items: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING },
                    title: { type: Type.STRING },
                    gutgType: { type: Type.STRING, enum: ["Mirror", "Optimizer", "Catalyst", "Anchor"] },
                    description: { type: Type.STRING },
                    searchKeywords: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "Keywords to find real products in DB"
                    }
                },
                required: ["id", "title", "gutgType", "description", "searchKeywords"]
            }
        }
    },
    required: ["items"]
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

export const Results: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [state, setState] = useState<'analyzing' | 'hypothesizing' | 'feed' | 'error'>('analyzing');
    const [answers, setAnswers] = useState<QuizAnswers | null>(null);
    const [hypotheses, setHypotheses] = useState<DialogueHypothesis[]>([]);
    const [selectedHypothesis, setSelectedHypothesis] = useState<DialogueHypothesis | null>(null);
    const [feedGifts, setFeedGifts] = useState<Gift[]>([]);
    
    // Modal
    const [viewGift, setViewGift] = useState<Gift | null>(null);

    // AI Ref
    const aiRef = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        if (AI_API_KEY) {
            aiRef.current = new GoogleGenAI({ apiKey: AI_API_KEY });
        }
        
        const stored = localStorage.getItem('gifty_answers');
        if (!stored) {
            navigate('/quiz');
            return;
        }
        const parsed = JSON.parse(stored);
        setAnswers(parsed);
        
        generateHypotheses(parsed);
    }, []);

    const generateHypotheses = async (data: QuizAnswers) => {
        setState('analyzing');
        
        if (!aiRef.current) {
            // Fallback for demo without API Key
            setTimeout(() => {
                const mockHypotheses: DialogueHypothesis[] = [
                    { id: 'h1', title: 'Вдохновение', gutgType: 'Catalyst', description: 'Что-то для новых начинаний.', previewGifts: MOCK_DB_GIFTS.slice(0,3) },
                    { id: 'h2', title: 'Уют', gutgType: 'Anchor', description: 'Для дома и души.', previewGifts: MOCK_DB_GIFTS.slice(3,6) },
                    { id: 'h3', title: 'Статус', gutgType: 'Mirror', description: 'Подчеркнуть его стиль.', previewGifts: MOCK_DB_GIFTS.slice(6,9) }
                ];
                setHypotheses(mockHypotheses);
                setState('hypothesizing');
            }, 2000);
            return;
        }

        try {
            const model = aiRef.current.models.getGenerativeModel({ 
                model: 'gemini-2.5-flash', 
                systemInstruction: SYSTEM_INSTRUCTION 
            });

            const prompt = `
                Context:
                Name: ${data.name}
                Gender: ${data.recipientGender}
                Relation: ${data.relationship}
                Occasion: ${data.occasion}
                Interests: ${data.interests}
                Budget: ${data.budget}
                
                Generate 3 distinct gift hypotheses.
            `;

            const result = await model.generateContent({
                contents: { role: 'user', parts: [{ text: prompt }] },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: HYPOTHESES_SCHEMA
                }
            });

            const rawData = JSON.parse(result.response.text());
            
            // Map AI response to Domain objects + enrich with mock images/prices for preview
            const enrichedHypotheses = rawData.items.map((h: any) => ({
                id: h.id,
                title: h.title,
                gutgType: h.gutgType,
                description: h.description,
                // Simple heuristic: pick random gifts from MOCK_DB for preview
                previewGifts: MOCK_DB_GIFTS.sort(() => 0.5 - Math.random()).slice(0, 3) 
            }));

            setHypotheses(enrichedHypotheses);
            setState('hypothesizing');

        } catch (e) {
            console.error(e);
            setState('error');
        }
    };

    const handleSelectHypothesis = async (h: DialogueHypothesis) => {
        setSelectedHypothesis(h);
        setState('analyzing'); // Brief loading
        
        // Simulate fetching gifts matching this hypothesis
        // In real app: api.gifts.search(h.searchKeywords)
        setTimeout(async () => {
            const gifts = await api.gifts.list({ limit: 12 });
            setFeedGifts(gifts);
            setState('feed');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white font-sans relative overflow-x-hidden flex flex-col">
            
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-40 p-4 flex justify-between items-start pointer-events-none">
                <button onClick={() => navigate('/quiz')} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition-colors">
                    ← Параметры
                </button>
                <button onClick={() => navigate('/')} className="pointer-events-auto bg-black/20 hover:bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold border border-white/10 transition-colors">
                    Домой
                </button>
            </div>

            <div className="flex-grow flex flex-col items-center pt-24 pb-20 px-4 max-w-4xl mx-auto w-full">
                
                {/* --- CONVERSATION HEADER --- */}
                <div className="mb-8 w-full max-w-2xl flex items-end gap-4 min-h-[100px]">
                    <div className="mb-1 relative shrink-0">
                        <Mascot 
                            emotion={state === 'feed' ? 'happy' : 'thinking'} 
                            className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" 
                            accessory="none"
                            variant="default"
                        />
                    </div>
                    
                    <ChatBubble isTyping={state === 'analyzing'}>
                        {state === 'analyzing' && '...'}
                        {state === 'hypothesizing' && <p>Я проанализировал профиль <b>{answers?.name}</b>. Вот 3 стратегии, которые сработают лучше всего:</p>}
                        {state === 'feed' && <p>Отлично! Вот подборка товаров для стратегии <b>{selectedHypothesis?.title}</b>.</p>}
                        {state === 'error' && <p>Упс, мои нейроны запутались. Попробуй обновить страницу.</p>}
                    </ChatBubble>
                </div>

                {/* --- CONTENT AREA --- */}
                <div className="w-full flex-grow flex flex-col items-center transition-opacity duration-300">
                    
                    {state === 'hypothesizing' && (
                        <div className="w-full max-w-xl animate-fade-in-up space-y-6">
                            {hypotheses.map(h => (
                                <div key={h.id} className="bg-slate-800 border border-white/10 rounded-[2rem] overflow-hidden shadow-lg animate-pop group transition-all hover:border-brand-blue/50 hover:shadow-[0_0_30px_rgba(0,0,0,0.3)]">
                                    <div className="p-6 pb-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded text-black ${
                                                h.gutgType === 'Mirror' ? 'bg-purple-300' : 
                                                h.gutgType === 'Optimizer' ? 'bg-blue-300' : 
                                                h.gutgType === 'Catalyst' ? 'bg-orange-300' : 'bg-green-300'
                                            }`}>
                                                {h.gutgType}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2">{h.title}</h3>
                                        <p className="text-white/60 text-sm leading-relaxed">{h.description}</p>
                                    </div>

                                    {/* Preview Strip */}
                                    <div className="px-6 pb-4 flex gap-3 overflow-hidden opacity-60 group-hover:opacity-100 transition-opacity">
                                        {h.previewGifts.map((gift, i) => (
                                            <div key={i} className="w-16 h-16 rounded-lg bg-slate-700 overflow-hidden relative">
                                                <img src={gift.imageUrl || ''} className="w-full h-full object-cover" alt="" />
                                            </div>
                                        ))}
                                        <div className="w-16 h-16 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white/30">
                                            +20
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 pt-0">
                                        <button 
                                            onClick={() => handleSelectHypothesis(h)} 
                                            className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-brand-blue hover:text-white transition-all shadow-lg flex items-center justify-center gap-2"
                                        >
                                            <span>🎯</span> Показать товары
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {state === 'feed' && (
                        <div className="w-full animate-fade-in-up">
                            <button 
                                onClick={() => setState('hypothesizing')}
                                className="mb-6 text-white/50 hover:text-white text-sm font-bold flex items-center gap-2 transition-colors"
                            >
                                ← Назад к стратегиям
                            </button>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
                                {feedGifts.map((g, i) => (
                                    <GiftCard key={g.id} gift={g} onClick={setViewGift} rank={i} />
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Detail Modal */}
            {viewGift && (
                <GiftDetailsModal 
                    gift={viewGift} 
                    isOpen={!!viewGift} 
                    onClose={() => setViewGift(null)} 
                    answers={answers} 
                    onWishlistChange={() => {}} 
                />
            )}
        </div>
    );
};
