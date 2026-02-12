
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizAnswers } from '../domain/types';
import { analytics } from '../utils/analytics';
import { Logo } from '../components/Logo';

// --- Constants ---

const RELATIONSHIPS = [
    'Партнер ❤️', 'Родитель 👪', 'Друг 🍻', 'Коллега 💼', 'Ребенок 🧸', 'Родственник 🌳'
];

const OCCASIONS = [
    'ДР 🎂', 'Новый год 🎄', 'Годовщина 💍', 'Просто так ✨', 'Новоселье 🏠', 'Извинение 🙏'
];

const GOALS = [
    { id: 'impress', label: 'Впечатлить 🤩', desc: 'Wow-эффект' },
    { id: 'care', label: 'Проявить заботу 🧣', desc: 'Тепло и уют' },
    { id: 'check', label: 'Закрыть вопрос ✅', desc: 'Без нервов' },
    { id: 'growth', label: 'Вдохновить 🚀', desc: 'На развитие' }
];

const BUDGETS = [
    { id: '1000', label: 'до 1 000 ₽' },
    { id: '3000', label: 'до 3 000 ₽' },
    { id: '5000', label: 'до 5 000 ₽' },
    { id: '10000', label: 'до 10 000 ₽' },
    { id: 'unlimited', label: 'Не важно 💎' }
];

// --- PRESETS (Dev/Quick) ---
const PRESETS = [
    {
        label: '🎸 Рокер',
        data: { name: 'Алекс', gender: 'male', relationship: 'Друг', occasion: 'ДР', interests: 'Рок, Гитары, Винил, Концерты, Пиво', goal: 'impress', budget: '5000' }
    },
    {
        label: '🏃 Спортсменка',
        data: { name: 'Катя', gender: 'female', relationship: 'Партнер', occasion: 'Годовщина', interests: 'Бег, Йога, ЗОЖ, Путешествия, Смузи', goal: 'care', budget: '10000' }
    },
    {
        label: '💼 Трудоголик',
        data: { name: 'Босс', gender: 'male', relationship: 'Коллега', occasion: 'Новый год', interests: 'Бизнес, Кофе, Стартапы, Гаджеты, Эффективность', goal: 'check', budget: '3000' }
    },
    {
        label: '🏡 Домохозяйка',
        data: { name: 'Мама', gender: 'female', relationship: 'Родитель', occasion: 'ДР', interests: 'Сад, Вязание, Кулинария, Уют, Сериалы', goal: 'care', budget: '5000' }
    }
];

// --- COMPONENTS ---

