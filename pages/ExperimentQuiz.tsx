
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizAnswers } from '../domain/types';
import { analytics } from '../utils/analytics';
import { useDevMode } from '../components/DevModeContext';

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

const BUDGET_OPTIONS = [
    { id: '1000', label: '💸 До 1 000 ₽', desc: 'Чисто символически' },
    { id: '3000', label: '💰 1 000 - 3 000 ₽', desc: 'Золотая середина' },
    { id: '5000', label: '🎁 3 000 - 5 000 ₽', desc: 'Хороший подарок' },
    { id: '10000', label: '💎 5 000 - 10 000 ₽', desc: 'Значимый повод' },
    { id: 'unlimited', label: '💳 Не важно', desc: 'Главное — эмоции' }
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
            name: 'Алекс', gender: 'male' as const, relationship: 'Друг', occasion: 'ДР',
            topics: 'Рок, Гитары, Винил', hobbies: 'Играет в группе, коллекционирует пластинки',
            complaint: 'boredom', weekend: 'party', attitude: 'aesthetic',
            goal: 'impress', effort: 'medium', budget: '5000', deadline: 'week',
            interests: 'Музыка'
        }
    },
    {
        label: '🏃 Спортсмен',
        data: {
            name: 'Катя', gender: 'female' as const, relationship: 'Партнер', occasion: 'Годовщина',
            topics: 'Марафон, ЗОЖ, Триатлон', hobbies: 'Бег, Йога, Смузи',
            complaint: 'stress', weekend: 'learn', attitude: 'utility',
            goal: 'care', effort: 'hard', budget: '10000', deadline: 'month',
            interests: 'Спорт'
        }
    }
];

// --- Components ---

