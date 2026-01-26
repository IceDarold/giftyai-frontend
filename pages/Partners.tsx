import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Logo } from '../components/Logo';
import { Footer } from '../components/Footer';
import { AmbientSnow } from '../components/SnowSystem';

export const Partners: React.FC = () => {
  const navigate = useNavigate();
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [formData, setFormData] = useState({
    brand: '',
    website: '',
    email: '',
    category: '',
    comment: ''
  });

  // Animation trigger for numbers
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.brand || !formData.email) return;
    
    setFormState('submitting');
    
    // Simulate API call
    setTimeout(() => {
      setFormState('success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-brand-dark relative overflow-x-hidden text-white pt-24 selection:bg-brand-blue selection:text-white flex flex-col font-sans">
      
      {/* --- Dynamic Background --- */}
      <AmbientSnow />
      <div className="fixed inset-0 pointer-events-none z-0">
          {/* Deep gradient background */}
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-brand-blue/20 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[800px] h-[800px] bg-brand-purple/10 rounded-full blur-[120px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>
          
          {/* Grid lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] pointer-events-none"></div>
      </div>

      <div className="relative z-10 px-4 sm:px-6 max-w-[1400px] mx-auto flex-grow w-full">
        
        {/* Header Navigation */}
        <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-brand-dark/80 backdrop-blur-xl border-b border-white/5 supports-[backdrop-filter]:bg-brand-dark/60">
            <div className="flex items-center gap-2">
                <Logo variant="white" onClick={() => navigate('/')} className="scale-75 origin-left" />
                <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border border-white/10">B2B</span>
            </div>
            <button onClick={() => navigate('/')} className="text-sm font-bold text-white/50 hover:text-white transition-colors">
                Вернуться в маркетплейс
            </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mt-8 lg:mt-12 mb-24">
            
            {/* --- LEFT COLUMN: The Pitch (7 cols) --- */}
            <div className="lg:col-span-7 flex flex-col justify-center pt-4">
                
                {/* 1. Value Proposition Header */}
                <div className={`transition-all duration-1000 ease-out transform ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <div className="inline-flex items-center gap-2 mb-6 bg-brand-blue/10 border border-brand-blue/20 px-3 py-1.5 rounded-full text-brand-blue font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,77,109,0.3)]">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue"></span>
                        </span>
                        Принимаем партнеров на Q1 2025
                    </div>

                    <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black leading-[0.95] tracking-tight mb-6">
                        Превращаем <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-white to-brand-purple animate-text-shimmer bg-[length:200%_auto]">поиск подарка</span> <br/>
                        в вашу продажу.
                    </h1>
                    
                    <p className="text-lg sm:text-xl text-white/70 font-medium leading-relaxed mb-10 max-w-2xl border-l-4 border-brand-blue/30 pl-6">
                        Пока конкуренты платят за "охваты" и клики, Gifty AI приводит готового покупателя именно в тот момент, когда он ищет ваш товар.
                    </p>
                </div>

                {/* 2. BENTO GRID: The "Why" Logic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-fr">
                    
                    {/* Card 1: The Problem (Marketplaces) */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm hover:bg-white/10 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-red-500/20 rounded-full blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">📉</span>
                                <span className="text-xs font-bold text-red-400 uppercase tracking-wider bg-red-500/10 px-2 py-1 rounded">Проблема рынка</span>
                            </div>
                            <h3 className="font-bold text-white text-lg mb-2">Маркетплейсы съедают маржу</h3>
                            <p className="text-sm text-white/60 font-medium leading-relaxed">
                                Комиссии растут, конкуренция давит ценой. Ваш бренд теряется среди тысяч аналогов.
                            </p>
                        </div>
                    </div>

                    {/* Card 2: The Solution (Gifty) */}
                    <div className="bg-gradient-to-br from-brand-blue/20 to-brand-purple/10 border border-brand-blue/30 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden group shadow-[0_0_40px_rgba(255,77,109,0.15)]">
                        <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">🚀</span>
                                <span className="text-xs font-bold text-brand-blue uppercase tracking-wider bg-brand-blue/20 px-2 py-1 rounded border border-brand-blue/20">Решение Gifty</span>
                            </div>
                            <h3 className="font-bold text-white text-lg mb-2">Горячий спрос</h3>
                            <p className="text-sm text-white/80 font-medium leading-relaxed">
                                Мы не продаем "место на полке". Мы продаем <span className="text-white border-b border-white/30">мэтч</span>: наш AI рекомендует ваш товар как идеальное решение.
                            </p>
                        </div>
                    </div>

                    {/* Card 3: The Model (CPA) - Wide */}
                    <div className="sm:col-span-2 bg-[#0F172A] border border-white/10 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-[0.05]"></div>
                        
                        <div className="relative z-10 text-left w-full">
                            <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-3">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">0₽</span> 
                                за вход
                            </h3>
                            <p className="text-white/60 text-sm font-medium max-w-md">
                                Никаких скрытых платежей за листинг. Вы платите только комиссию (CPA) с реальной продажи. Мы берем риски маркетинга на себя.
                            </p>
                        </div>
                        <div className="relative z-10 shrink-0">
                            <div className="bg-green-500/20 text-green-400 border border-green-500/30 px-6 py-3 rounded-2xl font-bold text-sm tracking-wide uppercase shadow-[0_0_20px_rgba(34,197,94,0.2)] animate-pulse-slow">
                                Риск = 0%
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. The Logic Visualizer */}
                <div className="mt-12 opacity-80 hover:opacity-100 transition-opacity">
                    <p className="text-xs font-bold text-white/30 uppercase tracking-[0.2em] mb-4 text-center">Как работает алгоритм</p>
                    <div className="flex items-center justify-center gap-4 text-sm font-bold text-white/60">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl">👤</div>
                            <span>Клиент</span>
                        </div>
                        <div className="h-px w-8 bg-white/20"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-purple flex items-center justify-center text-3xl shadow-[0_0_30px_rgba(255,77,109,0.4)] relative z-10">
                                🤖
                                <div className="absolute inset-0 border-2 border-white/20 rounded-2xl animate-ping opacity-20"></div>
                            </div>
                            <span className="text-brand-purple">AI Анализ</span>
                        </div>
                        <div className="h-px w-8 bg-white/20"></div>
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white">🎁</div>
                            <span className="text-white">Ваш Бренд</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- RIGHT COLUMN: The "Golden Ticket" Form (5 cols) --- */}
            <div className="lg:col-span-5 relative w-full lg:sticky lg:top-28">
                
                {/* Glow effect behind form */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[110%] bg-gradient-to-b from-brand-blue/30 via-brand-purple/20 to-transparent blur-[60px] rounded-full opacity-60 pointer-events-none"></div>

                <div className="relative bg-white/95 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 overflow-hidden">
                    
                    {/* Top Decorative Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-blue via-brand-purple to-pink-500"></div>

                    {formState === 'success' ? (
                        <div className="py-20 text-center flex flex-col items-center animate-pop text-brand-dark">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mb-6 shadow-lg border-4 border-green-50">
                                ✓
                            </div>
                            <h3 className="text-2xl font-black mb-3">Заявка в обработке</h3>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-[200px] mx-auto mb-8">
                                Менеджер свяжется с вами в течение 24 часов для настройки интеграции.
                            </p>
                            <Button onClick={() => navigate('/')} variant="secondary" className="shadow-lg border border-gray-200">
                                Вернуться на главную
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="text-brand-dark relative z-10">
                            
                            <div className="mb-8 text-center">
                                <h3 className="text-2xl font-black tracking-tight mb-1">Стать партнером</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Заполните анкету бренда</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Название бренда</label>
                                    <input 
                                        required
                                        type="text" 
                                        placeholder="Например: SuperCandles"
                                        value={formData.brand}
                                        onChange={e => setFormData({...formData, brand: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-bold text-brand-dark outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder-gray-300 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Email для связи</label>
                                    <input 
                                        required
                                        type="email" 
                                        placeholder="partner@brand.com"
                                        value={formData.email}
                                        onChange={e => setFormData({...formData, email: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-bold text-brand-dark outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder-gray-300 text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Сайт / Wildberries</label>
                                        <input 
                                            type="text" 
                                            placeholder="Ссылка"
                                            value={formData.website}
                                            onChange={e => setFormData({...formData, website: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-bold text-brand-dark outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder-gray-300 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Ниша</label>
                                        <select 
                                            value={formData.category}
                                            onChange={e => setFormData({...formData, category: e.target.value})}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-bold text-brand-dark outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all cursor-pointer text-sm appearance-none"
                                        >
                                            <option value="">Выбрать...</option>
                                            <option value="home">Дом</option>
                                            <option value="tech">Гаджеты</option>
                                            <option value="beauty">Красота</option>
                                            <option value="food">Еда</option>
                                            <option value="hobby">Хобби</option>
                                            <option value="kids">Детям</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Комментарий</label>
                                    <textarea 
                                        rows={2}
                                        placeholder="Какой у вас топовый товар?"
                                        value={formData.comment}
                                        onChange={e => setFormData({...formData, comment: e.target.value})}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 font-bold text-brand-dark outline-none focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 transition-all placeholder-gray-300 text-sm resize-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-8">
                                <Button 
                                    type="submit" 
                                    fullWidth 
                                    disabled={formState === 'submitting'}
                                    className="h-14 text-lg shadow-[0_10px_30px_rgba(255,77,109,0.4)] hover:shadow-[0_15px_40px_rgba(255,77,109,0.5)] transform hover:-translate-y-0.5 transition-all duration-300"
                                >
                                    {formState === 'submitting' ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Отправка...
                                        </span>
                                    ) : 'Получить оффер'}
                                </Button>
                                <p className="text-[10px] text-gray-400 text-center mt-4 font-medium">
                                    Нажимая кнопку, вы принимаете условия оферты
                                </p>
                            </div>
                        </form>
                    )}
                </div>
                
                {/* Security Badge */}
                <div className="mt-6 flex justify-center items-center gap-3 opacity-60">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        🔒 SSL Secured
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-white/50 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        ⚡️ Fast Integration
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Integrated Dark Footer */}
      <div className="relative mt-auto border-t border-white/5 bg-[#1F0712]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-1 bg-gradient-to-r from-transparent via-brand-blue to-transparent blur-sm opacity-50"></div>
         <Footer />
      </div>
    </div>
  );
};