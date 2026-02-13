
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizAnswers } from '../domain/types';
import { analytics } from '../utils/analytics';

// --- Constants & Options ---

const TIMING_OPTIONS = [
    { id: 'rush', label: '⚡️ 30 секунд', desc: 'У меня паника, нужен вариант срочно' },
    { id: 'normal', label: '🧘 2 минуты', desc: 'Хочу подумать, но без фанатизма' },
    { id: 'deep', label: '🔬 Глубокое погружение', desc: 'Готов отвечать на вопросы о детских травмах' }
];

const RELATIONSHIPS = [
    'Партнер ❤️', 'Родитель 👪', 'Друг 🍻', 'Коллега 💼', 'Ребенок 🧸', 'Родственник 🌳'
];

const OCCASIONS = [
    'ДР 🎂', 'Новый год 🎄', 'Годовщина 💍', 'Просто так ✨', 'Новоселье 🏠', 'Извинение 🙏'
];

const GOALS = [
    { id: 'impress', label: 'Впечатлить 🤩', desc: 'Чтобы челюсть отпала (Wow-эффект)' },
    { id: 'care', label: 'Проявить заботу 🧣', desc: 'Тепло, уют и польза' },
    { id: 'check', label: 'Закрыть вопрос ✅', desc: 'Чтобы было прилично и без нервов' },
    { id: 'growth', label: 'Вдохновить 🚀', desc: 'На новое хобби или развитие' }
];

const EFFORT_LEVELS = [
    { id: 'lazy', label: 'Lazy Mode', desc: 'Купить в 1 клик, желательно с доставкой' },
    { id: 'medium', label: 'С душой', desc: 'Готов красиво упаковать и подписать' },
    { id: 'hard', label: 'Maker', desc: 'Готов собрать квест или сложный набор' }
];

const DEADLINES = [
    { id: 'today', label: 'Сегодня / Завтра 🔥' },
    { id: 'week', label: 'В течение недели 📅' },
    { id: 'month', label: 'Есть время (месяц+) ⏳' }
];

const COMPLAINTS = [
    { id: 'stress', label: 'Устал / Стресс 🤯', desc: 'Нужен отдых (Permission)' },
    { id: 'boredom', label: 'Скучно / День сурка 😐', desc: 'Нужны эмоции (Catalyst)' },
    { id: 'broken', label: 'Всё ломается / Неудобно 🛠', desc: 'Нужен апгрейд (Optimizer)' },
    { id: 'cozy', label: 'Дома / на работе неуютно 🥶', desc: 'Нужен комфорт (Anchor)' }
];

const WEEKENDS = [
    { id: 'learn', label: 'Изучение нового 🧠', desc: 'Челлендж, спорт, курсы' },
    { id: 'relax', label: 'Полный релакс 🛁', desc: 'Тишина, сон, сериал' },
    { id: 'party', label: 'Тусовка / Люди 🎉', desc: 'Гости, бар, мероприятие' },
    { id: 'nesting', label: 'Улучшение гнезда 🪴', desc: 'Уборка, декор, готовка' }
];

const MATERIAL_ATTITUDES = [
    { id: 'status', label: '💎 Статус и бренд', desc: 'Важно, как это выглядит и сколько стоит' },
    { id: 'utility', label: '⚙️ Удобство и польза', desc: 'Лишь бы работало и не ломалось' },
    { id: 'aesthetic', label: '🎨 Эстетика', desc: 'Обожает красивые мелочи и декор' },
    { id: 'memory', label: '📸 История и память', desc: 'Ценит смыслы, а не вещи' }
];

