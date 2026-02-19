
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

      // --- MOCK LOGIN LOGIC ---
      if ((email === 'admin123' || email === 'admin123@test.test') && password === 'admin123') {
          localStorage.setItem('gifty_auth_token', 'demo_admin');
          await refresh(); 
          setLoading(false);
          return;
      }
      // ------------------------

      setTimeout(() => {
          setLoading(false);
          alert('Для теста: логин admin123, пароль admin123');
      }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#11132B] text-white">
      
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-[340px] px-4 relative z-10 flex flex-col items-center">
        
        {/* Mascot & Logo */}
        <div className="mb-12 text-center flex flex-col items-center">
            <div className="mb-6 scale-110">
                <Mascot className="w-32 h-32 drop-shadow-2xl" emotion="happy" variant="cupid" />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Gifty AI</h1>
            <p className="text-white/50 font-medium text-sm">
                Ваш AI-помощник в мире подарков
            </p>
        </div>

        {/* Primary: Google */}
        <button
            onClick={() => handleLogin('google')}
            className="w-full bg-white text-[#11132B] h-14 rounded-2xl font-bold text-base flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-xl mb-6 relative overflow-hidden group"
        >
            <img src="https://authjs.dev/img/providers/google.svg" alt="" className="w-5 h-5" />
            <span>Войти через Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center w-full gap-4 mb-6 opacity-30">
            <div className="h-px bg-white flex-1"></div>
            <span className="text-xs font-bold uppercase tracking-widest">или</span>
            <div className="h-px bg-white flex-1"></div>
        </div>

        {/* Secondary: Yandex & VK */}
        <div className="flex gap-3 w-full mb-8">
            <button
                onClick={() => handleLogin('yandex')}
                className="flex-1 bg-[#1E2342] hover:bg-[#2A3055] h-12 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5"
            >
                <img src="https://authjs.dev/img/providers/yandex.svg" alt="" className="w-4 h-4 invert opacity-80" />
                <span className="font-bold text-sm">Яндекс</span>
            </button>
            <button
                onClick={() => handleLogin('vk')}
                className="flex-1 bg-[#1E2342] hover:bg-[#2A3055] h-12 rounded-xl flex items-center justify-center gap-2 transition-colors border border-white/5"
            >
                <img src="https://authjs.dev/img/providers/vk.svg" alt="" className="w-5 h-5" />
                <span className="font-bold text-sm">VK</span>
            </button>
        </div>

        {/* Email Fallback */}
        <div className="w-full">
            {!showEmail ? (
                <button 
                    onClick={() => setShowEmail(true)}
                    className="w-full text-center text-white/40 hover:text-white text-sm font-bold transition-colors flex items-center justify-center gap-1 group"
                >
                    Войти по почте <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                </button>
            ) : (
                <form onSubmit={handleEmailSubmit} className="space-y-3 animate-fade-in bg-[#1E2342] p-4 rounded-2xl border border-white/5">
                    <input 
                        type="text" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-[#11132B] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 text-sm font-bold outline-none focus:border-purple-500 transition-colors"
                        placeholder="Логин"
                    />
                    <input 
                        type="password" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-[#11132B] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 text-sm font-bold outline-none focus:border-purple-500 transition-colors"
                        placeholder="Пароль"
                    />
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-bold text-sm transition-colors"
                    >
                        {loading ? '...' : 'Войти'}
                    </button>
                </form>
            )}
        </div>

        {/* Footer Text */}
        <div className="mt-auto pt-10 text-center">
            <p className="text-[10px] text-white/20 max-w-[200px] mx-auto leading-relaxed">
                Продолжая, вы принимаете <br/>
                <a href="#" className="hover:text-white/50 underline">Условия использования</a> и <a href="#" className="hover:text-white/50 underline">Политику конфиденциальности</a>
            </p>
        </div>

      </div>
    </div>
  );
};
