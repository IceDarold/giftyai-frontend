
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuizAnswers } from '../domain/types';
import { analytics } from '../utils/analytics';
import { Logo } from '../components/Logo';
import { useDevMode } from '../components/DevModeContext';

// --- ICONS (SVG Paths) ---
const Icons = {
    Heart: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
    User: <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />,
    Users: <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />,
    Briefcase: <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />,
    Smile: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />,
    Cake: <path d="M12 6a2 2 0 00-2 2c0 .38.1.73.29 1.03l-.15.11C8.32 10.35 6 11.97 6 14v4h12v-4c0-2.03-2.32-3.65-4.14-4.86l-.15-.11A1.99 1.99 0 0014 8a2 2 0 00-2-2zm-6 10h12v2H6v-2z" />,
    Star: <path d="M12 17.27L18.18 21l-1.64-703L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />,
    Home: <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />,
    Gift: <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm-4 8H8v-2h8v2zm0-4H8v-2h8v2zm0-4H8V9h8v2zm-8 8H4v-2h4v2zm0-4H4v-2h4v2zm0-4H4V9h4v2z" />,
    Fire: <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-13.5 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />,
    Calendar: <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />,
    Clock: <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />,
    Rocket: <path d="M7.5 11h-1C5.35 11 4.38 11.8 4.15 12.92L3.5 17h6l-.65-4.08C8.62 11.8 7.65 11 7.5 11zm9 0h-1c-.15 0-1.12.8-1.35 1.92L13.5 17h6l-.65-4.08C18.62 11.8 17.65 11 17.5 11zM12 1L8 6h3v5h2V6h3l-4-5z" />,
    Money: <path d="M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-.53.12-1.03.3-1.45.54C8.21 6.33 7 7.73 7 9.75c0 2.2 1.63 3.32 4.44 3.93 1.5.33 1.91.82 1.91 1.5 0 .86-.76 1.32-1.93 1.32-1.46 0-2.31-.69-2.37-2h-2.23c.09 2.2 1.68 3.59 3.68 3.93V21h3v-2.15c.53-.13 1.02-.32 1.44-.56C16.29 17.57 17.5 16.2 17.5 14.25c0-2.58-2.13-3.75-4.73-4.18-1.32-.22-1.77-.73-1.77-1.39 0-.82.86-1.38 1.95-1.38z" />
};

const SvgIcon = ({ children }: { children?: React.ReactNode }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
        {children}
    </svg>
);

// --- Constants ---

const RELATIONSHIPS = [
    { id: 'Партнер', label: 'Партнер', icon: Icons.Heart },
    { id: 'Родитель', label: 'Родитель', icon: Icons.Users },
    { id: 'Друг', label: 'Друг', icon: Icons.Smile },
    { id: 'Коллега', label: 'Коллега', icon: Icons.Briefcase },
    { id: 'Ребенок', label: 'Ребенок', icon: Icons.User },
    { id: 'Родственник', label: 'Родственник', icon: Icons.Home }
];

const OCCASIONS = [
    { id: 'ДР', label: 'День Рождения', icon: Icons.Cake },
    { id: 'Новый год', label: 'Новый год', icon: Icons.Star },
    { id: 'Годовщина', label: 'Годовщина', icon: Icons.Heart },
    { id: 'Просто так', label: 'Просто так', icon: Icons.Smile },
    { id: 'Новоселье', label: 'Новоселье', icon: Icons.Home },
    { id: 'Извинение', label: 'Извинение', icon: Icons.Gift }
];

const GOALS = [
    { id: 'impress', label: 'Впечатлить', icon: Icons.Star, desc: 'Wow-эффект' },
    { id: 'care', label: 'Забота', icon: Icons.Heart, desc: 'Тепло и уют' },
    { id: 'check', label: 'Для галочки', icon: Icons.Briefcase, desc: 'Без нервов' },
    { id: 'growth', label: 'Вдохновить', icon: Icons.Rocket, desc: 'На развитие' },
    { id: 'joke', label: 'Посмеяться', icon: Icons.Smile, desc: 'Fun & Joke' }
];

const DEADLINES = [
    { id: 0, label: 'Сегодня / Завтра', icon: Icons.Fire },
    { id: 3, label: 'Пара дней', icon: Icons.Calendar },
    { id: 7, label: 'Неделя', icon: Icons.Calendar },
    { id: 30, label: 'Месяц+', icon: Icons.Clock }
];