const StepWrapper: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">{title}</h2>
        {subtitle && <p className="text-white/80 mb-8 text-lg font-medium">{subtitle}</p>}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const OptionButton: React.FC<{ label: string; desc?: string; selected: boolean; onClick: () => void }> = ({ label, desc, selected, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden shadow-lg ${
            selected 
            ? 'bg-white text-brand-dark border-white ring-4 ring-brand-purple/20' 
            : 'bg-white/10 text-white border-white/20 hover:bg-white/20 hover:border-white/40'
        }`}
    >
        <div className="relative z-10">
            <div className="font-bold text-lg">{label}</div>
            {desc && <div className={`text-sm mt-1 font-medium ${selected ? 'text-gray-500' : 'text-white/60'}`}>{desc}</div>}
        </div>
        {selected && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl text-brand-purple">✅</div>}
    </button>
);

export const Quiz: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const TOTAL_STEPS = 6;
    
    // Form State
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'unisex'>('unisex');
    const [relationship, setRelationship] = useState('');
    const [occasion, setOccasion] = useState('');
    const [interests, setInterests] = useState('');
    const [goal, setGoal] = useState('');
    const [budget, setBudget] = useState('');

    const startTime = useRef(Date.now());

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => Math.max(0, s - 1));

    const finish = (override?: any) => {
        const data = override || { name, gender, relationship, occasion, interests, goal, budget };
        
        const standardAnswers: QuizAnswers = {
            name: data.name || 'Друг',
            ageGroup: '30', // Default
            recipientGender: data.gender,
            relationship: data.relationship,
            occasion: data.occasion,
            vibe: 'Experimental',
            city: 'Москва',
            interests: data.interests,
            budget: data.budget,
            // Defaults for new fields
            painPoints: [],
            roles: [],
            roleConfidence: 'sure',
            archetype: 'aesthetic',
            selfWorth: '',
            conversationTopics: data.interests,
            topicDuration: 'long_term',
            painStyle: 'endurer',
            riskyTopics: false,
        };

        localStorage.setItem('gifty_answers', JSON.stringify(standardAnswers));
        analytics.quizCompleted(TOTAL_STEPS, (Date.now() - startTime.current) / 1000);
        navigate('/results');
    };

    return (
        <div className="min-h-screen bg-[#0F172A]/80 backdrop-blur-xl text-white flex flex-col relative overflow-hidden font-sans">
            
            {/* Header */}
            <div className="p-6 flex justify-between items-center relative z-20">
                <div className="flex items-center gap-4">
                    <button onClick={step === 0 ? () => navigate('/') : back} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        ←
                    </button>
                    <Logo variant="white" className="scale-75 origin-left" onClick={() => navigate('/')}/>
                </div>
                <div className="text-xs font-bold text-white/50">{step + 1}/{TOTAL_STEPS}</div>
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col justify-center px-6 pb-20 relative z-10">
                
                {/* 0. START / PRESETS */}
                {step === 0 && (
                    <StepWrapper title="Кто счастливчик?" subtitle="Кому будем выбирать подарок?">
                        {/* Quick Fill Buttons */}
                        <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-2xl animate-fade-in backdrop-blur-md">
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">🚀 Быстрый старт (Пресеты)</p>
                            <div className="flex flex-wrap gap-2">
                                {PRESETS.map(p => (
                                    <button 
                                        key={p.label}
                                        onClick={() => finish(p.data)}
                                        className="px-4 py-2 bg-brand-blue/20 hover:bg-brand-blue text-white rounded-lg text-xs font-bold transition-all border border-brand-blue/30"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <input 
                            type="text" 
                            autoFocus
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Имя (Саша, Женя...)"
                            className="w-full bg-transparent border-b-2 border-white/20 text-4xl font-black py-4 outline-none focus:border-brand-blue placeholder-white/20 transition-colors"
                        />
                        
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {[
                                { id: 'male', label: '👨 Он' },
                                { id: 'female', label: '👩 Она' },
                                { id: 'unisex', label: '✨ Неважно' }
                            ].map(g => (
                                <button
                                    key={g.id}
                                    onClick={() => setGender(g.id as any)}
                                    className={`py-4 rounded-xl font-bold border transition-all ${
                                        gender === g.id 
                                        ? 'bg-white text-black border-white' 
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                    }`}
                                >
                                    {g.label}
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            disabled={!name}
                            onClick={next}
                            className="w-full py-4 bg-brand-blue hover:bg-brand-purple text-white rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 transition-all"
                        >
                            Далее
                        </button>
                    </StepWrapper>
                )}

                {/* 1. RELATIONSHIP */}
                {step === 1 && (
                    <StepWrapper title="Кем приходится?" subtitle={`Кто для вас ${name}?`}>
                        <div className="grid grid-cols-2 gap-3">
                            {RELATIONSHIPS.map(rel => (
                                <OptionButton 
                                    key={rel}
                                    label={rel}
                                    selected={relationship === rel}
                                    onClick={() => { setRelationship(rel); next(); }}
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

                {/* 2. OCCASION */}
                {step === 2 && (
                    <StepWrapper title="Повод" subtitle="Какой праздник на носу?">
                        <div className="grid grid-cols-2 gap-3">
                            {OCCASIONS.map(occ => (
                                <OptionButton 
                                    key={occ}
                                    label={occ}
                                    selected={occasion === occ}
                                    onClick={() => { setOccasion(occ); next(); }}
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

                {/* 3. INTERESTS */}
                {step === 3 && (
                    <StepWrapper title="Интересы" subtitle="Чем увлекается? О чем говорит?">
                        <textarea 
                            rows={4}
                            autoFocus
                            value={interests}
                            onChange={e => setInterests(e.target.value)}
                            placeholder="Например: Любит кофе, старый рок, котиков и программирование..."
                            className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-white text-lg outline-none focus:border-brand-blue transition-colors resize-none placeholder-white/30 backdrop-blur-sm"
                        />
                        <button 
                            onClick={next}
                            className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg shadow-lg mt-4 hover:scale-[1.02] transition-transform"
                        >
                            Продолжить
                        </button>
                    </StepWrapper>
                )}

                {/* 4. GOAL */}
                {step === 4 && (
                    <StepWrapper title="Цель" subtitle="Какую эмоцию хотите вызвать?">
                        <div className="grid grid-cols-1 gap-3">
                            {GOALS.map(g => (
                                <OptionButton 
                                    key={g.id}
                                    label={g.label}
                                    desc={g.desc}
                                    selected={goal === g.id}
                                    onClick={() => { setGoal(g.id); next(); }}
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

                {/* 5. BUDGET */}
                {step === 5 && (
                    <StepWrapper title="Бюджет" subtitle="На какую сумму рассчитываем?">
                        <div className="space-y-3">
                            {BUDGETS.map(b => (
                                <OptionButton 
                                    key={b.id}
                                    label={b.label}
                                    selected={budget === b.id}
                                    onClick={() => { setBudget(b.id); finish(); }}
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

            </div>
        </div>
    );
};
