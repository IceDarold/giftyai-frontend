import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { Gift } from '../domain/types';
import { GiftDetailsModal } from '../components/GiftDetailsModal';

// --- Types ---
interface Concept {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    icon: string;
    gradient: string;
    psychology: string; // Internal tag like "Permission (Status)"
}

interface Scenario {
    id: string;
    title: string;
    context: string; // Business, Personal, etc.
    who: string;
    goal: string;
    effort: 'Low' | 'Medium' | 'High';
    budget: string;
    interests: string[];
    color: string;
    icon: string;
}

// --- Data: Scenarios ---
const SCENARIOS: Scenario[] = [
    {
        id: 's_business',
        title: 'Статусная благодарность',
        context: 'Бизнес-контекст',
        who: 'Коллега (М, 45 лет)',
        goal: 'Protocol / Благодарность',
        effort: 'Low',
        budget: 'до 7 000 ₽',
        interests: ['Кофе', 'Бизнес-литература', 'Минимализм'],
        color: 'border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10',
        icon: '💼'
    },
    {
        id: 's_growth',
        title: 'Новое начало',
        context: 'Поддержка и развитие',
        who: 'Подруга (Ж, 28 лет)',
        goal: 'Support / Вдохновить',
        effort: 'Medium',
        budget: 'до 10 000 ₽',
        interests: ['Рисование', 'Психология', 'Растения'],
        color: 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10',
        icon: '🌱'
    },
    {
        id: 's_intimacy',
        title: 'Тепло и близость',
        context: 'Эмоциональный контекст',
        who: 'Партнер (М, 32 года)',
        goal: 'Care / Удивить',
        effort: 'High',
        budget: 'до 15 000 ₽',
        interests: ['Кино', 'Кулинария', 'Путешествия'],
        color: 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10',
        icon: '❤️'
    }
];

// --- Data: Concepts Generator ---
const GENERATE_CONCEPTS = (scenarioId: string): Concept[] => {
    switch (scenarioId) {
        case 's_business':
            return [
                {
                    id: 'c_ritual',
                    title: 'Ритуал лидера',
                    subtitle: 'Качественные аксессуары',
                    description: 'Вещи, которые структурируют рабочий хаос и добавляют эстетики в рутину. Статус через детали.',
                    icon: '☕️',
                    gradient: 'from-slate-700 to-slate-900',
                    psychology: 'Permission (Status)'
                },
                {
                    id: 'c_intellect',
                    title: 'Интеллектуальный декор',
                    subtitle: 'Книга как искусство',
                    description: 'Подарок для ума, который не стыдно положить на стол. Знания в премиальной упаковке.',
                    icon: '📚',
                    gradient: 'from-blue-800 to-indigo-900',
                    psychology: 'Mirror (Aesthetic)'
                },
                {
                    id: 'c_order',
                    title: 'Эстетика порядка',
                    subtitle: 'Минимализм на столе',
                    description: 'Инструменты для организации пространства. Чистый стол — чистый разум.',
                    icon: '📐',
                    gradient: 'from-gray-600 to-gray-800',
                    psychology: 'Optimizer (Fix)'
                }
            ];
        case 's_growth':
            return [
                {
                    id: 'c_blank_page',
                    title: 'Страх чистого листа',
                    subtitle: 'Быстрый старт',
                    description: 'Профессиональные инструменты, которые сами "просят" начать творить. Снимаем барьер входа.',
                    icon: '🎨',
                    gradient: 'from-pink-500 to-rose-500',
                    psychology: 'Catalyst (Starter)'
                },
                {
                    id: 'c_greenhouse',
                    title: 'Домашняя оранжерея',
                    subtitle: 'Автоматизация ухода',
                    description: 'Умные гаджеты для растений. Забота о природе без страха "всё засохнет".',
                    icon: '🌿',
                    gradient: 'from-emerald-600 to-green-700',
                    psychology: 'Optimizer (Smart)'
                },
                {
                    id: 'c_reflection',
                    title: 'Дневник самопознания',
                    subtitle: 'Инструмент рефлексии',
                    description: 'Красивые практики для диалога с собой. Психология в формате игры или ритуала.',
                    icon: '🧘‍♀️',
                    gradient: 'from-purple-600 to-indigo-600',
                    psychology: 'Anchor (Ritual)'
                }
            ];
        case 's_intimacy':
            return [
                {
                    id: 'c_cinema',
                    title: 'Кинотеатр для двоих',
                    subtitle: 'Атмосфера свиданий',
                    description: 'Создаем магию кинозала дома. Уют, темнота и только вы вдвоем.',
                    icon: '📽️',
                    gradient: 'from-indigo-900 to-purple-900',
                    psychology: 'Anchor (Time Capsule)'
                },
                {
                    id: 'c_taste',
                    title: 'Лаборатория вкуса',
                    subtitle: 'Эксперименты на кухне',
                    description: 'Гастрономическое приключение. Готовим как в ресторане, но вместе.',
                    icon: '🍳',
                    gradient: 'from-orange-600 to-red-700',
                    psychology: 'Catalyst (Accelerator)'
                },
                {
                    id: 'c_map',
                    title: 'Карта открытий',
                    subtitle: 'История пары',
                    description: 'Визуализация вашего общего пути. Места, где вы были счастливы.',
                    icon: '🗺️',
                    gradient: 'from-cyan-600 to-blue-700',
                    psychology: 'Anchor (Memories)'
                }
            ];
        default: return [];
    }
};