const EFFORTS = [
    { id: 'no_effort', label: 'Минимум усилий', desc: 'Купить и подарить (онлайн/доставка)' },
    { id: 'low', label: 'Немного внимания', desc: 'Красиво упаковать, подписать открытку' },
    { id: 'medium', label: 'С душой', desc: 'Найти что-то редкое, собрать набор' },
    { id: 'high', label: 'Максимум', desc: 'Квест, ручная работа, организация сюрприза' }
];

const BUDGET_STEPS = [
    { val: 1000, label: '1 000' },
    { val: 2000, label: '2 000' },
    { val: 3000, label: '3 000' },
    { val: 5000, label: '5 000' },
    { val: 7000, label: '7 000' },
    { val: 10000, label: '10 000' },
    { val: 15000, label: '15 000' },
    { val: 20000, label: '20 000' },
    { val: 30000, label: '30 000' },
    { val: 50000, label: '5 000' },
    { val: 100000, label: '100k+' }
];

const STEP_LABELS = [
    'Имя', 'Возраст', 'Кто?', 'Повод', 'Когда?', 'Интересы', 'Миссия', 'Вложения', 'Бюджет', 'Итог'
];

const MEMORY_JOGGERS = [
    "Любит готовить? 🍳", "Спорт или диван? 🏃‍♂️", "Кошки или собаки? 🐱",
    "Любимый фильм? 🎬", "Кофеман или чай? ☕️", "Играет на чем-то? 🎸",
    "Путешествия? ✈️", "Геймер? 🎮", "Что читает? 📚",
    "Сладкоежка? 🍫", "Фанатеет от техники? 💻", "Охота или Рыбалка? 🎣",
    "Любит растения? 🪴", "Коллекционер? 💎", "Есть авто? 🚗",
    "Любит рисовать? 🎨", "Трудоголик? 💼", "Меломан? 🎧",
    "Зожник? 🥗", "Любит настолки? 🎲", "Тусовщик? 🎉",
    "Любит спать? 😴", "Экстрим? 🧗", "Гаджеты? ⌚️",
    "Вино или пиво? 🍷", "Стиляга? 👗", "Умный дом? 🏠",
    "Дачник? 🏡", "Блогер? 📸", "Инвестор? 💸",
    "Любит баню? 🧖‍♂️", "Смотрит сериалы? 📺", "Эколог? ♻️",
    "Анимешник? 🇯🇵", "Любит походы? ⛺️", "Фанат Marvel? 🦸‍♂️",
    "Веган? 🥦", "Йог? 🧘‍♀️", "Любит историю? 🏛", "Танцы? 💃"
];

// Dev personas
const DEV_PERSONAS = [
    { label: '👾 Геймер', data: { name: 'Макс', age: 24, gender: 'male', relationship: 'Друг', occasion: 'ДР', tags: ['PlayStation', 'Cyberpunk', 'Пиво'], budget: 7000 } },
    { label: '🧘‍♀️ Йогиня', data: { name: 'Анна', age: 30, gender: 'female', relationship: 'Партнер', occasion: 'Просто так', tags: ['Йога', 'Медитация', 'Свечи'], budget: 3000 } },
    { label: '🎸 Рокер', data: { name: 'Игорь', age: 45, gender: 'male', relationship: 'Коллега', occasion: 'Новоселье', tags: ['Винил', 'Гитара', 'Кофе'], budget: 15000 } }
];

// --- COMPONENTS ---

