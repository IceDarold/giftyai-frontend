
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';

interface Experiment {
    id: string;
    name: string;
    description: string;
    status: 'alpha' | 'beta' | 'concept';
    route: string;
    color: string;
    icon: string;
}

const EXPERIMENTS: Experiment[] = [
    {
        id: 'dialogue-algo',
        name: 'Dialogue Algorithm',
        description: 'Новое ядро. Зондирование широких тем, генерация гипотез и механика выхода из тупика (Rescue Protocol).',
        status: 'alpha',
        route: '/experiments/dialogue',
        color: 'from-cyan-500 to-blue-600',
        icon: '💬'
    },
    {
        id: 'quiz-v2',
        name: 'Gifty Express Protocol',
        description: 'Альтернативная воронка квиза. Фокус на ресурсах дарителя (время, усилия, дедлайн), а не только на интересах получателя.',
        status: 'beta',
        route: '/experiments/new-quiz',
        color: 'from-orange-400 to-red-500',
        icon: '⏱️'
    },
    {
        id: 'decision',
        name: 'The Decision',
        description: 'Промежуточный слой между квизом и товарами. AI генерирует 3 гипотезы-направления. Выбираете идею — получаете товары.',
        status: 'alpha',
        route: '/experiments/decision',
        color: 'from-emerald-400 to-cyan-500',
        icon: '🧠'
    },
    {
        id: 'swipe',
        name: 'Tinder Gift Swipe',
        description: 'Механика выбора подарков свайпами. Вправо — лайк, влево — дизлайк. Быстрый подбор на основе визуальной реакции.',
        status: 'beta',
        route: '/experiments/swipe',
        color: 'from-pink-500 to-rose-500',
        icon: '🔥'
    },
    {
        id: 'voice',
        name: 'Voice AI Agent',
        description: 'Голосовое общение с ИИ-консультантом в реальном времени. (Concept UI Only)',
        status: 'concept',
        route: '#',
        color: 'from-blue-500 to-cyan-500',
        icon: '🎙'
    },
    {
        id: 'ar',
        name: 'AR Unboxing',
        description: 'Виртуальная распаковка подарка в дополненной реальности. Требует доступа к камере.',
        status: 'alpha',
        route: '#',
        color: 'from-purple-500 to-indigo-500',
        icon: '📦'
    }
];

export const ExperimentalCatalog: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-6 relative overflow-hidden font-mono">
            {/* Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
            
            <div className="max-w-5xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12 pt-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => navigate('/')} 
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <span className="text-purple-400">Gifty</span> Laboratory
                            </h1>
                            <p className="text-xs text-slate-500 uppercase tracking-widest">Experimental Interfaces // Dev Access Only</p>
                        </div>
                    </div>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs text-green-500 font-bold">● SYSTEM ONLINE</div>
                        <div className="text-[10px] text-slate-600">v.0.9.5-alpha</div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {EXPERIMENTS.map((exp) => (
                        <div 
                            key={exp.id}
                            onClick={() => exp.route !== '#' && navigate(exp.route)}
                            className={`group relative bg-slate-800/50 border border-white/5 rounded-2xl p-6 cursor-pointer overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-slate-800 hover:-translate-y-1 ${exp.route === '#' ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${exp.color} opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                            
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                    {exp.icon}
                                </div>
                                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded border ${
                                    exp.status === 'beta' ? 'text-green-400 border-green-400/20 bg-green-400/10' :
                                    exp.status === 'alpha' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' :
                                    'text-slate-400 border-slate-400/20 bg-slate-400/5'
                                }`}>
                                    {exp.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors text-slate-200">
                                {exp.name}
                            </h3>
                            <p className="text-sm text-slate-400 leading-relaxed mb-4">
                                {exp.description}
                            </p>

                            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 group-hover:text-white transition-colors">
                                {exp.route === '#' ? 'In Development' : 'Launch Experiment'} 
                                {exp.route !== '#' && <span>→</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <footer className="mt-20 border-t border-white/5 pt-8 text-center text-xs text-slate-600">
                    <p>WARNING: These features are experimental. Stability is not guaranteed.</p>
                    <p className="mt-1">Feedback? Ping the engineering team directly.</p>
                </footer>
            </div>
        </div>
    );
};