// --- Data: Product Mock Generator ---
const GET_PRODUCTS_FOR_CONCEPT = (conceptId: string): Gift[] => {
    const baseGift = {
        currency: 'RUB',
        merchant: 'Gifty Lab',
        productUrl: '#',
        category: 'Experimental'
    };

    switch (conceptId) {
        case 'c_ritual': return [
            { ...baseGift, id: 'p1', title: 'Воронка Hario V60 Glass', price: 2500, description: 'Легендарный японский пуровер для заваривания кофе.', imageUrl: 'https://images.unsplash.com/photo-1544979594-320c29255b9a?auto=format&fit=crop&w=800&q=80', reason: 'Идеальный утренний ритуал.' },
            { ...baseGift, id: 'p2', title: 'Зерно Ethiopia Yirgacheffe', price: 1800, description: 'Свежая обжарка, ноты жасмина и бергамота.', imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=800&q=80', reason: 'Статусное дополнение к воронке.' },
            { ...baseGift, id: 'p3', title: 'Чайник с "гусиной шеей"', price: 4200, description: 'Для точного контроля пролива воды.', imageUrl: 'https://images.unsplash.com/photo-1522026883296-17b0744c6198?auto=format&fit=crop&w=800&q=80', reason: 'Профессиональный инструмент.' },
        ];
        case 'c_intellect': return [
            { ...baseGift, id: 'p4', title: 'Рэй Далио: "Принципы" (Deluxe)', price: 3500, description: 'Подарочное издание в твердом переплете.', imageUrl: 'https://m.media-amazon.com/images/I/61Augp+b1jL._AC_UF1000,1000_QL80_.jpg', reason: 'Книга как символ мудрости.' },
            { ...baseGift, id: 'p5', title: 'Биография Стива Джобса', price: 2100, description: 'Классика бизнес-литературы.', imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80', reason: 'Вдохновение для лидера.' },
        ];
        case 'c_order': return [
            { ...baseGift, id: 'p6', title: 'Алюминиевая подставка', price: 4500, description: 'Минималистичная подставка для ноутбука.', imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80', reason: 'Эргономика и стиль.' },
            { ...baseGift, id: 'p7', title: 'Кожаный бювар на стол', price: 5000, description: 'Премиальная эко-кожа, защита стола.', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', reason: 'Благородный акцент рабочего места.' },
        ];
        case 'c_blank_page': return [
            { ...baseGift, id: 'p8', title: 'Набор маркеров Copic (12 шт)', price: 6500, description: 'Профессиональные спиртовые маркеры.', imageUrl: 'https://images.unsplash.com/photo-1517260739337-6799d2dc9ee4?auto=format&fit=crop&w=800&q=80', reason: 'Лучший инструмент для старта.' },
            { ...baseGift, id: 'p9', title: 'Скетчбук Moleskine Art', price: 2800, description: 'Плотная бумага, твердая обложка.', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', reason: 'Холст для идей.' },
        ];
        case 'c_greenhouse': return [
            { ...baseGift, id: 'p10', title: 'Умный горшок с автополивом', price: 4900, description: 'Сам поливает растение до месяца.', imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=80', reason: 'Зелень без хлопот.' },
            { ...baseGift, id: 'p11', title: 'Датчик влажности почвы', price: 1500, description: 'Присылает уведомления на смартфон.', imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', reason: 'Технологичная забота.' },
        ];
        case 'c_reflection': return [
            { ...baseGift, id: 'p12', title: 'Трансформационная игра', price: 3500, description: 'Психологическая настолка для поиска ответов.', imageUrl: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?auto=format&fit=crop&w=800&q=80', reason: 'Глубокий диалог с собой.' },
            { ...baseGift, id: 'p13', title: 'Блокнот "6 минут"', price: 1200, description: 'Ежедневник осознанности.', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80', reason: 'Простая практика благодарности.' },
        ];
        case 'c_cinema': return [
            { ...baseGift, id: 'p14', title: 'Проектор Cinemood (Кубик)', price: 14990, description: 'Портативный кинотеатр.', imageUrl: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?auto=format&fit=crop&w=800&q=80', reason: 'Магия кино на потолке.' },
            { ...baseGift, id: 'p15', title: 'Машина для попкорна', price: 2500, description: 'Ретро-стиль.', imageUrl: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=80', reason: 'Запах кинотеатра дома.' },
        ];
        case 'c_taste': return [
            { ...baseGift, id: 'p16', title: 'Су-вид погружной Anova', price: 12000, description: 'Технология ресторанов Michelin.', imageUrl: 'https://images.unsplash.com/photo-1627483298606-25807185cc65?auto=format&fit=crop&w=800&q=80', reason: 'Идеальные стейки всегда.' },
            { ...baseGift, id: 'p17', title: 'Вакууматор бытовой', price: 3500, description: 'Для су-вида и хранения.', imageUrl: 'https://images.unsplash.com/photo-1627483297929-37f416fec7cd?auto=format&fit=crop&w=800&q=80', reason: 'Необходимая пара.' },
        ];
        case 'c_map': return [
            { ...baseGift, id: 'p18', title: 'Скретч-карта мира (XXL)', price: 1900, description: 'В черном тубусе, золотой слой.', imageUrl: 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80', reason: 'Визуализация совместных побед.' },
            { ...baseGift, id: 'p19', title: 'Фотоальбом для Instax', price: 1500, description: 'С кармашками для мгновенных фото.', imageUrl: 'https://images.unsplash.com/photo-1606834789547-104443916297?auto=format&fit=crop&w=800&q=80', reason: 'Хранитель моментов.' },
        ];
        default: return [];
    }
};

// --- Blind Evaluation Card ---
const BlindGiftCard: React.FC<{ gift: Gift; onClick: () => void }> = ({ gift, onClick }) => {
    const [status, setStatus] = useState<'pending' | 'rejected' | 'maybe' | 'loved'>('pending');

    const handleVote = (vote: 'rejected' | 'maybe' | 'loved', e: React.MouseEvent) => {
        e.stopPropagation();
        setStatus(vote);
    };

    if (status === 'rejected') {
        return (
            <div className="h-full min-h-[400px] bg-white/5 rounded-[2rem] border border-white/5 flex items-center justify-center animate-fade-in opacity-50 grayscale transition-all">
                <div className="text-center">
                    <div className="text-4xl mb-2">🗑</div>
                    <div className="text-xs font-bold uppercase tracking-widest text-white/30">Скрыто</div>
                    <button onClick={(e) => { e.stopPropagation(); setStatus('pending'); }} className="mt-4 text-xs text-white/50 underline hover:text-white">Вернуть</button>
                </div>
            </div>
        );
    }

    return (
        <div 
            onClick={status === 'loved' ? onClick : undefined}
            className={`group relative h-full bg-white rounded-[2rem] overflow-hidden transition-all duration-500 flex flex-col ${status === 'loved' ? 'ring-4 ring-green-400 shadow-[0_0_50px_rgba(74,222,128,0.3)] cursor-pointer' : ''}`}
        >
            {/* Image Area */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100">
                <img 
                    src={gift.imageUrl || ''} 
                    alt={gift.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Status Badge */}
                {status === 'maybe' && (
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg animate-pop">
                        🤔 Maybe
                    </div>
                )}
                {status === 'loved' && (
                    <div className="absolute top-4 right-4 bg-green-500 text-white font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest shadow-lg animate-pop flex items-center gap-1">
                        🔥 Match
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6 flex-grow flex flex-col relative bg-white">
                <h3 className="text-xl font-black text-gray-900 leading-tight mb-3 line-clamp-2">
                    {gift.title}
                </h3>
                
                <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {gift.reason || gift.description || "Идеально подходит под выбранное направление. Сочетает в себе эстетику и функциональность."}
                </p>

                {/* --- ACTION AREA --- */}
                {status === 'loved' ? (
                    // REVEALED STATE
                    <div className="animate-fade-in-up">
                        <div className="flex items-baseline justify-between mb-4">
                            <span className="text-2xl font-black text-brand-blue">
                                {gift.price} {gift.currency === 'USD' ? '$' : '₽'}
                            </span>
                            {gift.reviews && (
                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                    ★ {gift.reviews.rating}
                                </span>
                            )}
                        </div>
                        <button className="w-full py-3 bg-black text-white rounded-xl font-bold text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-lg">
                            Открыть карточку
                        </button>
                    </div>
                ) : (
                    // BLIND EVALUATION STATE
                    <div className="grid grid-cols-3 gap-2 mt-auto">
                        <button 
                            onClick={(e) => handleVote('rejected', e)}
                            className="h-14 rounded-xl bg-gray-50 hover:bg-red-50 text-2xl flex items-center justify-center transition-colors border border-gray-100 hover:border-red-200 group/btn"
                            title="Совсем не то"
                        >
                            <span className="group-hover/btn:scale-125 transition-transform">👎</span>
                        </button>
                        <button 
                            onClick={(e) => handleVote('maybe', e)}
                            className="h-14 rounded-xl bg-gray-50 hover:bg-yellow-50 text-2xl flex items-center justify-center transition-colors border border-gray-100 hover:border-yellow-200 group/btn"
                            title="Неплохо / Может быть"
                        >
                            <span className="group-hover/btn:scale-125 transition-transform">🤔</span>
                        </button>
                        <button 
                            onClick={(e) => handleVote('loved', e)}
                            className="h-14 rounded-xl bg-gray-50 hover:bg-green-50 text-2xl flex items-center justify-center transition-colors border border-gray-100 hover:border-green-200 group/btn shadow-sm"
                            title="То, что нужно!"
                        >
                            <span className="group-hover/btn:scale-125 transition-transform">🔥</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export const ExperimentDecision: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [phase, setPhase] = useState<'scenario_selection' | 'loading' | 'concepts' | 'probe' | 'fulfillment'>('scenario_selection');
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [concepts, setConcepts] = useState<Concept[]>([]);
    const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);
    const [products, setProducts] = useState<Gift[]>([]);
    
    // Modal for product details
    const [viewGift, setViewGift] = useState<Gift | null>(null);

    // Initial Load (removed auto-generate, start at scenario select)
    
    // Handlers
    const handleSelectScenario = (scenario: Scenario) => {
        setSelectedScenario(scenario);
        setPhase('loading');
        setTimeout(() => {
            setConcepts(GENERATE_CONCEPTS(scenario.id));
            setPhase('concepts');
        }, 1000);
    };

    const handleDismiss = (id: string) => {
        setConcepts(prev => prev.filter(c => c.id !== id));
        if (concepts.length <= 1) {
            setPhase('probe');
        }
    };

    const handleSelectConcept = async (concept: Concept) => {
        setSelectedConcept(concept);
        setPhase('loading'); // Brief loading for fulfillment
        
        try {
            // Get specific mock products based on the concept ID
            const specificProducts = GET_PRODUCTS_FOR_CONCEPT(concept.id);
            setProducts(specificProducts);
            setPhase('fulfillment');
        } catch (e) {
            console.error(e);
        }
    };

    // --- Renders ---

    // 1. SCENARIO SELECTION (New Phase)
    if (phase === 'scenario_selection') {
        return (
            <div className="min-h-screen bg-[#0F172A] text-white p-6 pt-10 flex flex-col items-center">
                <header className="max-w-4xl w-full mb-12 flex justify-between items-end">
                    <div>
                        <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2">Interface Experiment</div>
                        <h1 className="text-3xl md:text-4xl font-black">The Decision Protocol</h1>
                        <p className="text-white/50 mt-2 text-sm max-w-md">Выберите сценарий для симуляции алгоритма подбора подарков.</p>
                    </div>
                    <button onClick={() => navigate('/experiments')} className="text-xs font-mono text-white/30 hover:text-white border border-white/20 px-3 py-1 rounded">EXIT LAB</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full">
                    {SCENARIOS.map(scenario => (
                        <div 
                            key={scenario.id}
                            onClick={() => handleSelectScenario(scenario)}
                            className={`group relative bg-slate-800/50 border border-white/5 rounded-3xl p-6 cursor-pointer overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl ${scenario.color}`}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-4xl">{scenario.icon}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 border border-white/10 px-2 py-1 rounded bg-black/20">
                                    {scenario.context}
                                </span>
                            </div>
                            
                            <h3 className="text-xl font-bold mb-1">{scenario.title}</h3>
                            <p className="text-white/60 text-sm mb-6">{scenario.who}</p>

                            <div className="space-y-3 text-xs font-mono text-white/70">
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Goal:</span> <span className="text-white">{scenario.goal}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Effort:</span> <span className="text-white">{scenario.effort}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-1">
                                    <span>Budget:</span> <span className="text-white">{scenario.budget}</span>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
                                {scenario.interests.map(tag => (
                                    <span key={tag} className="px-2 py-1 rounded bg-white/10 text-[10px] font-bold">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                            
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (phase === 'loading') {
        return (
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-6"></div>
                <h2 className="text-xl font-bold tracking-widest uppercase animate-pulse">
                    {selectedConcept ? 'Подбираем товары...' : 'Анализ профиля...'}
                </h2>
                <p className="text-white/40 text-sm mt-2 font-mono">
                    {selectedScenario ? `Context: ${selectedScenario.context}` : 'Generative AI Core v2.1'}
                </p>
            </div>
        );
    }

    // Reuse Probe (simplified for now as prompt focused on the 3 scenarios)
    if (phase === 'probe') {
        return (
            <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center p-6 text-center">
               <h2 className="text-2xl font-bold text-white mb-4">Конец симуляции</h2>
               <button onClick={() => setPhase('scenario_selection')} className="px-6 py-3 bg-white text-black rounded-xl font-bold">Выбрать другой сценарий</button>
            </div>
        );
    }

    // 3. FULFILLMENT (Products)
    if (phase === 'fulfillment') {
        return (
            <div className="min-h-screen bg-[#0F172A] text-white overflow-x-hidden">
                {/* Header */}
                <div className={`relative pt-24 pb-12 px-6 bg-gradient-to-b ${selectedConcept?.gradient} to-[#0F172A]`}>
                    <button 
                        onClick={() => { setPhase('concepts'); setSelectedConcept(null); }}
                        className="absolute top-6 left-6 text-sm font-bold bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-md transition-colors"
                    >
                        ← Назад к идеям
                    </button>
                    
                    <div className="max-w-6xl mx-auto flex items-end gap-6">
                        <div className="text-6xl md:text-8xl hidden md:block">{selectedConcept?.icon}</div>
                        <div>
                            <div className="text-white/60 font-bold uppercase tracking-widest mb-2 text-xs md:text-sm">
                                {selectedConcept?.psychology}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-2">{selectedConcept?.title}</h1>
                            <p className="text-white/80 max-w-xl text-lg">{selectedConcept?.description}</p>
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <div className="max-w-6xl mx-auto px-6 pb-24">
                    <div className="mb-8 flex items-center gap-3 opacity-60">
                        <span className="text-xl">🕵️‍♂️</span>
                        <p className="text-sm font-medium">Оцените варианты, чтобы увидеть детали.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <BlindGiftCard 
                                key={product.id} 
                                gift={product} 
                                onClick={() => setViewGift(product)} 
                            />
                        ))}
                    </div>
                </div>

                {/* Modal */}
                {viewGift && (
                    <GiftDetailsModal 
                        gift={viewGift} 
                        isOpen={!!viewGift} 
                        onClose={() => setViewGift(null)} 
                        answers={null} 
                        onWishlistChange={() => {}} 
                    />
                )}
            </div>
        );
    }

    // 2. CONCEPTS (Hypotheses)
    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 pt-20 relative overflow-hidden flex flex-col">
            <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#0F172A] to-[#0F172A]"></div>
            
            <header className="max-w-6xl mx-auto w-full mb-8 relative z-10 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="text-cyan-400">AI</span> Гипотезы
                    </h1>
                    <p className="text-white/40 text-xs mt-1">
                        Для: {selectedScenario?.who} • Цель: {selectedScenario?.goal}
                    </p>
                </div>
                <button onClick={() => setPhase('scenario_selection')} className="text-xs font-mono text-white/30 hover:text-white">CHANGE SCENARIO</button>
            </header>

            <div className="flex-grow flex flex-col items-center justify-center relative z-10 w-full max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                    {concepts.map((concept, idx) => (
                        <div 
                            key={concept.id}
                            className="group relative h-[450px] rounded-[2.5rem] p-8 flex flex-col justify-between cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden border border-white/10"
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${concept.gradient} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}></div>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>

                            {/* Dismiss Button */}
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDismiss(concept.id); }}
                                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white/50 hover:text-white transition-all z-20 backdrop-blur-sm opacity-0 group-hover:opacity-100"
                                title="Это не подходит"
                            >
                                ✕
                            </button>

                            {/* Content */}
                            <div className="relative z-10 pointer-events-none">
                                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform duration-500 origin-top-left drop-shadow-lg">
                                    {concept.icon === 'bonsai' ? '🪴' : concept.icon}
                                </div>
                                <span className="inline-block px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest mb-3 text-cyan-200">
                                    {concept.psychology}
                                </span>
                                <h3 className="text-4xl font-black leading-none mb-2 drop-shadow-md">
                                    {concept.title}
                                </h3>
                                <p className="text-lg font-bold text-white/80">{concept.subtitle}</p>
                            </div>

                            <div className="relative z-10 mt-auto">
                                <p className="text-sm font-medium text-white/70 mb-6 leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                                    {concept.description}
                                </p>
                                <button 
                                    onClick={() => handleSelectConcept(concept)}
                                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-wider shadow-lg transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100"
                                >
                                    Раскрыть идею
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};