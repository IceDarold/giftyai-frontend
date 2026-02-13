
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { api } from '../api';
import { useAuth } from '../components/AuthContext';
import { Mascot } from '../components/Mascot';

export const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refresh } = useAuth();
  
  // Local state for Email Auth
  const [showEmail, setShowEmail] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
      if (user) navigate('/');
  }, [user, navigate]);

  const from = location.state?.from || '/';

  const handleLogin = (provider: string) => {
    const loginUrl = api.auth.getLoginUrl(provider, from);
    window.location.assign(loginUrl);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!email || !password) return;
      
      setLoading(true);

      // --- MOCK LOGIN LOGIC FOR TESTING ---
      // Supports both 'admin123' and full email for convenience
      if ((email === 'admin123' || email === 'admin123@test.test') && password === 'admin123') {
          localStorage.setItem('gifty_auth_token', 'demo_admin');
          await refresh(); // Force AuthContext to reload user
          setLoading(false);
          return;
      }
      // ------------------------------------

      // Simulate API delay for prototype interaction
      setTimeout(() => {
          setLoading(false);
          // In a real app: await api.auth.login(email, password);
          alert('Для теста используйте логин: admin123, пароль: admin123');
      }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#0F172A] selection:bg-brand-pink selection:text-white">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-b from-brand-blue/20 to-brand-purple/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/80 to-transparent"></div>
      </div>

      <div className="w-full max-w-sm px-6 relative z-10 flex flex-col items-center">
        
        {/* Brand Area */}
        <div className="mb-10 text-center scale-110">
            <Mascot className="w-40 h-40 mx-auto mb-6 drop-shadow-2xl" emotion="happy" variant="cupid" />
            <Logo className="justify-center scale-125 mb-3" variant="white" />
            <p className="text-white/60 font-medium text-sm tracking-wide">
                Ваш AI-помощник в мире подарков
            </p>
        </div>

        {/* Priority Auth: GOOGLE */}
        <div className="w-full space-y-4 mb-6">
            <button
                onClick={() => handleLogin('google')}
                className="group relative w-full flex items-center justify-center gap-4 bg-white hover:bg-gray-50 text-slate-900 p-4 rounded-[1.5rem] font-black text-lg transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
                <img src="https://authjs.dev/img/providers/google.svg" alt="Google" className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span>Войти через Google</span>
            </button>
        </div>

        {/* Secondary Options Divider */}
        <div className="w-full flex items-center gap-4 mb-6 opacity-30">
            <div className="h-px bg-white flex-1"></div>
            <span className="text-xs font-bold text-white uppercase tracking-widest">или</span>
            <div className="h-px bg-white flex-1"></div>
        </div>

        {/* Secondary Buttons */}
        <div className="flex gap-4 w-full justify-center mb-6">
            <button
                onClick={() => handleLogin('yandex')}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl font-bold text-white text-sm transition-all hover:border-white/30"
            >
                <img src="https://authjs.dev/img/providers/yandex.svg" alt="Yandex" className="w-5 h-5 invert" />
                <span>Яндекс</span>
            </button>
            <button
                onClick={() => handleLogin('vk')}
                className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 p-3 rounded-2xl font-bold text-white text-sm transition-all hover:border-white/30"
            >
                <img src="https://authjs.dev/img/providers/vk.svg" alt="VK" className="w-5 h-5" />
                <span>ВК</span>
            </button>
        </div>

        {/* Email Login Section */}
        <div className="w-full transition-all duration-300">
            {!showEmail ? (
                <button 
                    onClick={() => setShowEmail(true)}
                    className="w-full py-2 text-center text-white/40 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 group"
                >
                    <span>Войти по почте</span>
                    <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                </button>
            ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-3 animate-pop bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-md">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase ml-2">Email или Логин</label>
                        <input 
                            type="text" 
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-brand-pink/50 transition-all font-bold text-sm"
                            placeholder="admin123"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-white/40 uppercase ml-2">Пароль</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-brand-pink/50 transition-all font-bold text-sm"
                            placeholder="••••••••"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white text-brand-dark hover:bg-gray-200 py-3 rounded-xl font-black text-sm shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                    <button 
                        type="button"
                        onClick={() => setShowEmail(false)}
                        className="w-full text-center text-white/30 hover:text-white text-[10px] font-bold uppercase tracking-widest mt-2"
                    >
                        Отмена
                    </button>
                </form>
            )}
        </div>

        {/* Footer */}
        <p className="mt-8 text-[10px] text-white/30 text-center max-w-xs leading-relaxed">
            Продолжая, вы принимаете <br/>
            <a href="#" className="underline hover:text-white transition-colors">Условия использования</a> и <a href="#" className="underline hover:text-white transition-colors">Политику конфиденциальности</a>
        </p>
      </div>
    </div>
  );
};