const ProgressBar: React.FC<{ current: number; total: number; onJump?: (i: number) => void }> = ({ current, total, onJump }) => (
    <div className="w-full max-w-xl mx-auto px-1 flex gap-1.5 mb-8">
        {Array.from({ length: total }).map((_, i) => (
            <button 
                key={i}
                disabled={!onJump}
                onClick={() => onJump?.(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                    i <= current 
                    ? 'flex-1 bg-brand-main shadow-[0_0_10px_rgba(249,217,73,0.2)]' 
                    : 'w-2 bg-gray-200'
                } ${onJump ? 'cursor-pointer hover:bg-brand-main/40' : 'cursor-default'}`}
            />
        ))}
    </div>
);

const StepTitle: React.FC<{ children: React.ReactNode; subtitle?: string }> = ({ children, subtitle }) => (
    <div className="text-center mb-10 animate-fade-in-up relative z-10">
        <h2 className="text-3xl md:text-4xl font-black text-brand-dark mb-3 tracking-tight drop-shadow-sm leading-tight">
            {children}
        </h2>
        {subtitle && (
            <p className="text-brand-dark/60 text-lg font-medium max-w-sm mx-auto leading-snug">
                {subtitle}
            </p>
        )}
    </div>
);

const MemoryJoggers: React.FC = React.memo(() => {
    const items = useMemo(() => {
        const list = [...MEMORY_JOGGERS].sort(() => 0.5 - Math.random());
        const cols = 5; 
        const rows = Math.ceil(list.length / cols);
        
        return list.map((text, i) => {
            const row = Math.floor(i / cols);
            const col = i % cols;
            const baseLeft = (col / cols) * 100;
            const baseTop = (row / rows) * 100;
            const jitterX = Math.random() * (100 / cols) * 0.7;
            const jitterY = Math.random() * (100 / rows) * 0.7;

            return {
                text,
                left: baseLeft + jitterX,
                top: baseTop + jitterY,
                delay: Math.random() * -30,
                duration: 25 + Math.random() * 15,
                opacity: 0.4 + Math.random() * 0.4,
                scale: 0.85 + Math.random() * 0.35
            };
        });
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
            {items.map((item, i) => (
                <div 
                    key={i}
                    className="absolute font-bold whitespace-nowrap animate-float transition-all duration-500"
                    style={{
                        left: `${item.left}%`,
                        top: `${item.top}%`,
                        color: `rgba(134, 200, 188, ${item.opacity * 0.4})`,
                        fontSize: `${item.scale}rem`,
                        animationDelay: `${item.delay}s`,
                        animationDuration: `${item.duration}s`,
                        textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                    }}
                >
                    {item.text}
                </div>
            ))}
        </div>
    );
});

const OptionCard: React.FC<{ 
    label: string; 
    icon?: React.ReactNode; 
    desc?: string; 
    selected: boolean; 
    onClick: () => void;
}> = ({ label, icon, desc, selected, onClick }) => (
    <button
        onClick={onClick}
        className={`group relative overflow-hidden transition-all duration-300 w-full text-left
            flex items-center gap-4 p-5
            rounded-2xl border backdrop-blur-md
            ${selected 
                ? 'bg-white text-brand-dark border-brand-main shadow-[0_10px_30px_rgba(249,217,73,0.1)] scale-[1.02]' 
                : 'bg-white/50 text-brand-dark border-gray-100 hover:bg-white hover:border-brand-main/30 active:scale-95'
            }
        `}
    >
        {selected && <div className="absolute inset-0 bg-gradient-to-r from-brand-main/10 to-brand-accent/10 pointer-events-none" />}
        {icon && (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${selected ? 'bg-brand-main/10 text-brand-main' : 'bg-gray-100 text-gray-400'}`}>
                <SvgIcon>{icon}</SvgIcon>
            </div>
        )}
        <div className="relative z-10 flex-grow">
            <div className="font-bold text-lg leading-tight">{label}</div>
            {desc && (
                <div className={`text-xs font-medium mt-1 ${selected ? 'text-brand-dark/50' : 'text-brand-dark/30'}`}>
                    {desc}
                </div>
            )}
        </div>
        {selected && (
            <div className="text-brand-main animate-pop">
                <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>
            </div>
        )}
    </button>
);

const FloatingInput: React.FC<{ 
    value: string; 
    onChange: (val: string) => void; 
    placeholder: string;
    autoFocus?: boolean;
    onEnter?: () => void;
}> = ({ value, onChange, placeholder, autoFocus, onEnter }) => (
    <div className="relative group w-full z-20">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-main to-brand-accent opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-2xl"></div>
        <div className="relative bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center p-1 focus-within:border-brand-main/50 transition-all">
            <input 
                type="text"
                autoFocus={autoFocus}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onEnter && onEnter()}
                placeholder={placeholder}
                className="w-full bg-transparent border-none outline-none text-brand-dark font-bold text-lg px-6 py-4 placeholder-gray-300"
            />
            {value && (
                <button onClick={onEnter} className="mr-2 p-2 bg-brand-main text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
            )}
        </div>
    </div>
);

