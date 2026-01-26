import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { api } from '../api';
import { useAuth } from '../components/AuthContext';
import { Mascot } from '../components/Mascot';

export const Login: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // If user is already logged in, go to home or return_to
  React.useEffect(() => {
      if (user) navigate('/');
  }, [user, navigate]);

  const from = location.state?.from || '/';

  const handleLogin = (provider: string) => {
    const loginUrl = api.auth.getLoginUrl(provider, from);
    window.location.assign(loginUrl);
  };

  const providers = [
    { id: 'google', name: 'Google', icon: 'https://authjs.dev/img/providers/google.svg', color: 'hover:bg-gray-50' },
    { id: 'yandex', name: 'Яндекс', icon: 'https://authjs.dev/img/providers/yandex.svg', color: 'hover:bg-red-50' },
    { id: 'vk', name: 'ВКонтакте', icon: 'https://authjs.dev/img/providers/vk.svg', color: 'hover:bg-blue-50' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 bg-brand-dark -z-20"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-brand-blue/30 rounded-full blur-[100px] animate-blob"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-brand-purple/30 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 shadow-2xl animate-pop border border-white/20 text-center relative">
        
        {/* Exit Button */}
        <button 
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-all active:scale-90"
            title="На главную"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
        </button>

        <div className="mb-8">
            <Logo className="justify-center scale-125" />
        </div>

        <div className="mb-8">
            <Mascot className="w-32 h-32 mx-auto" emotion="happy" accessory="santa-hat" variant="cupid" />
            <h1 className="text-3xl font-black text-brand-dark mt-4 tracking-tight">
                Войдите или зарегистрируйтесь
            </h1>
            <p className="text-gray-500 mt-2 font-medium">
                Чтобы сохранять подарки и получать лучшие рекомендации
            </p>
        </div>

        <div className="space-y-3">
            {providers.map((p) => (
                <button
                    key={p.id}
                    onClick={() => handleLogin(p.id)}
                    className={`w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 p-4 rounded-2xl font-bold text-gray-700 transition-all active:scale-[0.98] shadow-sm ${p.color}`}
                >
                    <img src={p.icon} alt={p.name} className="w-6 h-6" />
                    Продолжить с {p.name}
                </button>
            ))}
        </div>

        <div className="mt-8">
            <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                Нажимая на кнопку входа, вы соглашаетесь с <a href="#" className="underline hover:text-brand-blue">Условиями использования</a> и <a href="#" className="underline hover:text-brand-blue">Политикой конфиденциальности</a>
            </p>
        </div>
      </div>
    </div>
  );
};