const StepWrapper: React.FC<{ children: React.ReactNode; title: string; subtitle?: string }> = ({ children, title, subtitle }) => (
    <div className="w-full max-w-xl mx-auto animate-fade-in-up">
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight leading-tight">{title}</h2>
        {subtitle && <p className="text-white/50 mb-8 text-lg font-medium">{subtitle}</p>}
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
        className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
            selected 
            ? 'bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.2)] scale-[1.02]' 
            : 'bg-white/5 text-white border-white/10 hover:bg-white/10 hover:border-white/30 active:scale-[0.98]'
        } ${className}`}
    >
        <div className="relative z-10">
            <div className="font-black text-lg">{label}</div>
            {desc && <div className={`text-sm mt-1 font-bold ${selected ? 'text-black/50' : 'text-white/30'}`}>{desc}</div>}
        </div>
        {selected && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xl animate-pop">✅</div>}
    </button>
);

// --- Main Component ---

export const ExperimentQuiz: React.FC = () => {
    const navigate = useNavigate();
    const { isDevMode } = useDevMode();
    const [step, setStep] = useState(0);
    const TOTAL_STEPS = 10;
    
    // Form State
    const [timing, setTiming] = useState('');
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'unisex' | null>(null);
    const [relationship, setRelationship] = useState('');
    const [occasion, setOccasion] = useState('');
    const [deadline, setDeadline] = useState('');
    const [topics, setTopics] = useState('');
    const [hobbies, setHobbies] = useState('');
    const [complaint, setComplaint] = useState('');
    const [weekend, setWeekend] = useState('');
    const [attitude, setAttitude] = useState('');
    const [excludes, setExcludes] = useState('');
    const [goal, setGoal] = useState('');
    const [effort, setEffort] = useState('');
    const [budget, setBudget] = useState('');

    const startTime = useRef(Date.now());

    const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    const back = () => setStep(s => Math.max(0, s - 1));

    const finish = (overrideData?: any) => {
        const data = overrideData || {
            name, gender, relationship, occasion,
            topics, hobbies, complaint, weekend, attitude, excludes,
            goal, effort, budget, deadline
        };

        const richInterests = [
            data.topics ? `Темы: ${data.topics}` : '',
            data.hobbies ? `Хобби: ${data.hobbies}` : '',
            data.interests ? `Интерес: ${data.interests}` : '',
            data.complaint ? `Проблема: ${data.complaint}` : '',
            data.weekend ? `Досуг: ${data.weekend}` : '',
            data.attitude ? `Отношение к вещам: ${data.attitude}` : '',
            `Цель: ${data.goal}`,
            `Дедлайн: ${data.deadline}`
        ].filter(Boolean).join('. ');

        const standardAnswers: QuizAnswers = {
            name: data.name || 'Друг',
            age: 30,
            recipientGender: data.gender,
            relationship: data.relationship,
            occasion: data.occasion,
            vibe: 'Experimental',
            city: 'Москва',
            interests: richInterests,
            budget: data.budget,
            exclude: data.excludes,
            painPoints: data.complaint ? [data.complaint] : [],
            roles: [],
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

    const handleJump = (s: number) => {
        if (isDevMode) setStep(s);
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white flex flex-col relative overflow-hidden font-sans">
            
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-blue-500/10 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-purple-500/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Header / Step Bar */}
            <div className="p-6 flex justify-between items-center relative z-20">
                <button onClick={step === 0 ? () => navigate('/experiments') : back} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-white/60 hover:text-white transition-all active:scale-90">
                    ←
                </button>
                
                <div className="flex gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                    {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                        <button 
                            key={i}
                            onClick={() => handleJump(i)}
                            className={`h-2 rounded-full transition-all duration-500 ${
                                i === step 
                                ? 'w-10 bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' 
                                : i < step 
                                    ? 'w-2 bg-white/40' 
                                    : 'w-2 bg-white/10'
                            } ${isDevMode ? 'hover:bg-cyan-200 cursor-pointer' : 'cursor-default'}`}
                            title={isDevMode ? `Перейти к шагу ${i + 1}` : undefined}
                        />
                    ))}
                </div>

                <div className="w-10 text-right">
                    <span className="text-[10px] font-black font-mono text-white/30">{step + 1}/{TOTAL_STEPS}</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-grow flex flex-col justify-center px-6 pb-20 relative z-10">
                
                {/* STEP 0: TIMING & PERSONAS */}
                {step === 0 && (
                    <StepWrapper title="Проверка готовности" subtitle="Сколько времени вы планируете уделить?">
                        {isDevMode && (
                            <div className="mb-8 p-5 bg-cyan-500/10 border border-cyan-500/20 rounded-3xl animate-pop">
                                <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-4">🛠 Dev Quick Access</p>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar">
                                    {TEST_PERSONAS.map(p => (
                                        <button 
                                            key={p.label}
                                            onClick={() => finish(p.data)}
                                            className="whitespace-nowrap px-5 py-2.5 bg-white/10 hover:bg-white text-white hover:text-black rounded-xl text-xs font-black transition-all border border-white/10 shadow-lg"
                                        >
                                            🚀 {p.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

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

                {/* STEP 1: NAME & GENDER */}
                {step === 1 && (
                    <StepWrapper title="Кто получатель?" subtitle="Нам нужно познакомиться.">
                        <div className="space-y-10">
                            <input 
                                type="text" 
                                autoFocus
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="Имя (Саша, Женя...)"
                                className="w-full bg-transparent border-b-2 border-white/10 text-5xl font-black py-4 outline-none focus:border-cyan-400 placeholder-white/5 transition-all text-center"
                            />
                            
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { id: 'male', label: '👨 Он' },
                                    { id: 'female', label: '👩 Она' },
                                    { id: 'unisex', label: '✨ Свой' }
                                ].map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => setGender(g.id as any)}
                                        className={`py-5 rounded-2xl font-black border transition-all ${
                                            gender === g.id 
                                            ? 'bg-white text-slate-900 border-white shadow-xl scale-105' 
                                            : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                        }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                            
                            <button 
                                disabled={!name || !gender}
                                onClick={next}
                                className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] disabled:opacity-30 disabled:shadow-none transition-all active:scale-95"
                            >
                                Продолжить
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 2: RELATIONSHIP */}
                {step === 2 && (
                    <StepWrapper title="Кем приходится?" subtitle={`Какие у вас отношения с ${name}?`}>
                        <div className="grid grid-cols-2 gap-4">
                            {RELATIONSHIPS.map(rel => (
                                <OptionButton 
                                    key={rel}
                                    label={rel}
                                    selected={relationship === rel}
                                    onClick={() => { setRelationship(rel); next(); }}
                                    className="h-full py-8 text-center"
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 3: OCCASION & DEADLINE */}
                {step === 3 && (
                    <StepWrapper title="Когда и зачем?" subtitle="Повод определяет всё.">
                        <div className="space-y-10">
                            <div className="grid grid-cols-2 gap-3">
                                {OCCASIONS.map(occ => (
                                    <button
                                        key={occ}
                                        onClick={() => setOccasion(occ)}
                                        className={`py-4 rounded-2xl text-sm font-black border transition-all ${
                                            occasion === occ ? 'bg-cyan-400 text-slate-900 border-cyan-400 shadow-lg' : 'bg-white/5 border-white/10 text-white/60'
                                        }`}
                                    >
                                        {occ}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] block text-center">Крайний срок</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {DEADLINES.map(d => (
                                        <button
                                            key={d.id}
                                            onClick={() => setDeadline(d.id)}
                                            className={`w-full py-4 px-6 rounded-2xl text-sm font-bold border transition-all flex justify-between items-center ${
                                                deadline === d.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                                            }`}
                                        >
                                            <span>{d.label}</span>
                                            {deadline === d.id && <span className="animate-pop">✅</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button onClick={next} className="w-full py-5 bg-white text-black rounded-2xl font-black text-xl shadow-xl transition-all active:scale-95 disabled:opacity-20" disabled={!occasion || !deadline}>
                                Понятно, далее →
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 4: TOPICS & HOBBIES */}
                {step === 4 && (
                    <StepWrapper title="Чем он живет?" subtitle="Самые яркие интересы.">
                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-black text-white/40 uppercase mb-3 block">Любимые темы разговоров</label>
                                <input 
                                    type="text"
                                    value={topics}
                                    onChange={e => setTopics(e.target.value)}
                                    placeholder="Технологии, коты, кулинария..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-400 outline-none transition-all font-bold placeholder-white/10"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-white/40 uppercase mb-3 block">Чем увлекается (3-5 предметов)</label>
                                <textarea 
                                    rows={3}
                                    value={hobbies}
                                    onChange={e => setHobbies(e.target.value)}
                                    placeholder="Велосипед, винил, макбук, йога..."
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-cyan-400 outline-none transition-all font-bold placeholder-white/10 resize-none"
                                />
                            </div>
                            <button onClick={next} className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black transition-all">
                                Запомнили
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 5: PSYCHOLOGY */}
                {step === 5 && (
                    <StepWrapper title="Текущее состояние" subtitle="Что сейчас в приоритете у человека?">
                        <div className="space-y-10">
                            <div>
                                <label className="text-xs font-black text-white/40 uppercase mb-4 block">На что жаловался в последнее время?</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {COMPLAINTS.map(c => (
                                        <button
                                            key={c.id}
                                            onClick={() => setComplaint(c.id)}
                                            className={`text-left p-4 rounded-2xl border transition-all ${
                                                complaint === c.id ? 'bg-cyan-500/20 border-cyan-400 text-white' : 'bg-white/5 border-white/10 text-white/50'
                                            }`}
                                        >
                                            <div className="font-black text-sm">{c.label}</div>
                                            <div className="text-[10px] font-bold opacity-60 mt-1">{c.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={next} className="w-full py-5 bg-white/10 hover:bg-white/20 rounded-2xl font-black">
                                Далее →
                            </button>
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 6: GOAL */}
                {step === 6 && (
                    <StepWrapper title="Миссия" subtitle="Чего хотим добиться подарком?">
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

                {/* STEP 7: EFFORT */}
                {step === 7 && (
                    <StepWrapper title="Ваш ресурс" subtitle="Сколько сил готовы потратить?">
                        <div className="grid grid-cols-1 gap-3">
                            {EFFORT_LEVELS.map(e => (
                                <OptionButton
                                    key={e.id}
                                    label={e.label}
                                    desc={e.desc}
                                    selected={effort === e.id}
                                    onClick={() => { setEffort(e.id); next(); }}
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 8: BUDGET */}
                {step === 8 && (
                    <StepWrapper title="Бюджет" subtitle="В какие рамки укладываемся?">
                        <div className="grid grid-cols-1 gap-3">
                            {BUDGET_OPTIONS.map(b => (
                                <OptionButton
                                    key={b.id}
                                    label={b.label}
                                    desc={b.desc}
                                    selected={budget === b.id}
                                    onClick={() => { setBudget(b.id); next(); }}
                                />
                            ))}
                        </div>
                    </StepWrapper>
                )}

                {/* STEP 9: REVIEW */}
                {step === 9 && (
                    <div className="max-w-md mx-auto w-full animate-pop">
                        <div className="bg-white/5 rounded-[3rem] p-10 border border-white/10 mb-8 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                            <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                                <span className="bg-green-500 w-3 h-3 rounded-full animate-ping"></span>
                                Протокол готов
                            </h3>
                            
                            <div className="space-y-6 font-mono text-sm">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/30 uppercase text-[10px] font-bold">Объект</span>
                                    <span className="font-black">{name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/30 uppercase text-[10px] font-bold">Срочность</span>
                                    <span className="font-black text-red-400">{deadline || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-white/30 uppercase text-[10px] font-bold">Бюджет</span>
                                    <span className="font-black text-green-400">{budget || 'Не важно'} ₽</span>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => finish()}
                            className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black text-2xl uppercase tracking-tighter shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 transition-all"
                        >
                            Сгенерировать
                        </button>
                    </div>
                )}

            </div>

            {/* Dev jump menu overlay */}
            {isDevMode && (
                <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md p-4 z-[60] border-t border-cyan-500/20 flex gap-4 items-center animate-slide-up overflow-x-auto no-scrollbar">
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest shrink-0">Dev Jump:</span>
                    <div className="flex gap-2">
                        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                            <button 
                                key={i}
                                onClick={() => setStep(i)}
                                className={`shrink-0 w-8 h-8 rounded-lg font-black text-xs transition-all ${step === i ? 'bg-cyan-500 text-white' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                            >
                                {i}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