const ScrollPicker: React.FC<{
    items: { val: number; label: string | number }[];
    selectedValue: number;
    onSelect: (val: number) => void;
    unit?: string;
}> = ({ items, selectedValue, onSelect, unit }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (scrollRef.current) {
            const index = items.findIndex(i => i.val === selectedValue);
            if (index !== -1) {
                const el = scrollRef.current.children[index] as HTMLElement;
                if (el) {
                    scrollRef.current.scrollTo({
                        left: el.offsetLeft - scrollRef.current.clientWidth / 2 + el.clientWidth / 2,
                        behavior: 'smooth'
                    });
                }
            }
        }
    }, [selectedValue, items]);
    return (
        <div className="relative w-full h-48 flex items-center justify-center my-4">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-brand-surface via-brand-surface/90 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-brand-surface via-brand-surface/90 to-transparent z-20 pointer-events-none"></div>
            <div className="absolute w-32 h-32 border-[3px] border-brand-main rounded-3xl z-10 pointer-events-none shadow-[0_10px_30px_rgba(249,217,73,0.1)] bg-white/50 backdrop-blur-sm"></div>
            <div ref={scrollRef} className="flex gap-8 overflow-x-auto no-scrollbar w-full px-[50%] snap-x snap-mandatory py-20 items-center">
                {items.map((item) => (
                    <button key={item.val} onClick={() => onSelect(item.val)} className={`shrink-0 w-24 text-center snap-center transition-all duration-300 transform flex flex-col items-center justify-center ${selectedValue === item.val ? 'scale-110 opacity-100' : 'scale-90 opacity-30 hover:opacity-60'}`}>
                        <span className="text-4xl md:text-5xl font-black text-brand-dark drop-shadow-sm">{item.label}</span>
                        {unit && <span className="text-xs font-bold uppercase tracking-widest mt-2 text-brand-dark/60">{unit}</span>}
                    </button>
                ))}
            </div>
        </div>
    );
};

// --- MAIN PAGE ---