const TEST_PERSONAS = [
    {
        label: '🎸 Музыкант',
        data: {
            name: 'Алекс', gender: 'male', relationship: 'Друг', occasion: 'ДР',
            topics: 'Рок, Гитары, Винил', hobbies: 'Играет в группе, коллекционирует пластинки',
            complaint: 'boredom', weekend: 'party', attitude: 'aesthetic',
            goal: 'impress', effort: 'medium', budget: '5000', deadline: 'week',
            interests: 'Музыка'
        }
    },
    {
        label: '🏃 Спортсмен',
        data: {
            name: 'Катя', gender: 'female', relationship: 'Партнер', occasion: 'Годовщина',
            topics: 'Марафон, ЗОЖ, Триатлон', hobbies: 'Бег, Йога, Смузи',
            complaint: 'stress', weekend: 'learn', attitude: 'utility',
            goal: 'care', effort: 'high', budget: '10000', deadline: 'month',
            interests: 'Спорт'
        }
    },
    {
        label: '🏡 Домосед',
        data: {
            name: 'Мама', gender: 'female', relationship: 'Родитель', occasion: 'Новый год',
            topics: 'Сад, Рецепты, Внуки', hobbies: 'Вязание, Сериалы, Выпечка',
            complaint: 'cozy', weekend: 'nesting', attitude: 'memory',
            goal: 'care', effort: 'lazy', budget: '3000', deadline: 'week',
            interests: 'Уют'
        }
    }
];

// --- Components ---