export const Quiz: React.FC = () => {
    const navigate = useNavigate();
    const { isDevMode, useMockData, setUseMockData } = useDevMode();
    const [step, setStep] = useState(0);
    const TOTAL_STEPS = 10;
    
    // Form State
    const [name, setName] = useState('');
    const [gender, setGender] = useState<'male' | 'female' | 'unisex'>('unisex');
    const [age, setAge] = useState<number>(30); 
    const [relationship, setRelationship] = useState('');
    const [customRelationship, setCustomRelationship] = useState('');
    const [occasion, setOccasion] = useState('');
    const [customOccasion, setCustomOccasion] = useState('');
    const [interestInput, setInterestInput] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [goal, setGoal] = useState('');
    const [customGoal, setCustomGoal] = useState('');
    const [budget, setBudget] = useState(5000);
    const [deadline, setDeadline] = useState<number | null>(null);
    const [effort, setEffort] = useState<'no_effort' | 'low' | 'medium' | 'high' | null>(null);

    const startTime = useRef(Date.now());

    useEffect(() => { window.scrollTo(0, 0); }, [step]);

    const next = () => setStep(s => Math.min(s + 1, TOTAL_STEPS - 1));
    const back = () => setStep(s => Math.max(0, s - 1));

    const handlePersonaFill = (persona: typeof DEV_PERSONAS[0]) => {
        setName(persona.data.name);
        setAge(persona.data.age);
        setGender(persona.data.gender as any);
        setRelationship(persona.data.relationship);
        setOccasion(persona.data.occasion);
        setTags(persona.data.tags);
        setBudget(persona.data.budget);
        setStep(9); // Jump to overview
    };

    const handleAddTag = () => {
        if (interestInput.trim()) {
            setTags([...tags, interestInput.trim()]);
            setInterestInput('');
        }
    };
    const handleRemoveTag = (tagToRemove: string) => setTags(tags.filter(t => t !== tagToRemove));

    const finish = () => {
        const standardAnswers: QuizAnswers = {
            name: name || 'Друг',
            age, recipientGender: gender,
            relationship: customRelationship || relationship,
            occasion: customOccasion || occasion,
            vibe: 'Experimental', city: 'Москва',
            interests: tags.join(', '), budget: `${budget}`,
            goal: customGoal || goal, deadline: deadline || 7, effortLevel: effort || 'low',
            roleConfidence: 'sure', archetype: 'aesthetic', selfWorth: '',
            conversationTopics: tags.join(', '), topicDuration: 'long_term', painStyle: 'endurer', riskyTopics: false, painPoints: [], roles: [],
        };
        localStorage.setItem('gifty_answers', JSON.stringify(standardAnswers));
        analytics.quizCompleted(TOTAL_STEPS, (Date.now() - startTime.current) / 1000);
        navigate('/results');
    };

    const handleCustomInput = (setter: (v: string) => void, selectionSetter: (v: string) => void) => (val: string) => {
        setter(val);
        if (val) selectionSetter('');
    };

    return (
        <div className="min-h-screen bg-brand-surface relative overflow-hidden font-sans flex flex-col text-brand-dark selection:bg-brand-main selection:text-white pb-24">
            
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-surface via-red-50 to-pink-50"></div>
                <div className="absolute top-[-20%] left-[-20%] w-[80vw] h-[80vw] bg-brand-main/5 rounded-full blur-[120px] animate-blob"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[80vw] h-[80vw] bg-brand-accent/5 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-5"></div>
            </div>

            {/* Header */}
            <div className="relative z-50 px-6 py-6 flex justify-between items-center max-w-2xl mx-auto w-full">
                <button onClick={step === 0 ? () => navigate('/') : back} className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 flex items-center justify-center text-brand-dark transition-all active:scale-90">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="scale-75 origin-center opacity-80"><Logo variant="color" onClick={() => navigate('/')} /></div>
                <div className="w-10" /> 
            </div>

            {/* Progress */}
            <div className="relative z-40">
                <ProgressBar current={step} total={TOTAL_STEPS} onJump={isDevMode ? setStep : undefined} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-grow flex flex-col max-w-xl mx-auto w-full px-6">
                
                {/* 0. NAME & GENDER */}
                {step === 0 && (
                    <div className="w-full flex-grow flex flex-col justify-center">
                        <StepTitle subtitle="Давай начнем с главного. Кому ищем подарок?">Кто счастливчик?</StepTitle>
                        <div className="space-y-8">
                            <FloatingInput value={name} onChange={setName} placeholder="Имя (Саша, Женя...)" autoFocus />
                            <div className="grid grid-cols-3 gap-3">
                                {['male', 'female', 'unisex'].map(id => (
                                    <button key={id} onClick={() => setGender(id as any)} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 ${gender === id ? 'bg-brand-main text-white border-brand-main shadow-lg scale-105' : 'bg-white text-brand-dark border-gray-100 hover:bg-gray-50'}`}>
                                        <span className="font-bold text-sm">{id === 'male' ? 'Он' : id === 'female' ? 'Она' : 'Неважно'}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mt-auto pt-8"><button disabled={!name} onClick={next} className="w-full py-4 bg-gradient-to-r from-brand-main to-brand-accent text-brand-dark rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(249,217,73,0.3)] hover:shadow-[0_15px_40px_rgba(249,217,73,0.4)] disabled:opacity-50 disabled:shadow-none transition-all active:scale-95">Далее →</button></div>
                    </div>
                )}

                {/* 1. AGE */}
                {step === 1 && (
                    <div className="w-full flex-grow flex flex-col justify-center text-center">
                        <StepTitle subtitle={`Чтобы не подарить погремушку взрослому.`}>Сколько лет {name}?</StepTitle>
                        <ScrollPicker items={Array.from({ length: 100 }, (_, i) => ({ val: i + 1, label: i + 1 }))} selectedValue={age} onSelect={setAge} unit={age % 10 === 1 && age !== 11 ? 'год' : (age % 10 >= 2 && age % 10 <= 4 && (age < 10 || age > 20)) ? 'года' : 'лет'} />
                        <div className="mt-auto pt-8"><button onClick={next} className="w-full py-4 bg-white text-black rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Подтвердить</button></div>
                    </div>
                )}

                {/* 2. RELATIONSHIP */}
                {step === 2 && (
                    <div className="w-full flex-grow flex flex-col">
                        <StepTitle subtitle="Чтобы не нарушить субординацию.">Кем приходится?</StepTitle>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {RELATIONSHIPS.map(rel => (
                                <OptionCard key={rel.id} label={rel.label} icon={rel.icon} selected={relationship === rel.id && !customRelationship} onClick={() => { setRelationship(rel.id); setCustomRelationship(''); next(); }} />
                            ))}
                        </div>
                        <FloatingInput value={customRelationship} onChange={handleCustomInput(setCustomRelationship, setRelationship)} placeholder="Свой вариант..." onEnter={next} />
                    </div>
                )}

                {/* 3. OCCASION */}
                {step === 3 && (
                    <div className="w-full flex-grow flex flex-col">
                        <StepTitle subtitle="Какой праздник на носу?">Повод</StepTitle>
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {OCCASIONS.map(occ => (
                                <OptionCard key={occ.id} label={occ.label} icon={occ.icon} selected={occasion === occ.id && !customOccasion} onClick={() => { setOccasion(occ.id); setCustomOccasion(''); next(); }} />
                            ))}
                        </div>
                        <FloatingInput value={customOccasion} onChange={handleCustomInput(setCustomOccasion, setOccasion)} placeholder="Другой повод..." onEnter={next} />
                    </div>
                )}

                {/* 4. DEADLINE */}
                {step === 4 && (
                    <div className="w-full flex-grow flex flex-col">
                        <StepTitle subtitle="Чтобы успеть с доставкой.">Когда вручаем?</StepTitle>
                        <div className="space-y-3">
                            {DEADLINES.map(d => (
                                <OptionCard key={d.id} label={d.label} icon={d.icon} selected={deadline === d.id} onClick={() => { setDeadline(d.id); next(); }} />
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. INTERESTS */}
                {step === 5 && (
                    <div className="w-full flex-grow flex flex-col relative">
                        <MemoryJoggers />
                        <StepTitle subtitle="Самое важное. Чем увлекается? О чем говорит?">Интересы</StepTitle>
                        <div className="flex flex-wrap gap-2 mb-4 min-h-[40px] relative z-10">
                            {tags.map((tag, idx) => (
                                <span key={idx} className="bg-brand-main text-white px-3 py-1.5 rounded-xl font-bold text-sm flex items-center gap-2 animate-pop shadow-sm">
                                    {tag}
                                    <button onClick={() => handleRemoveTag(tag)} className="text-white/60 hover:text-white">×</button>
                                </span>
                            ))}
                        </div>
                        <div className="relative group w-full z-20">
                            <div className="absolute inset-0 bg-gradient-to-r from-brand-main to-brand-accent opacity-0 group-focus-within:opacity-10 blur-xl transition-opacity rounded-2xl"></div>
                            <div className="relative bg-white border border-gray-100 shadow-sm rounded-2xl flex items-center p-1 focus-within:border-brand-main/50 transition-all">
                                <input type="text" autoFocus value={interestInput} onChange={(e) => setInterestInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddTag()} placeholder="Введите интерес..." className="w-full bg-transparent border-none outline-none text-brand-dark font-bold text-lg px-6 py-4 placeholder-gray-300" />
                                <button onClick={handleAddTag} disabled={!interestInput.trim()} className="mr-2 p-3 bg-brand-main text-white rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-transform disabled:opacity-50"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg></button>
                            </div>
                        </div>
                        <p className="text-brand-dark/40 text-xs mt-3 ml-2 relative z-10">Например: Йога, Кофе, Star Wars, Котики...</p>
                        <div className="mt-auto pt-6 relative z-10"><button onClick={next} className="w-full py-4 bg-brand-main text-brand-dark rounded-2xl font-black text-lg shadow-[0_10px_30px_rgba(249,217,73,0.2)] hover:scale-[1.02] active:scale-95 transition-all">{tags.length > 0 ? 'Готово, идем дальше' : 'Пропустить'}</button></div>
                    </div>
                )}

                {/* 6. GOAL */}
                {step === 6 && (
                    <div className="w-full flex-grow flex flex-col">
                        <StepTitle subtitle="Какую эмоцию хотите вызвать?">Миссия подарка</StepTitle>
                        <div className="grid grid-cols-1 gap-3 mb-6">
                            {GOALS.map(g => (
                                <OptionCard key={g.id} label={g.label} desc={g.desc} icon={g.icon} selected={goal === g.id && !customGoal} onClick={() => { setGoal(g.id); setCustomGoal(''); next(); }} />
                            ))}
                        </div>
                        <FloatingInput value={customGoal} onChange={handleCustomInput(setCustomGoal, setGoal)} placeholder="Своя цель..." onEnter={next} />
                    </div>
                )}

                {/* 7. EFFORT */}
                {step === 7 && (
                    <div className="w-full flex-grow flex flex-col">
                        <StepTitle subtitle="Честно оцените свои силы.">Вложения</StepTitle>
                        <div className="grid grid-cols-1 gap-3">
                            {EFFORTS.map(e => (
                                <button key={e.id} onClick={() => { setEffort(e.id as any); next(); }} className={`p-6 rounded-2xl border text-left transition-all ${effort === e.id ? 'bg-brand-main text-white border-brand-main shadow-lg' : 'bg-white border-gray-100 hover:bg-gray-50 text-brand-dark'}`}>
                                    <div className="font-bold text-lg mb-1">{e.label}</div>
                                    <div className="text-sm opacity-60">{e.desc}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 8. BUDGET */}
                {step === 8 && (
                    <div className="w-full flex-grow flex flex-col justify-center text-center">
                        <StepTitle subtitle="На какую сумму ориентируемся?">Бюджет</StepTitle>
                        <ScrollPicker items={BUDGET_STEPS} selectedValue={budget} onSelect={setBudget} unit="RUB" />
                        <div className="mt-auto pt-8"><button onClick={next} className="w-full py-4 bg-white text-black rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all">Подтвердить</button></div>
                    </div>
                )}

                {/* 9. OVERVIEW */}
                {step === 9 && (
                    <div className="w-full flex-grow flex flex-col">
                        <StepTitle subtitle="Проверьте, всё ли верно?">Перед стартом</StepTitle>
                        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl mb-8">
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-brand-dark/50">Кто</span><span className="font-bold">{name}, {age} лет</span></div>
                                <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-brand-dark/50">Повод</span><span className="font-bold">{customOccasion || occasion}</span></div>
                                <div className="flex justify-between border-b border-gray-50 pb-3"><span className="text-brand-dark/50">Интересы</span><span className="font-bold text-right max-w-[60%] text-brand-main">{tags.join(', ') || 'Не указаны'}</span></div>
                                <div className="flex justify-between items-center pt-1"><span className="text-brand-dark/50">Бюджет</span><span className="font-black text-xl text-brand-main bg-brand-main/5 px-3 py-1 rounded-lg shadow-sm border border-brand-main/10">{budget.toLocaleString()} ₽</span></div>
                            </div>
                        </div>
                        <div className="mt-auto space-y-3">
                            <button onClick={finish} className="w-full py-5 bg-gradient-to-r from-brand-main to-brand-accent text-brand-dark rounded-2xl font-black text-xl uppercase tracking-widest shadow-[0_10px_30px_rgba(249,217,73,0.3)] hover:scale-102 transition-transform animate-pulse-slow">🚀 Поехали!</button>
                            <button onClick={() => setStep(0)} className="w-full py-4 text-brand-dark/50 font-bold hover:text-brand-dark transition-colors">Изменить данные</button>
                        </div>
                    </div>
                )}

            </div>

            {/* DEV QUICK BAR */}
            {isDevMode && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-xl border-t border-green-500/30 p-4 flex flex-col gap-3 animate-slide-up">
                    <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
                        <span className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center shrink-0">Step Jump:</span>
                        {STEP_LABELS.map((label, i) => (
                            <button key={i} onClick={() => setStep(i)} className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-[9px] font-bold transition-all border ${step === i ? 'bg-green-500 text-white border-green-400' : 'bg-white/5 text-white/40 border-white/10 hover:bg-white/10'}`}>
                                {label}
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-2">
                        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                             <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Personas:</span>
                             {DEV_PERSONAS.map(p => (
                                <button key={p.label} onClick={() => handlePersonaFill(p)} className="whitespace-nowrap px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl text-[10px] font-bold hover:bg-green-500 hover:text-white transition-all">
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                             <button 
                                onClick={() => setUseMockData(!useMockData)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black transition-all border ${useMockData ? 'bg-amber-500 text-white border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-white/5 text-white/40 border-white/10'}`}
                             >
                                {useMockData ? 'MOCK' : 'API'}
                             </button>
                             <button onClick={() => finish()} className="whitespace-nowrap px-4 py-1.5 bg-white/10 text-white border border-white/10 rounded-xl text-[10px] font-bold">
                                Skip ⏩
                             </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