const StepWrapper: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">{title}</h2>
        {subtitle && <p className="text-white/50 mb-8 text-lg">{subtitle}</p>}
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const OptionButton: React.FC<{ 
    label: string; 
    desc?: string; 
    selected: boolean; 
    onClick: () => void;
    className?: string;
}> = ({ label, desc, selected, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden ${
            selected 
            ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
            : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/20'
        } ${className}`}
    >
        <div className="relative z-10">
            <div className="font-bold text-lg">{label}</div>
            {desc && <div className={`text-sm mt-1 font-medium ${selected ? 'text-black/60' : 'text-white/40'}`}>{desc}</div>}
        </div>
        {selected && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl">✅</div>}
    </button>
);

// --- Main Component ---

export const ExperimentQuiz: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const TOTAL_STEPS = 10;
    
    // State
    const [timing, setTiming] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'unisex' | null>(null);
    const [relationship, setRelationship] = useState('');
    const [occasion, setOccasion] = useState('');
    const [deadline, setDeadline] = useState('');
    
    // New Deep Profile Fields
    const [topics, setTopics] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [complaint, setComplaint] = useState('');
    const [weekend, setWeekend] = useState('');
    const [attitude, setAttitude] = useState('');
    const [excludes, setExcludes] = useState('');

    const [goal, setGoal] = useState('');
    const [effort, setEffort] = useState('');
    const [budget, setBudget] = useState('');

    // Analytics Timer
    const startTime = useRef(Date.now());

    useEffect(() => {
        // Dark BG for experiment
        document.body.style.backgroundColor = '#0F172A';
        return () => { document.body.style.backgroundColor = ''; };
    }, []);

    const next = () => setStep(s => s + 1);
    const back = () => setStep(s => Math.max(0, s - 1));

    const finish = (overrideData?: any) => {
        const data = overrideData || {
            name, gender, relationship, occasion,
            topics, hobbies, complaint, weekend, attitude, excludes,
            goal, effort, budget, deadline
        };

        // Build rich context for the AI
        const richInterests = [
            data.topics ? `Темы разговоров: ${data.topics}` : '',
            data.hobbies ? `Увлечения: ${data.hobbies}` : '',
            data.interests ? `Интерес: ${data.interests}` : '', // For personas
            data.complaint ? `Жалоба (проблема): ${COMPLAINTS.find(c => c.id === data.complaint)?.label || data.complaint}` : '',
            data.weekend ? `Идеальный выходной: ${WEEKENDS.find(w => w.id === data.weekend)?.label || data.weekend}` : '',
            data.attitude ? `Отношение к вещам: ${MATERIAL_ATTITUDES.find(a => a.id === data.attitude)?.label || data.attitude}` : '',
            `Цель подарка: ${GOALS.find(g => g.id === data.goal)?.label || data.goal}`,
            `Готовность заморочиться: ${EFFORT_LEVELS.find(e => e.id === data.effort)?.label || data.effort}`,
            `Дедлайн: ${DEADLINES.find(d => d.id === data.deadline)?.label || data.deadline}`
        ].filter(Boolean).join('. ');

        // Map to standard QuizAnswers
        const standardAnswers: QuizAnswers = {
            name: data.name || 'Друг',
            age: 30, // Default to 30 for experiment as age selection was skipped
            recipientGender: data.gender,
            relationship: data.relationship,
            occasion: data.occasion,
            vibe: 'Experimental',
            city: 'Москва',
            interests: richInterests,
            budget: data.budget,
            exclude: data.excludes,
            
            // Experimental Fields Mapping
            painPoints: data.complaint ? [data.complaint] : [],
            roles: [], // Derived by backend
            roleConfidence: 'sure',
            archetype: data.attitude,
            selfWorth: '',
            conversationTopics: data.topics,
            topicDuration: 'long_term',
            painStyle: 'endurer',
            riskyTopics: false,
        };

        localStorage.setItem('gifty_answers', JSON.stringify(standardAnswers));
        
        analytics.quizCompleted(TOTAL_STEPS, (Date.now() - startTime.current) / 1000);
        navigate('/experiments/dialogue');
    };

    const applyPersona = (persona: typeof TEST_PERSONAS[0]) => {
        finish(persona.data);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col relative overflow-hidden font-sans">
            
            {/* Header */}
            <div className="p-6 flex justify-between items-center relative z-20">
                <button onClick={step === 0 ? () => navigate('/experiments') : back} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    ←
                </button>
                
                {/* Interactive Step Indicator */}
                <div className="flex gap-1.5 overflow-x-auto max-w-[240px] md:max-w-none px-2 no-scrollbar">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => setStep(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                i === step 
                                ? 'w-8 bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' 
                                : i < step 
                                    ? 'w-3 bg-white/50 hover:bg-white' 
                                    : 'w-3 bg-white/10 hover:bg-white/20'
                            }`}
                            title={`Step ${i + 1}`}
                        />
                    ))}
                </div>

                <div className="w-10 flex justify-end">
                    <span className="text-xs font-bold text-white/30">{step + 1}/{TOTAL_STEPS}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow flex flex-col justify-center px-6 pb-20 relative z-10">
                
                {/* STEP 0: TIMING & DEBUG */}
                {step === 0 && (
                    <StepWrapper title="Проверка связи" subtitle="Сколько у вас есть времени на этот тест?">
                        
                        {/* Debug Personas */}
                        <div className="mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">🛠 Быстрый тест (Dev Mode)</p>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                                {TEST_PERSONAS.map(p => (
                                    <button 
                                        key={p.label}
                                        onClick={() => applyPersona(p)}
                                        className="whitespace-nowrap px-4 py-2 bg-blue-500/20 hover:bg-blue-500 text-blue-200 hover:text-white rounded-lg text-xs font-bold transition-all border border-blue-500/30"
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {TIMING_OPTIONS.map(opt => (
                            <OptionButton 
                                key={opt.id}
                                label={opt.label}
                                desc={opt.desc}
                                selected={timing === opt.id}
                                onClick={() => { setTiming(opt.id); next(); }}
                            />
                        ))}
                    </StepWrapper>
                )}

                {/* STEP 1: IDENTITY */}
                {step === 1 && (
                    <StepWrapper title="Профиль" subtitle="Кому ищем подарок?">
                        <div className="space-y-6">
                            <input 
                                type="text" 
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Имя (Саша, Женя...)"
                                className="w-full bg-transparent border-b-2 border-white/20 text-4xl font-black py-4 outline-none focus:border-orange-500 placeholder-white/20 transition-colors"
                            />
                            
                            <div className="grid grid-cols-3 gap-3">
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
                                disabled={!name || !gender}
                                onClick={next}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                Далее
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 2: RELATIONSHIP */}
                {step === 2 && (
                    <StepWrapper title="Статус" subtitle={`Кем ${name} вам приходится?`}>
                        <div className="grid grid-cols-2 gap-3">
                            {RELATIONSHIPS.map(rel => (
                                <OptionButton 
                                    key={rel}
                                    label={rel}
                                    selected={relationship === rel}
                                    onClick={() => { setRelationship(rel); next(); }}
                                    className="h-full"
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 3: OCCASION & DEADLINE */}
                {step === 3 && (
                    <StepWrapper title="Контекст" subtitle="По какому поводу и когда?">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Повод</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {OCCASIONS.map(occ => (
                                        <button
                                            key={occ}
                                            onClick={() => setOccasion(occ)}
                                            className={`py-3 px-4 rounded-lg text-sm font-bold border text-left transition-all ${
                                                occasion === occ ? 'bg-orange-500/20 border-orange-500 text-orange-200' : 'bg-white/5 border-white/10 text-white/70'
                                            }`}
                                        >
                                            {occ}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Когда вручаем?</label>
                                <div className="space-y-2">
                                    {DEADLINES.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => setDeadline(d.id)}
                                            className={`w-full py-3 px-4 rounded-lg text-sm font-bold border text-left transition-all flex justify-between ${
                                                deadline === d.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/70'
                                            }`}
                                        >
                                            <span>{d.label}</span>
                                            {deadline === d.id && <span>✓</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                disabled={!occasion || !deadline}
                                onClick={next}
                                className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 mt-4"
                            >
                                Продолжить
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 4: DEEP PROFILE 1 (Topics & Hobbies) */}
                {step === 4 && (
                    <StepWrapper title="Карта личности" subtitle="Помогите нам понять, чем человек живет">
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">О чем может говорить часами?</label>
                                <input 
                                    type="text"
                                    value={topics}
                                    onChange={e => setTopics(e.target.value)}
                                    placeholder="Коты, биткоин, история Рима..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors"
                                />
                            </div>
                            
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">3-5 вещей, которыми пользуется/увлекается</label>
                                <textarea 
                                    rows={3}
                                    value={hobbies}
                                    onChange={e => setHobbies(e.target.value)}
                                    placeholder="Кофе, бег, макбук, йога, вино..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none transition-colors resize-none"
                                />
                            </div>

                            <button onClick={next} className="w-full py-4 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-all">
                                Далее
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 5: DEEP PROFILE 2 (Psychology) */}
                {step === 5 && (
                    <StepWrapper title="Психотип" subtitle="Что сейчас происходит в жизни?">
                        <div className="space-y-6">
                            {/* Complaint */}
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">На что жаловался в последнее время?</label>
                                <select 
                                    value={complaint}
                                    onChange={e => setComplaint(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none appearance-none"
                                >
                                    <option value="">Не жаловался / Не знаю</option>
                                    {COMPLAINTS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                                </select>
                            </div>

                            {/* Weekend */}
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Идеальный выходной — это...</label>
                                <select 
                                    value={weekend}
                                    onChange={e => setWeekend(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange-500 outline-none appearance-none"
                                >
                                    <option value="">Сложно сказать</option>
                                    {WEEKENDS.map(w => <option key={w.id} value={w.id}>{w.label}</option>)}
                                </select>
                            </div>

                            {/* Attitude */}
                            <div>
                                <label className="text-xs font-bold text-white/40 uppercase mb-2 block">Отношение к вещам</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {MATERIAL_ATTITUDES.map(att => (
                                        <button
                                            key={att.id}
                                            onClick={() => { setAttitude(att.id); setTimeout(next, 200); }}
                                            className={`text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                                                attitude === att.id 
                                                ? 'bg-orange-500/20 border-orange-500 text-white' 
                                                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                                            }`}
                                        >
                                            {att.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 6: EXCLUDES */}
                {step === 6 && (
                    <StepWrapper title="Стоп-лист" subtitle="Что точно НЕ дарить?">
                        <div className="space-y-6">
                            <input 
                                type="text"
                                value={excludes}
                                onChange={e => setExcludes(e.target.value)}
                                placeholder="Алкоголь, статуэтки, носки, сладкое..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-red-500 outline-none transition-colors"
                            />
                            <p className="text-xs text-white/30">Перечислите через запятую категории, которые вызовут разочарование или неуместны.</p>
                            
                            <button onClick={next} className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg shadow-lg">
                                Перейти к стратегии
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 7: STRATEGY (GOAL & EFFORT) */}
                {step === 7 && (
                    <StepWrapper title="Стратегия" subtitle="Какую эмоцию хотим вызвать?">
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-3">
                                {GOALS.map(g => (
                                    <OptionButton 
                                        key={g.id}
                                        label={g.label}
                                        desc={g.desc}
                                        selected={goal === g.id}
                                        onClick={() => setGoal(g.id)}
                                    />
                                ))}
                            </div>
                            
                            {goal && (
                                <div className="animate-fade-in pt-4 border-t border-white/10">
                                    <label className="text-xs font-bold text-white/40 uppercase mb-3 block">Готовность заморочиться</label>
                                    <div className="flex gap-2">
                                        {EFFORT_LEVELS.map(eff => (
                                            <button
                                                key={eff.id}
                                                onClick={() => { setEffort(eff.id); setTimeout(next, 200); }}
                                                className={`flex-1 p-3 rounded-xl border text-xs font-bold transition-all ${
                                                    effort === eff.id 
                                                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg scale-105' 
                                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                            >
                                                {eff.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 8: BUDGET */}
                {step === 8 && (
                    <StepWrapper title="Ресурс" subtitle="Какой бюджет планируем?">
                        <div className="space-y-8">
                            <div className="relative">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0"
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value.replace(/\D/g, ''))}
                                    className="w-full bg-transparent text-center text-6xl font-black text-white placeholder-white/10 outline-none border-b-2 border-white/20 focus:border-orange-500 transition-all pb-4"
                                />
                                <span className="absolute top-1/2 right-4 -translate-y-1/2 text-2xl font-bold text-white/30">₽</span>
                            </div>
                            
                            <div className="flex flex-wrap justify-center gap-3">
                                {[1000, 3000, 5000, 10000, 20000].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setBudget(amount.toString())}
                                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/5"
                                    >
                                        {amount.toLocaleString()}
                                    </button>
                                ))}
                            </div>

                            <button 
                                disabled={!budget || parseInt(budget) === 0}
                                onClick={next}
                                className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 mt-4"
                            >
                                Финализировать
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 9: REVIEW & LAUNCH */}
                {step === 9 && (
                    <div className="max-w-md mx-auto w-full animate-pop">
                        <div className="bg-white/10 rounded-3xl p-8 border border-white/10 mb-8 backdrop-blur-md">
                            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                                <span className="bg-green-500 w-3 h-3 rounded-full animate-pulse"></span>
                                Готовность к запуску
                            </h3>
                            
                            <div className="space-y-4 font-mono text-sm text-white/80">
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-white/40">Цель</span>
                                    <span>{name} ({gender === 'male' ? 'М' : 'Ж'})</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-white/40">Миссия</span>
                                    <span>{GOALS.find(g => g.id === goal)?.label}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-white/40">Психотип</span>
                                    <span>{MATERIAL_ATTITUDES.find(a => a.id === attitude)?.label || 'Не указан'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-2">
                                    <span className="text-white/40">Дедлайн</span>
                                    <span className="text-red-300">{DEADLINES.find(d => d.id === deadline)?.label}</span>
                                </div>
                                <div className="flex justify-between pt-2">
                                    <span className="text-white/40">Бюджет</span>
                                    <span className="text-xl font-bold text-green-400">{budget} ₽</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => finish()}
                            className="w-full py-5 bg-white text-black rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform"
                        >
                            Сгенерировать
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};
